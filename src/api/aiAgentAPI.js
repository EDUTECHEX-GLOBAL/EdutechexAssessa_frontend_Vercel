// Make sure your aiAgentAPI.js uses the environment variable
import axios from "axios";

const aiAgentAPI = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "https://edutechexassessa-backend-render.onrender.com/api/ai-agent",
});

export default aiAgentAPI;