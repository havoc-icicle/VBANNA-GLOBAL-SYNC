import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { apiService } from '../../services/api';
import toast from 'react-hot-toast';

interface Country {
  id: string;
  name: string;
  code: string;
  taxRate: number;
  taxName: string;
  currency: string;
  timezone: string;
  complianceRequirements: Record<string, any>;
  regulatoryBodies: string[];
  isActive: boolean;
}

export const CountryManagement: React.FC = () => {
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const queryClient = useQueryClient();

  const { data: countriesData, isLoading } = useQuery(
    'countries',
    () => apiService.get('/countries')
  );

  const createMutation = useMutation(
    (data: Partial<Country>) => apiService.post('/countries', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('countries');
        setIsCreating(false);
        toast.success('Country created successfully');
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to create country');
      },
    }
  );

  const updateMutation = useMutation(
    ({ id, data }: { id: string; data: Partial<Country> }) =>
      apiService.put(`/countries/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('countries');
        setEditingCountry(null);
        toast.success('Country updated successfully');
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to update country');
      },
    }
  );

  const deleteMutation = useMutation(
    (id: string) => apiService.delete(`/countries/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('countries');
        toast.success('Country deactivated successfully');
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to deactivate country');
      },
    }
  );

  const handleEdit = (country: Country) => {
    setEditingCountry({ ...country });
  };

  const handleSave = (countryData: Partial<Country>) => {
    if (editingCountry) {
      updateMutation.mutate({ id: editingCountry.id, data: countryData });
    } else {
      createMutation.mutate(countryData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to deactivate this country?')) {
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
          <h1 className="text-2xl font-bold text-gray-900">Country Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Configure country-specific tax rates, compliance requirements, and regulatory settings
          </p>
        </div>
        <Button
          onClick={() => setIsCreating(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Country
        </Button>
      </div>

      {/* Create Form */}
      {isCreating && (
        <CountryForm
          onSave={handleSave}
          onCancel={() => setIsCreating(false)}
          isLoading={createMutation.isLoading}
        />
      )}

      {/* Countries List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {countriesData?.countries.map((country: Country) => (
          <Card key={country.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <span className="text-2xl mr-2">{country.code}</span>
                  {country.name}
                </CardTitle>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(country)}
                    leftIcon={<Edit className="w-4 h-4" />}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(country.id)}
                    leftIcon={<Trash2 className="w-4 h-4" />}
                  >
                    Deactivate
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {editingCountry?.id === country.id ? (
                <CountryForm
                  country={editingCountry}
                  onSave={handleSave}
                  onCancel={() => setEditingCountry(null)}
                  isLoading={updateMutation.isLoading}
                />
              ) : (
                <CountryDetails country={country} />
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

const CountryDetails: React.FC<{ country: Country }> = ({ country }) => (
  <div className="space-y-3">
    <div className="grid grid-cols-2 gap-4 text-sm">
      <div>
        <span className="font-medium text-gray-600">Tax Rate:</span>
        <p>{country.taxRate}% ({country.taxName})</p>
      </div>
      <div>
        <span className="font-medium text-gray-600">Currency:</span>
        <p>{country.currency}</p>
      </div>
      <div>
        <span className="font-medium text-gray-600">Timezone:</span>
        <p>{country.timezone}</p>
      </div>
      <div>
        <span className="font-medium text-gray-600">Status:</span>
        <p className={country.isActive ? 'text-green-600' : 'text-red-600'}>
          {country.isActive ? 'Active' : 'Inactive'}
        </p>
      </div>
    </div>
    
    {country.regulatoryBodies.length > 0 && (
      <div>
        <span className="font-medium text-gray-600">Regulatory Bodies:</span>
        <div className="flex flex-wrap gap-1 mt-1">
          {country.regulatoryBodies.map((body, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
            >
              {body}
            </span>
          ))}
        </div>
      </div>
    )}
  </div>
);

const CountryForm: React.FC<{
  country?: Country;
  onSave: (data: Partial<Country>) => void;
  onCancel: () => void;
  isLoading: boolean;
}> = ({ country, onSave, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    name: country?.name || '',
    code: country?.code || '',
    taxRate: country?.taxRate || 0,
    taxName: country?.taxName || '',
    currency: country?.currency || '',
    timezone: country?.timezone || '',
    complianceRequirements: country?.complianceRequirements || {},
    regulatoryBodies: country?.regulatoryBodies || [],
    isActive: country?.isActive ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleRegulatoryBodiesChange = (value: string) => {
    const bodies = value.split(',').map(body => body.trim()).filter(Boolean);
    setFormData({ ...formData, regulatoryBodies: bodies });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Country Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <Input
          label="Country Code"
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
          maxLength={3}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Tax Rate (%)"
          type="number"
          step="0.01"
          min="0"
          max="100"
          value={formData.taxRate}
          onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) })}
          required
        />
        <Input
          label="Tax Name"
          value={formData.taxName}
          onChange={(e) => setFormData({ ...formData, taxName: e.target.value })}
          placeholder="e.g., GST, VAT"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Currency"
          value={formData.currency}
          onChange={(e) => setFormData({ ...formData, currency: e.target.value.toUpperCase() })}
          maxLength={3}
          placeholder="e.g., SGD, USD"
          required
        />
        <Input
          label="Timezone"
          value={formData.timezone}
          onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
          placeholder="e.g., Asia/Singapore"
          required
        />
      </div>

      <Input
        label="Regulatory Bodies"
        value={formData.regulatoryBodies.join(', ')}
        onChange={(e) => handleRegulatoryBodiesChange(e.target.value)}
        placeholder="Enter regulatory bodies separated by commas"
        helperText="e.g., ACRA, MOM, MAS"
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