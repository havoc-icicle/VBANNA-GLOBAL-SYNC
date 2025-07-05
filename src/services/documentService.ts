import { apiService } from './api';

export interface Document {
  id: string;
  order_id: string;
  uploaded_by: string;
  file_name: string;
  original_file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  document_type: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

class DocumentService {
  async uploadDocument(orderId: string, documentType: string, file: File, onProgress: (progress: number) => void): Promise<{ document: Document }> {
    const formData = new FormData();
    formData.append('orderId', orderId);
    formData.append('documentType', documentType);
    formData.append('file', file);

    return apiService.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
  }

  async getDocumentsByOrder(orderId: string): Promise<{ documents: Document[] }> {
    return apiService.get(`/documents/order/${orderId}`);
  }

  async downloadDocument(documentId: string): Promise<Blob> {
    const response = await apiService.get(`/documents/${documentId}/download`, {
      responseType: 'blob',
    });
    return response as unknown as Blob;
  }

  async updateDocumentStatus(documentId: string, status: 'approved' | 'rejected', rejectionReason?: string): Promise<{ document: Document }> {
    return apiService.put(`/documents/${documentId}/status`, { status, rejectionReason });
  }
}

export const documentService = new DocumentService();
