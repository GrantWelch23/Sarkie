import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// User Authentication
export const registerUser = (userData) => api.post("/auth/register", userData);
export const loginUser = (loginData) => api.post("/login", loginData);

// Supplements API
export const addSupplement = (supplementData) => api.post("/supplements", supplementData);
export const getUserSupplements = (userId) => api.get(`/supplements/${userId}`);
export const updateSupplement = (supplementId, updatedData) => api.put(`/supplements/${supplementId}`, updatedData);
export const deleteSupplement = (supplementId) => api.delete(`/supplements/${supplementId}`);

// Effects API
export const addEffect = (effectData) => api.post("/effects", effectData);
export const getSupplementEffects = (supplementId) => api.get(`/effects/${supplementId}`);
export const deleteEffect = (effectId) => api.delete(`/effects/${effectId}`);

// AI Chat API
export const chatWithSark = (userMessage) =>
  api.post("/chat", { message: userMessage });

