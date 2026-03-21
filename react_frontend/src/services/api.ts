import axios, { AxiosInstance, AxiosResponse } from 'axios';

class ApiService {
  private api: AxiosInstance;
  private authToken: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          this.clearAuthToken();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }

  clearAuthToken() {
    this.authToken = null;
  }

  // Auth endpoints
  async login(username: string, password: string) {
    const response: AxiosResponse = await this.api.post('/api/auth/login', {
      username,
      password,
    });
    return response.data;
  }

  async register(userData: any) {
    const response: AxiosResponse = await this.api.post('/api/auth/register', userData);
    return response.data;
  }

  async getUserProfile() {
    const response: AxiosResponse = await this.api.get('/api/auth/profile');
    return response.data;
  }

  async updateProfile(userData: any) {
    const response: AxiosResponse = await this.api.put('/api/auth/profile', userData);
    return response.data;
  }

  async changePassword(currentPassword: string, newPassword: string) {
    const response: AxiosResponse = await this.api.post('/api/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return response.data;
  }

  // Recognition endpoints
  async recognizeSign(imageFile: File) {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response: AxiosResponse = await this.api.post('/api/recognize', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async translateTextToSign(text: string, language: string = 'ASL') {
    const response: AxiosResponse = await this.api.post('/api/translate', {
      text,
      language,
    });
    return response.data;
  }

  // Vocabulary endpoints
  async getSignVocabulary(language: string = 'ASL', difficulty?: number, category?: string) {
    const params: any = { language };
    if (difficulty !== undefined) params.difficulty = difficulty;
    if (category) params.category = category;

    const response: AxiosResponse = await this.api.get('/api/signs', { params });
    return response.data;
  }

  // Progress endpoints
  async getUserProgress() {
    const response: AxiosResponse = await this.api.get('/api/progress');
    return response.data;
  }

  // Health check
  async healthCheck() {
    const response: AxiosResponse = await this.api.get('/api/health');
    return response.data;
  }

  // File upload
  async uploadFile(file: File, type: string = 'image') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response: AxiosResponse = await this.api.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Batch operations
  async batchRecognize(imageFiles: File[]) {
    const formData = new FormData();
    imageFiles.forEach((file, index) => {
      formData.append(`images[${index}]`, file);
    });

    const response: AxiosResponse = await this.api.post('/api/batch/recognize', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Learning modules
  async getLearningModules(language?: string, difficulty?: number) {
    const params: any = {};
    if (language) params.language = language;
    if (difficulty !== undefined) params.difficulty = difficulty;

    const response: AxiosResponse = await this.api.get('/api/learning/modules', { params });
    return response.data;
  }

  async getLearningModule(id: number) {
    const response: AxiosResponse = await this.api.get(`/api/learning/modules/${id}`);
    return response.data;
  }

  // Practice tests
  async getPracticeTests(moduleId?: number) {
    const params: any = {};
    if (moduleId) params.module_id = moduleId;

    const response: AxiosResponse = await this.api.get('/api/practice/tests', { params });
    return response.data;
  }

  async submitPracticeTest(testId: number, answers: any[]) {
    const response: AxiosResponse = await this.api.post(`/api/practice/tests/${testId}/submit`, {
      answers,
    });
    return response.data;
  }

  // Offline mode
  async getOfflineData() {
    const response: AxiosResponse = await this.api.get('/api/offline/data');
    return response.data;
  }

  // Analytics
  async getAnalytics(timeRange: string = '7d') {
    const response: AxiosResponse = await this.api.get('/api/analytics', {
      params: { time_range: timeRange },
    });
    return response.data;
  }
}

export const apiService = new ApiService();
