import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

export const Questionnaire: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Service Questionnaire</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Questionnaire for service ID: {serviceId}</p>
          <p className="text-gray-500 mt-4">
            TODO: Implement dynamic questionnaire based on service, industry, and country
          </p>
        </CardContent>
      </Card>
    </div>
  );
};