const API_BASE_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:5001"
    : "https://up-text-backend.onrender.com"

export default API_BASE_URL