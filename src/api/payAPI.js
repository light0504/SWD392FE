import apiClient from './api';

export const generateVietQR = async ({ amount, addInfo }) => {
  try {
    const response = await apiClient.post('/VietQR/GenerateQR', {
      amount,
      addInfo
    });
    return response.data;
  } catch (error) {
    console.error('Error generating VietQR:', error);
    throw error;
  }
};

export const createPaymentURL = async ({ orderId, orderType }) => {
  try {
    const response = await apiClient.post('/Payment/createPaymentURL', {
      orderId,
      orderType
    });
    return response.data;
  } catch (error) {
    console.error('Error creating payment URL:', error);
    throw error;
  }
};
