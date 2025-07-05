import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, Download, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { documentService, Document } from '../services/documentService';
import { orderService } from '../services/orderService';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import toast from 'react-hot-toast';

export const Documents: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [showRejectionInput, setShowRejectionInput] = useState<string | null>(null); // Stores doc ID for which input is shown

  const { data: ordersData, isLoading: ordersLoading } = useQuery(
    'user-orders-for-documents',
    () => orderService.getUserOrders(),
    { enabled: !!user }
  );

  const { data: documentsData, isLoading: documentsLoading } = useQuery(
    ['documents', selectedOrder],
    () => documentService.getDocumentsByOrder(selectedOrder!),
    { enabled: !!selectedOrder }
  );

  const uploadMutation = useMutation(
    (data: { orderId: string; documentType: string; file: File }) =>
      documentService.uploadDocument(data.orderId, data.documentType, data.file, () => {}),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['documents', selectedOrder]);
        toast.success('Document uploaded successfully');
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to upload document');
      },
    }
  );

  const updateStatusMutation = useMutation(
    (data: { documentId: string; status: 'approved' | 'rejected'; rejectionReason?: string }) =>
      documentService.updateDocumentStatus(data.documentId, data.status, data.rejectionReason),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['documents', selectedOrder]);
        toast.success('Document status updated successfully');
        setShowRejectionInput(null);
        setRejectionReason('');
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to update document status');
      },
    }
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (!selectedOrder) {
        toast.error('Please select an order first.');
        return;
      }
      acceptedFiles.forEach((file) => {
        // For simplicity, using a generic document type. This could be a user input.
        uploadMutation.mutate({ orderId: selectedOrder, documentType: 'General', file });
      });
    },
    [selectedOrder, uploadMutation]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'application/pdf': [] },
    maxSize: 15 * 1024 * 1024,
  });

  const handleApprove = (documentId: string) => {
    updateStatusMutation.mutate({ documentId, status: 'approved' });
  };

  const handleRejectClick = (documentId: string) => {
    setShowRejectionInput(documentId);
  };

  const handleRejectConfirm = (documentId: string) => {
    if (!rejectionReason.trim()) {
      toast.error('Rejection reason cannot be empty.');
      return;
    }
    updateStatusMutation.mutate({ documentId, status: 'rejected', rejectionReason });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'danger';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Document Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <h3 className="font-semibold mb-2">Select an Order</h3>
              {ordersLoading ? <LoadingSpinner /> : (
                <select
                  className="block w-full rounded-md border-gray-300 shadow-sm"
                  onChange={(e) => setSelectedOrder(e.target.value)}
                  value={selectedOrder || ''}
                >
                  <option value="" disabled>Select an order</option>
                  {ordersData?.orders.map(order => (
                    <option key={order.id} value={order.id}>
                      {order.orderNumber} - {order.service?.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="md:col-span-2">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                  ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
              >
                <input {...getInputProps()} />
                <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  {isDragActive ? 'Drop the files here ...' : 'Drag & drop files here, or click to select files'}
                </p>
                <p className="text-xs text-gray-500">PDF, PNG, JPG up to 15MB</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedOrder && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Documents</CardTitle>
          </CardHeader>
          <CardContent>
            {documentsLoading ? <LoadingSpinner /> : (
              <ul className="space-y-3">
                {documentsData?.documents.length === 0 ? (
                  <li className="text-center text-gray-500 py-4">
                    No documents uploaded for this order yet.
                  </li>
                ) : (
                  documentsData?.documents.map((doc) => (
                    <li key={doc.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FileText className="h-6 w-6 text-gray-500 mr-3" />
                          <div>
                            <p className="font-medium">{doc.original_file_name}</p>
                            <p className="text-sm text-gray-500">
                              {(doc.file_size / 1024 / 1024).toFixed(2)} MB - {doc.document_type}
                            </p>
                            {doc.status === 'rejected' && doc.rejection_reason && (
                              <p className="text-xs text-red-500 mt-1">Reason: {doc.rejection_reason}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={getStatusBadgeVariant(doc.status)}>{doc.status}</Badge>
                          <Button size="sm" variant="outline" onClick={() => documentService.downloadDocument(doc.id)}>
                            <Download className="h-4 w-4" />
                          </Button>
                          {user?.role === 'Admin' && doc.status === 'pending' && (
                            <>
                              <Button size="sm" variant="success" onClick={() => handleApprove(doc.id)} isLoading={updateStatusMutation.isLoading}>
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="danger" onClick={() => handleRejectClick(doc.id)}>
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                      {user?.role === 'Admin' && showRejectionInput === doc.id && (
                        <div className="mt-3 flex space-x-2">
                          <Input
                            placeholder="Rejection reason"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="flex-1"
                          />
                          <Button size="sm" onClick={() => handleRejectConfirm(doc.id)} isLoading={updateStatusMutation.isLoading}>
                            Confirm Reject
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setShowRejectionInput(null)}>
                            Cancel
                          </Button>
                        </div>
                      )}
                    </li>
                  ))
                )}
              </ul>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
