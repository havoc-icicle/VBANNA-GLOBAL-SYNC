import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

export const TradeLeads: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Trade Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">
            TODO: Implement trade lead sourcing and management functionality
          </p>
        </CardContent>
      </Card>
    </div>
  );
};