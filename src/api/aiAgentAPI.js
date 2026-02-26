import axios from "axios";

// IMPORTANT: Always append /api/ai-agent to the base url
const baseURL = process.env.REACT_APP_API_URL 
  ? `${process.env.REACT_APP_API_URL}/api/ai-agent`
  : "https://edutechexassessa-backend-render.onrender.com/api/ai-agent";

const aiAgentAPI = axios.create({
  baseURL: baseURL,
});

// Add request interceptor to verify the full URL being called
aiAgentAPI.interceptors.request.use(request => {
  console.log('Final URL:', request.baseURL + request.url);
  return request;
});

export default aiAgentAPI;