import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

export const Documents: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">
            TODO: Implement document upload and management functionality
          </p>
        </CardContent>
      </Card>
    </div>
  );
};