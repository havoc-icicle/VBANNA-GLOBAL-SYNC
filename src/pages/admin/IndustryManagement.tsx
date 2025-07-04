import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { apiService } from '../../services/api';
import toast from 'react-hot-toast';

interface Industry {
  id: string;
  name: string;
  description?: string;
  specificRequirements: Record<string, any>;
  questionnaireFields: string[];
  complianceRequirements: string[];
  isActive: boolean;
}

export const IndustryManagement: React.FC = () => {
  const [editingIndustry, setEditingIndustry] = useState<Industry | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const queryClient = useQueryClient();

  const { data: industriesData, isLoading } = useQuery(
    'industries',
    () => apiService.get('/industries')
  );

  const createMutation = useMutation(
    (data: Partial<Industry>) => apiService.post('/industries', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('industries');
        setIsCreating(false);
        toast.success('Industry created successfully');
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to create industry');
      },
    }
  );

  const updateMutation = useMutation(
    ({ id, data }: { id: string; data: Partial<Industry> }) =>
      apiService.put(`/industries/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('industries');
        setEditingIndustry(null);
        toast.success('Industry updated successfully');
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to update industry');
      },
    }
  );

  const deleteMutation = useMutation(
    (id: string) => apiService.delete(`/industries/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('industries');
        toast.success('Industry deactivated successfully');
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to deactivate industry');
      },
    }
  );

  const handleEdit = (industry: Industry) => {
    setEditingIndustry({ ...industry });
  };

  const handleSave = (industryData: Partial<Industry>) => {
    if (editingIndustry) {
      updateMutation.mutate({ id: editingIndustry.id, data: industryData });
    } else {
      createMutation.mutate(industryData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to deactivate this industry?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Industry Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Configure industry-specific requirements, questionnaire fields, and compliance settings
          </p>
        </div>
        <Button
          onClick={() => setIsCreating(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Industry
        </Button>
      </div>

      {/* Create Form */}
      {isCreating && (
        <IndustryForm
          onSave={handleSave}
          onCancel={() => setIsCreating(false)}
          isLoading={createMutation.isLoading}
        />
      )}

      {/* Industries List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {industriesData?.industries.map((industry: Industry) => (
          <Card key={industry.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{industry.name}</CardTitle>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(industry)}
                    leftIcon={<Edit className="w-4 h-4" />}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(industry.id)}
                    leftIcon={<Trash2 className="w-4 h-4" />}
                  >
                    Deactivate
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {editingIndustry?.id === industry.id ? (
                <IndustryForm
                  industry={editingIndustry}
                  onSave={handleSave}
                  onCancel={() => setEditingIndustry(null)}
                  isLoading={updateMutation.isLoading}
                />
              ) : (
                <IndustryDetails industry={industry} />
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

const IndustryDetails: React.FC<{ industry: Industry }> = ({ industry }) => (
  <div className="space-y-3">
    {industry.description && (
      <div>
        <span className="font-medium text-gray-600">Description:</span>
        <p className="text-sm text-gray-700">{industry.description}</p>
      </div>
    )}
    
    <div className="grid grid-cols-1 gap-4 text-sm">
      <div>
        <span className="font-medium text-gray-600">Status:</span>
        <p className={industry.isActive ? 'text-green-600' : 'text-red-600'}>
          {industry.isActive ? 'Active' : 'Inactive'}
        </p>
      </div>
    </div>
    
    {industry.questionnaireFields.length > 0 && (
      <div>
        <span className="font-medium text-gray-600">Questionnaire Fields:</span>
        <div className="flex flex-wrap gap-1 mt-1">
          {industry.questionnaireFields.map((field, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded"
            >
              {field}
            </span>
          ))}
        </div>
      </div>
    )}

    {industry.complianceRequirements.length > 0 && (
      <div>
        <span className="font-medium text-gray-600">Compliance Requirements:</span>
        <div className="flex flex-wrap gap-1 mt-1">
          {industry.complianceRequirements.map((req, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded"
            >
              {req}
            </span>
          ))}
        </div>
      </div>
    )}
  </div>
);

const IndustryForm: React.FC<{
  industry?: Industry;
  onSave: (data: Partial<Industry>) => void;
  onCancel: () => void;
  isLoading: boolean;
}> = ({ industry, onSave, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    name: industry?.name || '',
    description: industry?.description || '',
    specificRequirements: industry?.specificRequirements || {},
    questionnaireFields: industry?.questionnaireFields || [],
    complianceRequirements: industry?.complianceRequirements || [],
    isActive: industry?.isActive ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleQuestionnaireFieldsChange = (value: string) => {
    const fields = value.split(',').map(field => field.trim()).filter(Boolean);
    setFormData({ ...formData, questionnaireFields: fields });
  };

  const handleComplianceRequirementsChange = (value: string) => {
    const requirements = value.split(',').map(req => req.trim()).filter(Boolean);
    setFormData({ ...formData, complianceRequirements: requirements });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Industry Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="Brief description of the industry"
        />
      </div>

      <Input
        label="Questionnaire Fields"
        value={formData.questionnaireFields.join(', ')}
        onChange={(e) => handleQuestionnaireFieldsChange(e.target.value)}
        placeholder="Enter fields separated by commas"
        helperText="e.g., crop_types, export_markets, production_capacity"
      />

      <Input
        label="Compliance Requirements"
        value={formData.complianceRequirements.join(', ')}
        onChange={(e) => handleComplianceRequirementsChange(e.target.value)}
        placeholder="Enter requirements separated by commas"
        helperText="e.g., environmental_regulations, quality_standards"
      />

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
          Active
        </label>
      </div>

      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          leftIcon={<X className="w-4 h-4" />}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          isLoading={isLoading}
          leftIcon={<Save className="w-4 h-4" />}
        >
          Save
        </Button>
      </div>
    </form>
  );
};