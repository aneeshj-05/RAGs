import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export interface UploadResponse {
  status: string;
  filename: string;
  chunks: number;
}

export interface SourceMetadata {
  chunk?: number;
  source?: string;
  [key: string]: any;
}

export interface AskResponse {
  answer: string;
  sources: SourceMetadata[];
}

export interface DocumentItem {
  id: string;
  filename: string;
  chunks: number;
  uploadedAt: string;
}

export const api = {
  async checkHealth(): Promise<boolean> {
    try {
      const response = await axios.get(`${API_BASE_URL}/`, { timeout: 4000 });
      return response.status === 200;
    } catch {
      return false;
    }
  },

  async uploadPdf(file: File, onProgress?: (progress: number) => void): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post<UploadResponse>(`${API_BASE_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentage);
        }
      },
    });

    return response.data;
  },

  async askQuestion(question: string): Promise<AskResponse> {
    const response = await axios.post<AskResponse>(
      `${API_BASE_URL}/ask`,
      null,
      {
        params: { question },
      }
    );
    return response.data;
  },
};
