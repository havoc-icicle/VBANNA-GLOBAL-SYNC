import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Palette, 
  Clock, 
  DollarSign,
  Star,
  ArrowRight,
  Filter
} from 'lucide-react';
import { serviceService } from '../services/serviceService';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const Services: React.FC = () => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { data: servicesData, isLoading } = useQuery(
    ['services', selectedCategory],
    () => serviceService.getAllServices({
      category: selectedCategory === 'all' ? undefined : selectedCategory as any,
      isActive: true,
    })
  );

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'SGD',
    }).format(amount);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Documentation':
        return <FileText className="w-5 h-5" />;
      case 'Digital':
        return <Palette className="w-5 h-5" />;
      default:
        return <Star className="w-5 h-5" />;
    }
  };

  const categories = [
    { value: 'all', label: 'All Services' },
    { value: 'Documentation', label: 'Documentation Services' },
    { value: 'Digital', label: 'Digital Services' },
  ];

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
          <h1 className="text-2xl font-bold text-gray-900">
            {t('services.title')}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Comprehensive solutions for your global business formation needs
          </p>
        </div>
      </div>

      {/* Category Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <div className="flex space-x-2">
              {categories.map((category) => (
                <Button
                  key={category.value}
                  variant={selectedCategory === category.value ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.value)}
                >
                  {category.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {servicesData?.services.map((service) => (
          <Card key={service.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    {getCategoryIcon(service.category)}
                  </div>
                  <Badge variant="info" size="sm">
                    {service.category}
                  </Badge>
                </div>
              </div>
              <CardTitle className="text-lg">{service.name}</CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-gray-600 text-sm line-clamp-3">
                {service.description}
              </p>

              {/* Pricing */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(service.priceMin, service.currency)} - {formatCurrency(service.priceMax, service.currency)}
                  </span>
                </div>
              </div>

              {/* Turnaround Time */}
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {service.standardTurnaroundDays} days
                  {service.rushTurnaroundDays && (
                    <span className="text-orange-600 ml-1">
                      (Rush: {service.rushTurnaroundDays} days)
                    </span>
                  )}
                </span>
              </div>

              {/* Deliverables */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Key Deliverables:
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {service.deliverables.slice(0, 3).map((deliverable, index) => (
                    <li key={index} className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-2 flex-shrink-0" />
                      {deliverable}
                    </li>
                  ))}
                  {service.deliverables.length > 3 && (
                    <li className="text-blue-600 text-sm">
                      +{service.deliverables.length - 3} more...
                    </li>
                  )}
                </ul>
              </div>

              {/* Revision Policy */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {service.revisionPolicy} revision{service.revisionPolicy > 1 ? 's' : ''} included
                </span>
                {service.rushSurchargePercent && (
                  <Badge variant="warning" size="sm">
                    +{service.rushSurchargePercent}% rush
                  </Badge>
                )}
              </div>

              {/* Action Button */}
              <Link to={`/questionnaire/${service.id}`}>
                <Button className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  {t('services.requestService')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {servicesData?.services.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No services found
            </h3>
            <p className="text-gray-500">
              Try adjusting your filters or check back later.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Service Categories Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-900">
              <FileText className="w-5 h-5 mr-2" />
              {t('services.documentation')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-800 text-sm">
              Professional documentation services including business plans, 
              financial models, KYC preparation, and compliance documentation 
              for global markets.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center text-purple-900">
              <Palette className="w-5 h-5 mr-2" />
              {t('services.digital')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-purple-800 text-sm">
              Complete digital solutions including logo design, website development, 
              digital marketing, and trade lead sourcing to establish your 
              online presence.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};