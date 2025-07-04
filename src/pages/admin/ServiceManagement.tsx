import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

export const ServiceManagement: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Service Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">
            TODO: Implement service management for admins
          </p>
        </CardContent>
      </Card>
    </div>
  );
};