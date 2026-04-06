import axios from 'axios';
import type { AuthResponse, Scrapbook, Page } from '../types';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  register: (data: { username: string; email: string; password: string }) =>
    api.post<AuthResponse>('/auth/register', data).then((r) => r.data),
  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data).then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),
};

export const scrapbooks = {
  list: () => api.get<Scrapbook[]>('/scrapbooks').then((r) => r.data),
  listPublic: () => axios.get<Scrapbook[]>('/api/public/scrapbooks').then((r) => r.data),
  get: (id: number) => api.get<Scrapbook>(`/scrapbooks/${id}`).then((r) => r.data),
  create: (data: { title: string; description: string; cover_color: string; is_public: boolean }) =>
    api.post<Scrapbook>('/scrapbooks', data).then((r) => r.data),
  delete: (id: number) => api.delete(`/scrapbooks/${id}`).then((r) => r.data),
};

export const pages = {
  list: (scrapbookId: number) =>
    api.get<Page[]>(`/scrapbooks/${scrapbookId}/pages`).then((r) => r.data),
  create: (
    scrapbookId: number,
    data: { title: string; content: string; image_url: string; page_order: number }
  ) => api.post<Page>(`/scrapbooks/${scrapbookId}/pages`, data).then((r) => r.data),
  delete: (scrapbookId: number, pageId: number) =>
    api.delete(`/scrapbooks/${scrapbookId}/pages/${pageId}`).then((r) => r.data),
};
