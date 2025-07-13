import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getToken } from "./localStorageService";

// Types for API responses
export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface QuizOption {
  id: number;
  optionText: string;
  targetTrait?: string;
  scoreValue: number;
  questionId: number;
}

export interface BackendQuizQuestion {
  id: number;
  content: string;
  orderNumber: number;
  dimension: string;
  quizId: number;
  options: QuizOption[];
}

export interface MBTIQuestion {
  id: number;
  content: string;
  type: 'E/I' | 'S/N' | 'T/F' | 'J/P';
  options: Array<{
    id: number;
    text: string;
    value?: number;
  }>;
}

export interface DISCChoice {
  trait: 'D' | 'I' | 'S' | 'C';
  text: string;
}

export interface DISCQuestionSet {
  id: number;
  content: string;
  options: DISCChoice[];
}

export interface Quiz {
  id: number;
  title: string;
  description: string;
  category: Category;
  totalQuestions: number;
}

export interface QuizSubmissionData {
  quizId: number;
  // Remove userId - backend will extract it from JWT token via auth-service
  answers: Record<number, number>; // questionId -> optionId (backend expects this format)
}

export interface QuizResult {
  personalityCode: string;
  nickname?: string;
  keyTraits?: string;
  description: string;
  careerRecommendations?: string;
  scores?: Record<string, number>;
  universityRecommendations?: string;
}

class QuizService {
  private baseURL = 'http://localhost:8080/api/v1/quiz';

  // Client-side cache for better performance
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private readonly DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly QUESTIONS_CACHE_TTL = 10 * 60 * 1000; // 10 minutes for questions

  private getHeaders() {
    const token = getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  // Enhanced cache management
  private getCacheKey(endpoint: string, params?: any): string {
    const paramStr = params ? JSON.stringify(params) : '';
    return `${endpoint}${paramStr}`;
  }

  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      console.log(`Cache hit for: ${key}`);
      return cached.data;
    }
    if (cached) {
      this.cache.delete(key); // Remove expired cache
    }
    return null;
  }

  private setCachedData<T>(key: string, data: T, ttl: number = this.DEFAULT_CACHE_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  private async fetchAPI<T>(endpoint: string, options: AxiosRequestConfig = {}, cacheTtl?: number): Promise<T> {
    // Check cache first for GET requests
    if (!options.method || options.method.toUpperCase() === 'GET') {
      const cacheKey = this.getCacheKey(endpoint, options.params);
      const cachedData = this.getCachedData<T>(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    try {
      const fullUrl = `${this.baseURL}${endpoint}`;
      console.log(`Making API request to: ${fullUrl}`);

      const startTime = performance.now();
      const response: AxiosResponse<T> = await axios({
        url: fullUrl,
        headers: this.getHeaders(),
        timeout: 30000, // 30 second timeout
        ...options,
      });
      const endTime = performance.now();

      console.log(`API call took ${endTime - startTime}ms for: ${endpoint}`);

      // Cache GET responses
      if (!options.method || options.method.toUpperCase() === 'GET') {
        const cacheKey = this.getCacheKey(endpoint, options.params);
        this.setCachedData(cacheKey, response.data, cacheTtl);
      }

      return response.data;
    } catch (error) {
      console.error('API request failed:', error);
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        console.error('Response data:', axiosError.response?.data);
        console.error('Response status:', axiosError.response?.status);
        
        // More detailed error messages based on status codes
        const status = axiosError.response?.status;
        const responseData = axiosError.response?.data;
        
        switch (status) {
          case 401:
            throw new Error('Unauthenticated - Please login again');
          case 403:
            throw new Error('Forbidden - You do not have permission to access this resource');
          case 404:
            throw new Error('Not Found - The requested resource was not found');
          case 500:
            // Extract more specific error message from backend if available
            if (typeof responseData === 'string' && responseData.includes('Unauthenticated')) {
              throw new Error('Internal Server Error - Authentication failed with microservice');
            }
            throw new Error(`Internal Server Error - ${responseData || 'Server encountered an error'}`);
          default:
            throw new Error(`API Error ${axiosError.code}: ${axiosError.message}`);
        }
      }
      throw new Error('Unknown API error occurred');
    }
  }

  // Get all available quiz types (MBTI, DISC) with caching
  async getAvailableQuizTypes(): Promise<{ type: 'MBTI' | 'DISC'; category: Category }[]> {
    const categories = await this.fetchAPI<Category[]>('/categories', {}, this.DEFAULT_CACHE_TTL);
    console.log('Available categories:', categories);

    // Find categories by name instead of hardcoded IDs
    const mbtiCategory = categories.find(c =>
      c.name.toUpperCase().includes('MBTI') ||
      c.name.toUpperCase().includes('MYERS')
    );

    const discCategory = categories.find(c =>
      c.name.toUpperCase().includes('DISC') ||
      c.name.toUpperCase().includes('DOMINANCE')
    );

    const availableTypes: { type: 'MBTI' | 'DISC'; category: Category }[] = [];

    if (mbtiCategory) {
      availableTypes.push({ type: 'MBTI', category: mbtiCategory });
    }

    if (discCategory) {
      availableTypes.push({ type: 'DISC', category: discCategory });
    }

    console.log('Mapped quiz types:', availableTypes);
    return availableTypes;
  }

  // Get quizzes by category with caching
  async getQuizzesByCategory(categoryId: number): Promise<Quiz[]> {
    return this.fetchAPI<Quiz[]>(`/quiz/category/${categoryId}`, {}, this.DEFAULT_CACHE_TTL);
  }

  // Get questions for a specific quiz with aggressive caching
  async getQuestionsByQuizId(quizId: number): Promise<(MBTIQuestion | DISCQuestionSet)[]> {
    console.log(`Fetching questions for quiz ID: ${quizId}`);
    const startTime = performance.now();

    const backendQuestions = await this.fetchAPI<BackendQuizQuestion[]>(
      `/quiz-questions/quiz/${quizId}`,
      {},
      this.QUESTIONS_CACHE_TTL // Cache questions for 10 minutes
    );

    const endTime = performance.now();
    console.log(`API call took ${endTime - startTime} milliseconds for ${backendQuestions.length} questions`);

    // Determine quiz type based on the first question's dimension
    const firstQuestion = backendQuestions[0];
    if (!firstQuestion) return [];

    const isDiscQuiz = firstQuestion.dimension === 'DISC';
    const quizType: 'MBTI' | 'DISC' = isDiscQuiz ? 'DISC' : 'MBTI';

    console.log(`Transforming ${backendQuestions.length} ${quizType} questions`);
    const transformStartTime = performance.now();

    const transformed = this.transformQuestionsForFrontend(backendQuestions, quizType);

    const transformEndTime = performance.now();
    console.log(`Transformation took ${transformEndTime - transformStartTime} milliseconds`);

    return transformed;
  }

  // Optimized transformation with memoization
  private transformationCache = new Map<string, any>();

  transformQuestionsForFrontend(
    backendQuestions: BackendQuizQuestion[],
    type: 'MBTI' | 'DISC'
  ): (MBTIQuestion | DISCQuestionSet)[] {
    // Create a cache key based on questions and type
    const cacheKey = `transform_${type}_${backendQuestions.map(q => q.id).join('_')}`;

    if (this.transformationCache.has(cacheKey)) {
      console.log('Using cached transformation');
      return this.transformationCache.get(cacheKey);
    }

    console.log(`Transforming ${type} questions:`, backendQuestions);

    let result: (MBTIQuestion | DISCQuestionSet)[];

    if (type === 'MBTI') {
      result = backendQuestions.map(q => {
        return {
          id: q.id,
          content: q.content,
          type: this.determineMBTIType(q.dimension),
          options: q.options.map(option => ({
            id: option.id,
            text: option.optionText,
            value: option.scoreValue
          }))
        } as MBTIQuestion;
      });
    } else {
      // DISC questions - group options by question
      result = backendQuestions.map(q => {
        return {
          id: q.id,
          content: q.content,
          options: q.options.map(option => ({
            trait: (option.targetTrait || 'D') as 'D' | 'I' | 'S' | 'C',
            text: option.optionText
          }))
        } as DISCQuestionSet;
      });
    }

    // Cache the transformation result
    this.transformationCache.set(cacheKey, result);

    return result;
  }

  // Helper method to determine MBTI type from dimension
  private determineMBTIType(dimension: string): 'E/I' | 'S/N' | 'T/F' | 'J/P' {
    switch (dimension) {
      case 'E': case 'I': return 'E/I';
      case 'S': case 'N': return 'S/N';
      case 'T': case 'F': return 'T/F';
      case 'J': case 'P': return 'J/P';
      default: return 'E/I'; // fallback
    }
  }

  // Enhanced quiz submission with secure microservices integration
  async submitQuiz(submissionData: QuizSubmissionData): Promise<QuizResult> {
    const { quizId, answers: frontendAnswers } = submissionData;

    // Get backend questions to map answers to optionIds
    const backendQuestions = await this.fetchAPI<BackendQuizQuestion[]>(
      `/quiz-questions/quiz/${quizId}`,
      {},
      this.QUESTIONS_CACHE_TTL
    );

    // Determine quiz type from first question
    const firstQuestion = backendQuestions[0];
    if (!firstQuestion) {
      throw new Error('No questions found for this quiz');
    }

    const quizType: 'MBTI' | 'DISC' = firstQuestion.dimension === 'DISC' ? 'DISC' : 'MBTI';

    // Convert answers to the format expected by backend (questionId -> optionId)
    const formattedAnswers: Record<number, number> = {};

    for (const backendQuestion of backendQuestions) {
      const questionId = backendQuestion.id;
      const answer = frontendAnswers[questionId];

      if (answer) {
        if (quizType === 'MBTI') {
          // For MBTI, find the option that matches the selected text
          const selectedOption = backendQuestion.options.find(opt => opt.optionText === answer);
          if (selectedOption) {
            formattedAnswers[questionId] = selectedOption.id;
          }
        } else if (quizType === 'DISC') {
          // For DISC, handle the most/least selection
          const discAnswer = answer as { most?: 'D' | 'I' | 'S' | 'C', least?: 'D' | 'I' | 'S' | 'C' };

          if (discAnswer.most) {
            // Find the option that matches the "most" selection
            const mostOption = backendQuestion.options.find(opt => opt.targetTrait === discAnswer.most);
            if (mostOption) {
              formattedAnswers[questionId] = mostOption.id;
            }
          }
        }
      }
    }

    // Prepare final submission data (no userId - backend extracts from JWT via microservices)
    const finalSubmissionData = {
      quizId,
      answers: formattedAnswers
    };

    console.log('Submitting quiz with formatted data:', finalSubmissionData);

    try {
      // Submit to backend - JWT token automatically included in headers
      // Backend will:
      // 1. Extract user ID from JWT token via auth-service
      // 2. Calculate personality result
      // 3. Get career recommendations from career-service
      // 4. Get university recommendations from university-service
      // 5. Update user profile in persona-service
      const result = await this.fetchAPI<QuizResult>('/quiz-results/submit', {
        method: 'POST',
        data: finalSubmissionData
      });

      console.log('Quiz result received with microservices data:', result);

      // Cache the result
      const cacheKey = `result_${quizId}`;
      this.setCachedData(cacheKey, result, this.DEFAULT_CACHE_TTL);

      return result;

    } catch (error) {
      console.error('Quiz submission failed:', error);
      throw new Error(`Failed to submit quiz: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get user's quiz results (no need to pass userId - backend gets it from JWT)
  async getUserResults(): Promise<QuizResult[]> {
    return this.fetchAPI<QuizResult[]>('/quiz-results/my-results');
  }

  // Get specific quiz result
  async getQuizResult(resultId: number): Promise<QuizResult> {
    return this.fetchAPI<QuizResult>(`/quiz-results/${resultId}`);
  }

  // Get user's quiz results by email (for parent dashboard)
  async getUserResultsByEmail(email: string): Promise<{
    userId: string;
    email: string;
    fullName: string;
    results: Array<{
      id: number;
      personalityCode: string;
      nickname?: string;
      keyTraits?: string;
      description: string;
      careerRecommendations?: string;
      universityRecommendations?: string;
      scores?: Record<string, number>;
      submittedAt: string;
      quizType: string;
    }>;
  }> {
    try {
      const response = await this.fetchAPI<{
        userId: string;
        email: string;
        totalQuizzesTaken: number;
        quizResults: any[];
      }>(`/quiz-results/user/by-email?email=${encodeURIComponent(email)}`);

      if (!response) {
        throw new Error('No response received from server');
      }

      // Transform the response to match expected format
      return {
        userId: response.userId,
        email: response.email,
        fullName: response.email, // Using email as fullName since it's not provided
        results: response.quizResults?.map(result => ({
          id: result.resultId,
          personalityCode: result.personalityCode || result.resultType,
          nickname: result.personalityName,
          description: result.personalityDescription || '',
          submittedAt: result.timeSubmit,
          quizType: result.resultType,
          // Include additional fields from resultJson if available
          ...(result.resultJson ? JSON.parse(result.resultJson) : {})
        })) || []
      };
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }
}

const quizService = new QuizService();
export default quizService;
