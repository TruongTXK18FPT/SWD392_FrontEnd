import React, { useState, useEffect } from 'react';
import { FaEdit, FaSearch } from 'react-icons/fa';
import Button from '../Button';
import quizService, { QuizData, Category } from '../../services/quizService';
import QuizEditPage from './QuizEditPage';
import '../../styles/Admin.css';

interface QuizManagementProps {
  onAlert: (type: 'success' | 'info' | 'warning' | 'error', message: string) => void;
}

const QuizManagement: React.FC<QuizManagementProps> = ({ onAlert }) => {
  const [quizzes, setQuizzes] = useState<QuizData[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditPage, setShowEditPage] = useState(false);
  const [editingQuizId, setEditingQuizId] = useState<number | null>(null);

  useEffect(() => {
    loadQuizzes();
    loadCategories();
  }, []);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      
      // Get all quizzes from backend using the existing method
      const quizzesData = await quizService.getAllQuizzes();
      
      // Get categories to match with quizzes
      const categoriesData = await quizService.getAllCategories();
      
      // Create quiz list with question quantity from backend
      const quizzesWithQuantity = quizzesData.map(quiz => {
        return {
          id: quiz.id,
          title: quiz.title,
          categoryId: quiz.categoryId,
          description: quiz.description,
          questionQuantity: quiz.questionQuantity,
          categoryName: categoriesData.find(cat => cat.id === quiz.categoryId)?.name
        };
      });

      setQuizzes(quizzesWithQuantity);
    } catch (error: any) {
      onAlert('error', 'Failed to load quizzes: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const categoriesData = await quizService.getAllCategories();
      setCategories(categoriesData);
    } catch (error: any) {
      onAlert('error', 'Failed to load categories: ' + (error.message || 'Unknown error'));
    }
  };

  const handleEditQuiz = (quizId: number) => {
    setEditingQuizId(quizId);
    setShowEditPage(true);
  };

  const handleBackFromEdit = () => {
    setShowEditPage(false);
    setEditingQuizId(null);
    loadQuizzes(); // Reload quizzes when coming back from edit
  };

  const filteredQuizzes = quizzes.filter(quiz =>
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (quiz.categoryName && quiz.categoryName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    quiz.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Show edit page if editing
  if (showEditPage && editingQuizId) {
    return (
      <QuizEditPage
        quizId={editingQuizId}
        onBack={handleBackFromEdit}
        onAlert={onAlert}
      />
    );
  }

  return (
    <div className="management-container">
      <div className="management-header">
        <h2>Quiz Management</h2>
        <div className="quiz-info-badge">
          <span>2 Personality Tests Available for Editing</span>
        </div>
      </div>

      <div className="search-filters">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search quizzes by title, category, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '2rem 0' }}>
          <div className="simple-spinner" />
          <div style={{ marginTop: '1rem', color: '#888', fontSize: '1rem' }}>Đang tải danh sách quiz...</div>
        </div>
      )}

      {!loading && (
        <div className="table-container">
          <table className="management-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Description</th>
                <th>Questions</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuizzes.map((quiz) => (
                <tr key={quiz.id}>
                  <td className="title-cell">
                    <strong>{quiz.title}</strong>
                  </td>
                  <td>
                    <span className="category-badge">
                      {quiz.categoryName}
                    </span>
                  </td>
                  <td className="description-cell">
                    {quiz.description || 'No description'}
                  </td>
                  <td className="questions-cell">
                    <span className="question-count-badge">
                      {quiz.questionQuantity} questions
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        type="button"
                        className="edit-quiz-btn"
                        onClick={() => handleEditQuiz(quiz.id)}
                        disabled={loading}
                        title="Edit Quiz & Questions"
                      >
                        <FaEdit style={{ marginRight: '0.5em' }} /> Edit Quiz
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredQuizzes.length === 0 && !loading && (
            <div className="empty-state">
              {searchTerm ? 'No quizzes found matching your search' : 'No quizzes available'}
            </div>
          )}
        </div>
      )}

      <div className="quiz-management-info">
        <div className="info-card">
          <h3>📝 Quiz Management Guide</h3>
          <ul>
            <li><strong>Edit Quiz:</strong> Click "Edit Quiz" to modify quiz details, questions, and options</li>
            <li><strong>Add Questions:</strong> Use the "Add New Question" button in the edit page</li>
            <li><strong>Question Types:</strong> MBTI quizzes have 3 options per question, DISC quizzes have 4 trait options</li>
            <li><strong>Auto-save:</strong> Changes are saved when you click "Save Changes"</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default QuizManagement;
