import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

export const Payments: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">
            TODO: Implement payment processing and invoice management
          </p>
        </CardContent>
      </Card>
    </div>
  );
};