// lib/api.ts
import axios from "axios";

const BASE_URL = "https://api.example.com";

export const fetchPosts = async () => {
  const response = await axios.get(`${BASE_URL}/posts`);
  return response.data;
};
