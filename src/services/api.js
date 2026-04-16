import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

export const metaApi = {
  getMeta: async () => {
    const { data } = await api.get("/meta");
    return data;
  },
};

export const boardApi = {
  getBoards: async () => {
    const { data } = await api.get("/boards");
    return data;
  },
  getBoard: async (boardId) => {
    const { data } = await api.get(`/boards/${boardId}`);
    return data;
  },
  createBoard: async (payload) => {
    const { data } = await api.post("/boards", payload);
    return data;
  },
};

export const listApi = {
  create: async (payload) => {
    const { data } = await api.post("/lists", payload);
    return data;
  },
  update: async (listId, payload) => {
    const { data } = await api.patch(`/lists/${listId}`, payload);
    return data;
  },
  delete: async (listId) => {
    await api.delete(`/lists/${listId}`);
  },
  reorder: async (payload) => {
    await api.patch("/lists/reorder", payload);
  },
};

export const cardApi = {
  create: async (payload) => {
    const { data } = await api.post("/cards", payload);
    return data;
  },
  update: async (cardId, payload) => {
    const { data } = await api.patch(`/cards/${cardId}`, payload);
    return data;
  },
  delete: async (cardId) => {
    await api.delete(`/cards/${cardId}`);
  },
  move: async (cardId, payload) => {
    await api.patch(`/cards/${cardId}/move`, payload);
  },
  addComment: async (cardId, payload) => {
    const { data } = await api.post(`/cards/${cardId}/comments`, payload);
    return data;
  },
};

export const labelApi = {
  create: async (payload) => {
    const { data } = await api.post("/labels", payload);
    return data;
  },
};

export default api;
