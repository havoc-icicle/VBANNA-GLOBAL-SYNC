import { apiService } from './api';

export interface Question {
  id: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'multiselect' | 'boolean' | 'date';
  question: string;
  options?: string[];
  required: boolean;
  section: string;
  conditional?: string;
}

export interface Questionnaire {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  conditionalLogic: Record<string, any>;
  service: {
    id: string;
    name: string;
    category: string;
    description: string;
  };
}

export interface QuestionnaireResponse {
  id: string;
  isComplete: boolean;
  submittedAt?: string;
}

export interface ServiceRecommendation {
  service: {
    id: string;
    name: string;
    category: string;
    description: string;
    price_min: number;
    price_max: number;
    currency: string;
  };
  confidence: number;
  reasoning: string;
  alternatives: Array<{
    service: any;
    score: number;
  }>;
}

class QuestionnaireService {
  async getActiveQuestionnaire(): Promise<{ questionnaire: Questionnaire }> {
    return apiService.get('/questionnaires/active');
  }

  async submitResponse(
    questionnaireId: string, 
    answers: Record<string, any>, 
    isComplete: boolean = true
  ): Promise<{
    message: string;
    response: QuestionnaireResponse;
    recommendation?: ServiceRecommendation;
  }> {
    return apiService.post('/questionnaires/responses', {
      questionnaireId,
      answers,
      isComplete
    });
  }

  async skipQuestionnaire(): Promise<{ message: string }> {
    return apiService.post('/questionnaires/skip');
  }

  async saveProgress(
    questionnaireId: string, 
    answers: Record<string, any>
  ): Promise<{
    message: string;
    progress: number;
  }> {
    return apiService.post('/questionnaires/progress', {
      questionnaireId,
      answers
    });
  }

  async getProgress(questionnaireId: string): Promise<{
    progress: {
      answers: Record<string, any>;
      progress: number;
      isComplete: boolean;
    } | null;
  }> {
    return apiService.get(`/questionnaires/${questionnaireId}/progress`);
  }
}

export const questionnaireService = new QuestionnaireService();