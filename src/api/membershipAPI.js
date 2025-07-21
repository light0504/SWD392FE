import apiClient from './api';

export const getAllMemberships = async () => {
  try {
    const response = await apiClient.get('/Membership');
    return response.data;
  } catch (error) {
    console.error(`Error fetching membership data:`, error);
    throw error;
  }
};
