import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

export const Reports: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">
            TODO: Implement reporting and analytics functionality
          </p>
        </CardContent>
      </Card>
    </div>
  );
};