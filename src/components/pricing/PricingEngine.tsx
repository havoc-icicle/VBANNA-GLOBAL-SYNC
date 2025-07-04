import React from 'react';

interface PricingCalculation {
  basePrice: number;
  discount: number;
  surcharge: number;
  taxAmount: number;
  totalPrice: number;
  currency: string;
}

interface PricingEngineProps {
  servicePrice: number;
  isMultipleServices: boolean;
  isRushDelivery: boolean;
  country: string;
  currency: string;
  onCalculationChange: (calculation: PricingCalculation) => void;
}

export const PricingEngine: React.FC<PricingEngineProps> = ({
  servicePrice,
  isMultipleServices,
  isRushDelivery,
  country,
  currency,
  onCalculationChange,
}) => {
  // Tax rates by country
  const taxRates = {
    'Singapore': 0.09, // 9% GST
    'Dubai': 0.05, // 5% VAT
    'Malta': 0.18, // 18% VAT
    'Cayman Islands': 0.00, // No direct tax
  };

  const calculatePricing = React.useCallback((): PricingCalculation => {
    let basePrice = servicePrice;
    let discount = 0;
    let surcharge = 0;

    // Apply 5% volume discount for multiple services
    if (isMultipleServices) {
      discount = basePrice * 0.05;
    }

    // Apply 20% rush delivery surcharge
    if (isRushDelivery) {
      surcharge = basePrice * 0.20;
    }

    // Calculate subtotal after discounts and surcharges
    const subtotal = basePrice - discount + surcharge;

    // Apply country-specific tax
    const taxRate = taxRates[country as keyof typeof taxRates] || 0;
    const taxAmount = subtotal * taxRate;

    // Calculate total
    const totalPrice = subtotal + taxAmount;

    return {
      basePrice,
      discount,
      surcharge,
      taxAmount,
      totalPrice,
      currency,
    };
  }, [servicePrice, isMultipleServices, isRushDelivery, country, currency]);

  React.useEffect(() => {
    const calculation = calculatePricing();
    onCalculationChange(calculation);
  }, [calculatePricing, onCalculationChange]);

  const calculation = calculatePricing();

  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
      <h3 className="font-semibold text-gray-900">Pricing Breakdown</h3>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Base Price:</span>
          <span className="font-medium">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: currency,
            }).format(calculation.basePrice)}
          </span>
        </div>

        {calculation.discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Volume Discount (5%):</span>
            <span>
              -{new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency,
              }).format(calculation.discount)}
            </span>
          </div>
        )}

        {calculation.surcharge > 0 && (
          <div className="flex justify-between text-orange-600">
            <span>Rush Delivery (20%):</span>
            <span>
              +{new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency,
              }).format(calculation.surcharge)}
            </span>
          </div>
        )}

        {calculation.taxAmount > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600">
              Tax ({country}):
            </span>
            <span className="font-medium">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency,
              }).format(calculation.taxAmount)}
            </span>
          </div>
        )}

        <div className="border-t pt-2">
          <div className="flex justify-between text-lg font-semibold">
            <span>Total:</span>
            <span>
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency,
              }).format(calculation.totalPrice)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};