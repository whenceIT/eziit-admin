
import axios from 'axios';

export const fetchCustomers = async () => {
  try {
    const response = await axios.get('http://localhost:5000/api/customers'); 
    return response.data;
  } catch (error) {
    console.error("Error fetching customers:", error);
    throw error;
  }
};
