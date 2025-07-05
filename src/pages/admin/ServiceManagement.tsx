import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Plus, Edit, Trash2, Save, X, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { serviceService } from '../../services/serviceService';
import { Service, Milestone } from '../../types/service';
import toast from 'react-hot-toast';

export const ServiceManagement: React.FC = () => {
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const queryClient = useQueryClient();

  const { data: servicesData, isLoading } = useQuery(
    'services',
    () => serviceService.getAllServices({ isActive: undefined }), // Fetch all services, active or inactive
    { onError: (error) => console.error('Error fetching services:', error) }
  );

  const createMutation = useMutation(
    (data: Partial<Service>) => serviceService.createService(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('services');
        setIsCreating(false);
        toast.success('Service created successfully');
        console.log('[ServiceManagement] Service created, invalidating queries.');
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to create service');
        console.error('[ServiceManagement] Error creating service:', error);
      },
    }
  );

  const updateMutation = useMutation(
    ({ id, data }: { id: string; data: Partial<Service> }) =>
      serviceService.updateService(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('services');
        setEditingService(null);
        toast.success('Service updated successfully');
        console.log('[ServiceManagement] Service updated, invalidating queries.');
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to update service');
        console.error('[ServiceManagement] Error updating service:', error);
      },
    }
  );

  const deleteMutation = useMutation(
    (id: string) => serviceService.deleteService(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('services');
        toast.success('Service deactivated successfully');
        console.log('[ServiceManagement] Service deactivated, invalidating queries.');
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to deactivate service');
        console.error('[ServiceManagement] Error deactivating service:', error);
      },
    }
  );

  const handleEdit = (service: Service) => {
    console.log('[ServiceManagement] Editing service:', service.id);
    setEditingService({ ...service });
  };

  const handleSave = (serviceData: Partial<Service>) => {
    if (editingService) {
      console.log('[ServiceManagement] Saving updated service:', editingService.id, serviceData);
      updateMutation.mutate({ id: editingService.id, data: serviceData });
    } else {
      console.log('[ServiceManagement] Saving new service:', serviceData);
      createMutation.mutate(serviceData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to deactivate this service?')) {
      console.log('[ServiceManagement] Deactivating service:', id);
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
          <h1 className="text-2xl font-bold text-gray-900">Service Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Configure and manage all services offered by VBannaCorp GlobalSync
          </p>
        </div>
        <Button
          onClick={() => {
            setIsCreating(true);
            setEditingService(null);
            console.log('[ServiceManagement] Initiating new service creation.');
          }}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Service
        </Button>
      </div>

      {/* Create/Edit Form */}
      {(isCreating || editingService) && (
        <ServiceForm
          service={editingService || undefined}
          onSave={handleSave}
          onCancel={() => {
            setIsCreating(false);
            setEditingService(null);
            console.log('[ServiceManagement] Cancelling service form.');
          }}
          isLoading={createMutation.isLoading || updateMutation.isLoading}
        />
      )}

      {/* Services List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {servicesData?.services.map((service: Service) => (
          <Card key={service.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{service.name}</CardTitle>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(service)}
                    leftIcon={<Edit className="w-4 h-4" />}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(service.id)}
                    leftIcon={<Trash2 className="w-4 h-4" />}
                  >
                    Deactivate
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ServiceDetails service={service} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

const ServiceDetails: React.FC<{ service: Service }> = ({ service }) => (
  <div className="space-y-3 text-sm">
    <div>
      <span className="font-medium text-gray-600">Category:</span>
      <p>{service.category}</p>
    </div>
    {service.description && (
      <div>
        <span className="font-medium text-gray-600">Description:</span>
        <p>{service.description}</p>
      </div>
    )}
    <div className="grid grid-cols-2 gap-4">
      <div>
        <span className="font-medium text-gray-600">Price Range:</span>
        <p>{service.currency} {service.priceMin} - {service.priceMax}</p>
      </div>
      <div>
        <span className="font-medium text-gray-600">Turnaround:</span>
        <p>{service.standardTurnaroundDays} days (Standard)</p>
        {service.rushTurnaroundDays && (
          <p className="text-orange-600">{service.rushTurnaroundDays} days (Rush)</p>
        )}
      </div>
    </div>
    <div>
      <span className="font-medium text-gray-600">Revisions:</span>
      <p>{service.revisionPolicy} included</p>
    </div>
    <div>
      <span className="font-medium text-gray-600">Rush Available:</span>
      <p>{service.rushAvailable ? 'Yes' : 'No'}</p>
    </div>
    {service.milestoneTemplate && service.milestoneTemplate.length > 0 && (
      <div>
        <span className="font-medium text-gray-600">Milestone Template:</span>
        <ul className="list-disc list-inside ml-2">
          {service.milestoneTemplate.map((milestone, index) => (
            <li key={index}>{milestone.name} ({milestone.estimated_days} days)</li>
          ))}
        </ul>
      </div>
    )}
    {service.features && service.features.length > 0 && (
      <div>
        <span className="font-medium text-gray-600">Features:</span>
        <div className="flex flex-wrap gap-1 mt-1">
          {service.features.map((feature, index) => (
            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
              {feature}
            </span>
          ))}
        </div>
      </div>
    )}
    <div>
      <span className="font-medium text-gray-600">Status:</span>
      <p className={service.isActive ? 'text-green-600' : 'text-red-600'}>
        {service.isActive ? 'Active' : 'Inactive'}
      </p>
    </div>
  </div>
);

const ServiceForm: React.FC<{
  service?: Service;
  onSave: (data: Partial<Service>) => void;
  onCancel: () => void;
  isLoading: boolean;
}> = ({ service, onSave, onCancel, isLoading }) => {
  const [formData, setFormData] = useState<Partial<Service>>({
    name: service?.name || '',
    category: service?.category || 'Documentation',
    description: service?.description || '',
    deliverables: service?.deliverables || [],
    revisionPolicy: service?.revisionPolicy || 1,
    standardTurnaroundDays: service?.standardTurnaroundDays || 1,
    rushTurnaroundDays: service?.rushTurnaroundDays || undefined,
    priceMin: service?.priceMin || 0,
    priceMax: service?.priceMax || 0,
    currency: service?.currency || 'SGD',
    rushSurchargePercent: service?.rushSurchargePercent || undefined,
    isActive: service?.isActive ?? true,
    features: service?.features || [],
    additionalNotes: service?.additionalNotes || '',
    milestoneTemplate: service?.milestoneTemplate || [],
    rushAvailable: service?.rushAvailable ?? false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[ServiceForm] Submitting form with data:', formData);
    onSave(formData);
  };

  const handleArrayChange = (field: keyof Service, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value.split(',').map(item => item.trim()).filter(Boolean),
    }));
  };

  const handleMilestoneChange = (index: number, field: keyof Milestone, value: string) => {
    const newMilestones = [...(formData.milestoneTemplate || [])];
    if (!newMilestones[index]) {
      newMilestones[index] = { name: '', description: '', estimated_days: 0 };
    }
    if (field === 'estimated_days') {
      newMilestones[index][field] = parseInt(value) || 0;
    } else {
      newMilestones[index][field] = value;
    }
    setFormData(prev => ({ ...prev, milestoneTemplate: newMilestones }));
  };

  const addMilestone = () => {
    setFormData(prev => ({
      ...prev,
      milestoneTemplate: [...(prev.milestoneTemplate || []), { name: '', description: '', estimated_days: 0 }],
    }));
  };

  const removeMilestone = (index: number) => {
    setFormData(prev => ({
      ...prev,
      milestoneTemplate: (prev.milestoneTemplate || []).filter((_, i) => i !== index),
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{service ? 'Edit Service' : 'Add New Service'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Service Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as 'Documentation' | 'Digital' })}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            >
              <option value="Documentation">Documentation</option>
              <option value="Digital">Digital</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Brief description of the service"
            />
          </div>
          <Input
            label="Deliverables (comma-separated)"
            value={(formData.deliverables || []).join(', ')}
            onChange={(e) => handleArrayChange('deliverables', e.target.value)}
            helperText="e.g., Executive summary, Financial projections"
          />
          <Input
            label="Features (comma-separated)"
            value={(formData.features || []).join(', ')}
            onChange={(e) => handleArrayChange('features', e.target.value)}
            helperText="e.g., Custom templates, Milestone tracking"
          />
          <Input
            label="Additional Notes"
            value={formData.additionalNotes}
            onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Minimum Price"
              type="number"
              step="0.01"
              value={formData.priceMin}
              onChange={(e) => setFormData({ ...formData, priceMin: parseFloat(e.target.value) })}
              required
            />
            <Input
              label="Maximum Price"
              type="number"
              step="0.01"
              value={formData.priceMax}
              onChange={(e) => setFormData({ ...formData, priceMax: parseFloat(e.target.value) })}
              required
            />
          </div>
          <Input
            label="Currency"
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value.toUpperCase() })}
            maxLength={3}
            placeholder="e.g., SGD, USD"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Standard Turnaround Days"
              type="number"
              value={formData.standardTurnaroundDays}
              onChange={(e) => setFormData({ ...formData, standardTurnaroundDays: parseInt(e.target.value) })}
              required
            />
            <Input
              label="Rush Turnaround Days (Optional)"
              type="number"
              value={formData.rushTurnaroundDays}
              onChange={(e) => setFormData({ ...formData, rushTurnaroundDays: parseInt(e.target.value) || undefined })}
            />
          </div>
          <Input
            label="Revision Policy (Number of revisions included)"
            type="number"
            value={formData.revisionPolicy}
            onChange={(e) => setFormData({ ...formData, revisionPolicy: parseInt(e.target.value) })}
            required
          />
          <Input
            label="Rush Surcharge Percent (Optional)"
            type="number"
            step="0.01"
            value={formData.rushSurchargePercent}
            onChange={(e) => setFormData({ ...formData, rushSurchargePercent: parseFloat(e.target.value) || undefined })}
          />

          {/* Milestone Template */}
          <div>
            <h4 className="text-base font-medium text-gray-900 mb-2">Milestone Template</h4>
            {(formData.milestoneTemplate || []).map((milestone, index) => (
              <div key={index} className="flex items-end space-x-2 mb-3 p-3 border rounded-md bg-gray-50">
                <Input
                  label="Milestone Name"
                  value={milestone.name}
                  onChange={(e) => handleMilestoneChange(index, 'name', e.target.value)}
                  className="flex-1"
                  required
                />
                <Input
                  label="Estimated Days"
                  type="number"
                  value={milestone.estimated_days}
                  onChange={(e) => handleMilestoneChange(index, 'estimated_days', e.target.value)}
                  className="w-24"
                  required
                />
                <Button type="button" variant="danger" size="sm" onClick={() => removeMilestone(index)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addMilestone} leftIcon={<Plus className="w-4 h-4" />}>
              Add Milestone
            </Button>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="rushAvailable"
              checked={formData.rushAvailable}
              onChange={(e) => setFormData({ ...formData, rushAvailable: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="rushAvailable" className="ml-2 text-sm text-gray-700">
              Rush Delivery Available
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
              Active Service
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
              Save Service
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
