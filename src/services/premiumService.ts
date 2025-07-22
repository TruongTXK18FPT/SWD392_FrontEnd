import { PremiumCreateRequest, PremiumResponse, PremiumUpdateRequest } from "@/components/premium/dto/premium.dto";
import instance from "./axiosInstance";
import { SubscriptionRequest, SubscriptionResponse } from "@/components/premium/dto/subscription.dto";

// POST: Create a new premium
export const createPremium = async (
  data: PremiumCreateRequest
): Promise<number> => {
  const response = await instance.post<number>("/premium/premiums", data);
  return response.data;
};

// GET: Retrieve all premiums
export const getPremiums = async (): Promise<PremiumResponse[]> => {
  const response = await instance.get<PremiumResponse[]>("/premium/premiums");
  return response.data;
};

// GET: Get premium by ID
export const getPremium = async (id: number): Promise<PremiumResponse> => {
  const response = await instance.get<PremiumResponse>(`/premium/premiums/${id}`);
  return response.data;
};

// PATCH: Update premium
export const updatePremium = async (
  id: number,
  data: PremiumUpdateRequest
): Promise<PremiumResponse> => {
  const response = await instance.patch<PremiumResponse>(
    `/premium/premiums/${id}`,
    data
  );
  return response.data;
};

// GET: Fetch subscriptions with optional filters
export const getSubscriptions = async (params: {
  uid?: string;
  premiumId?: number;
  status?: string;
  from?: string; // ISO date string
  to?: string;   // ISO date string
}): Promise<SubscriptionResponse[]> => {
  try {
    const response = await instance.get<SubscriptionResponse[]>("/premium/subscriptions", { 
      params,
      validateStatus: (status) => status < 500 // Don't throw for 4xx errors
    });
    
    if (response.status === 200) {
      return response.data;
    } else {
      console.error('Unexpected response status when fetching subscriptions:', response.status);
      return [];
    }
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    throw error; // Re-throw to be handled by the caller
  }
};

// POST: Create a subscription
export const createSubscription = async (
  data: SubscriptionRequest
): Promise<number> => {
  const response = await instance.post<number>("/premium/subscriptions", data);
  return response.data;
};
