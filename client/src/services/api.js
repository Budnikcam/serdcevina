import axios from 'axios';

const API_URL = 'http://localhost:5000/api';
const AI_URL = '/ai';

// Токен из localStorage
const getToken = () => localStorage.getItem('token');

// API с авторизацией
export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// AI API
export const aiApi = axios.create({
  baseURL: AI_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Добавляем токен к запросам
api.interceptors.request.use(config => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ===== Аутентификация =====
export const authService = {
  register: async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },
  
  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  
  isAuthenticated: () => !!getToken(),
};

// ===== Пользователи =====
export const userService = {
  // Получить анкеты для свайпа
  getDiscover: async (filters = {}) => {
    const { data } = await api.get('/users/discover', { params: filters });
    return data;
  },
  
  // Получить свой профиль
  getProfile: async () => {
    const { data } = await api.get('/users/me');
    return data;
  },
  
  // Обновить профиль
  updateProfile: async (profileData) => {
    const { data } = await api.put('/users/me', profileData);
    return data;
  },
  
  // Лайкнуть пользователя
  likeUser: async (userId) => {
    const { data } = await api.post(`/users/like/${userId}`);
    return data;
  },
  
  // Пропустить пользователя
  passUser: async (userId) => {
    const { data } = await api.post(`/users/pass/${userId}`);
    return data;
  },
  
  // Получить мэтчи
  getMatches: async () => {
    const { data } = await api.get('/users/matches');
    return data;
  },
  
  // Получить избранное
  getFavorites: async () => {
    const { data } = await api.get('/users/favorites');
    return data;
  },
};

// ===== Сообщения =====
export const messageService = {
  // Получить сообщения матча
  getMessages: async (matchId) => {
    const { data } = await api.get(`/messages/${matchId}`);
    return data;
  },
  
  // Отправить сообщение
  sendMessage: async (matchId, text) => {
    const { data } = await api.post(`/messages/${matchId}`, { text });
    return data;
  },
};

// ===== AI Сервисы =====
export const aiService = {
  analyzePersonality: async (profile) => {
    const { data } = await aiApi.post('/analyze-personality', {
      profile: {
        name: profile.name,
        age: parseInt(profile.age),
        bio: profile.bio,
        interests: profile.interests,
        looking_for: profile.lookingFor || profile.looking_for || '',
      },
      model: 'auto',
    });
    return data;
  },
  
  calculateCompatibility: async (user1, user2) => {
    const { data } = await aiApi.post('/calculate-compatibility', {
      user1: {
        name: user1.name,
        age: user1.age,
        bio: user1.bio,
        interests: user1.interests,
        looking_for: user1.lookingFor || user1.looking_for || '',
      },
      user2: {
        name: user2.name,
        age: user2.age,
        bio: user2.bio,
        interests: user2.interests,
        looking_for: user2.lookingFor || user2.looking_for || '',
      },
      model: 'auto',
    });
    return data;
  },
  
  generateMessage: async (myProfile, theirProfile, context = '') => {
    const { data } = await aiApi.post('/generate-message', {
      my_profile: {
        name: myProfile.name,
        age: myProfile.age,
        bio: myProfile.bio,
        interests: myProfile.interests,
        looking_for: myProfile.lookingFor || '',
      },
      their_profile: {
        name: theirProfile.name,
        age: theirProfile.age,
        bio: theirProfile.bio,
        interests: theirProfile.interests,
        looking_for: theirProfile.lookingFor || '',
      },
      context,
      model: 'auto',
    });
    return data;
  },
};
