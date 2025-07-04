import { Country } from '../models/index.js';
import logger from './logger.js';

// Default country configurations
const defaultCountryConfigs = {
  Singapore: {
    taxRate: 9.0,
    currency: 'SGD',
    taxName: 'GST'
  },
  Dubai: {
    taxRate: 5.0,
    currency: 'AED',
    taxName: 'VAT'
  },
  Malta: {
    taxRate: 18.0,
    currency: 'EUR',
    taxName: 'VAT'
  },
  'Cayman Islands': {
    taxRate: 0.0,
    currency: 'USD',
    taxName: 'None'
  }
};

const calculatePricing = async (options) => {
  try {
    const {
      service,
      priority = 'standard',
      isVolumeDiscount = false,
      country = 'Singapore'
    } = options;

    // Get base price (using minimum for now, could be dynamic based on requirements)
    let basePrice = parseFloat(service.priceMin || service.price_min);

    // Apply rush surcharge if applicable
    let surcharge = 0;
    const rushSurchargePercent = service.rushSurchargePercent || service.rush_surcharge_percent;
    if (priority === 'rush' && rushSurchargePercent) {
      surcharge = basePrice * (parseFloat(rushSurchargePercent) / 100);
    }

    // Apply volume discount (5% for multiple services)
    let discount = 0;
    if (isVolumeDiscount) {
      discount = basePrice * 0.05; // 5% volume discount
    }

    // Calculate subtotal
    const subtotal = basePrice + surcharge - discount;

    // Get country configuration
    let countryConfig = defaultCountryConfigs[country];
    
    if (!countryConfig) {
      // Try to fetch from Supabase
      const countryRecord = await Country.findOne({
        where: { name: country }
      });
      
      if (countryRecord) {
        countryConfig = {
          taxRate: parseFloat(countryRecord.tax_rate),
          currency: countryRecord.currency,
          taxName: countryRecord.tax_name
        };
      } else {
        // Default to Singapore if country not found
        countryConfig = defaultCountryConfigs.Singapore;
        logger.warn(`Country configuration not found for ${country}, defaulting to Singapore`);
      }
    }

    // Calculate tax
    const taxAmount = subtotal * (countryConfig.taxRate / 100);

    // Calculate total
    const totalPrice = subtotal + taxAmount;

    return {
      basePrice: parseFloat(basePrice.toFixed(2)),
      surcharge: parseFloat(surcharge.toFixed(2)),
      discount: parseFloat(discount.toFixed(2)),
      subtotal: parseFloat(subtotal.toFixed(2)),
      taxAmount: parseFloat(taxAmount.toFixed(2)),
      totalPrice: parseFloat(totalPrice.toFixed(2)),
      currency: countryConfig.currency,
      taxRate: countryConfig.taxRate,
      taxName: countryConfig.taxName
    };
  } catch (error) {
    logger.error('Pricing calculation error:', error);
    throw new Error('Failed to calculate pricing');
  }
};

const calculatePartialPaymentSchedule = (totalAmount, scheduleType = 'standard') => {
  const schedule = [];
  
  switch (scheduleType) {
    case 'standard':
      // 50% upfront, 25% on milestone, 25% on completion
      schedule.push({
        phase: 'upfront',
        percentage: 50,
        amount: parseFloat((totalAmount * 0.5).toFixed(2)),
        description: 'Upfront payment'
      });
      schedule.push({
        phase: 'milestone',
        percentage: 25,
        amount: parseFloat((totalAmount * 0.25).toFixed(2)),
        description: 'Milestone payment'
      });
      schedule.push({
        phase: 'completion',
        percentage: 25,
        amount: parseFloat((totalAmount * 0.25).toFixed(2)),
        description: 'Final payment'
      });
      break;
      
    case '50-50':
      // 50% upfront, 50% on completion
      schedule.push({
        phase: 'upfront',
        percentage: 50,
        amount: parseFloat((totalAmount * 0.5).toFixed(2)),
        description: 'Upfront payment'
      });
      schedule.push({
        phase: 'completion',
        percentage: 50,
        amount: parseFloat((totalAmount * 0.5).toFixed(2)),
        description: 'Final payment'
      });
      break;
      
    case '30-70':
      // 30% upfront, 70% on completion
      schedule.push({
        phase: 'upfront',
        percentage: 30,
        amount: parseFloat((totalAmount * 0.3).toFixed(2)),
        description: 'Upfront payment'
      });
      schedule.push({
        phase: 'completion',
        percentage: 70,
        amount: parseFloat((totalAmount * 0.7).toFixed(2)),
        description: 'Final payment'
      });
      break;
      
    default:
      // Full payment
      schedule.push({
        phase: 'full',
        percentage: 100,
        amount: parseFloat(totalAmount.toFixed(2)),
        description: 'Full payment'
      });
  }
  
  return schedule;
};

export {
  calculatePricing,
  calculatePartialPaymentSchedule,
  defaultCountryConfigs
};