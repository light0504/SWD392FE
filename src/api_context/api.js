import axios from "axios";

const API_BASE_URL = "https://localhost:7191/api"; // Thay đổi theo cấu hình của bạn

const getAllService = async (endpoint, params = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${endpoint}`, { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export { getAllService };

const getService = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/Service/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
export { getService };
