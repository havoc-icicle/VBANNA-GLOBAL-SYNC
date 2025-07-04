import { supabase } from '../config/database.js';
import logger from './logger.js';

/**
 * Service recommendation engine based on questionnaire responses
 * Uses a rule-based scoring system to match user needs with appropriate services
 */

const SERVICE_WEIGHTS = {
  // Documentation Services
  'business_plan': {
    keywords: ['business plan', 'financial projections', 'market analysis', 'funding', 'investor'],
    questions: ['business_plan_sections', 'business_plan_purpose', 'projected_financials', 'funding_sources'],
    score_multiplier: 1.0
  },
  'financial_model': {
    keywords: ['financial', 'projections', 'model', 'break-even', 'sensitivity'],
    questions: ['projected_financials', 'break_even_calculated', 'sensitivity_analysis', 'financial_assumptions'],
    score_multiplier: 0.8
  },
  'kyc_documentation': {
    keywords: ['compliance', 'legal', 'regulations', 'kyc', 'documentation'],
    questions: ['industry_regulations', 'compliance_assistance', 'operating_countries'],
    score_multiplier: 0.6
  },
  'executive_summary': {
    keywords: ['summary', 'overview', 'pitch', 'investor'],
    questions: ['investor_interest', 'pitch_assistance', 'value_proposition'],
    score_multiplier: 0.5
  },

  // Digital Services  
  'logo_design': {
    keywords: ['brand', 'logo', 'design', 'visual', 'identity'],
    questions: ['design_requirements', 'preferred_format'],
    score_multiplier: 0.4
  },
  'website_design': {
    keywords: ['website', 'online', 'digital', 'web', 'internet'],
    questions: ['marketing_channels', 'technology_tools'],
    score_multiplier: 0.7
  },
  'trade_leads': {
    keywords: ['trade', 'export', 'import', 'international', 'market'],
    questions: ['operating_countries', 'market_opportunities', 'multiple_markets'],
    score_multiplier: 0.9
  },
  'marketing': {
    keywords: ['marketing', 'advertising', 'promotion', 'social media'],
    questions: ['marketing_channels', 'marketing_effectiveness', 'sales_strategy'],
    score_multiplier: 0.6
  }
};

const analyzeAnswers = (answers) => {
  const analysis = {
    textContent: '',
    selectedOptions: [],
    numericValues: {},
    booleanFlags: {},
    keyTopics: []
  };

  // Extract and analyze different types of answers
  Object.entries(answers).forEach(([questionId, answer]) => {
    if (typeof answer === 'string') {
      analysis.textContent += ` ${answer.toLowerCase()}`;
    } else if (Array.isArray(answer)) {
      analysis.selectedOptions.push(...answer);
    } else if (typeof answer === 'number') {
      analysis.numericValues[questionId] = answer;
    } else if (typeof answer === 'boolean') {
      analysis.booleanFlags[questionId] = answer;
    }
  });

  // Extract key topics from text content
  const keywords = analysis.textContent.match(/\b\w{4,}\b/g) || [];
  analysis.keyTopics = [...new Set(keywords)];

  return analysis;
};

const calculateServiceScores = (analysis, answers) => {
  const scores = {};

  Object.entries(SERVICE_WEIGHTS).forEach(([serviceType, config]) => {
    let score = 0;

    // Keyword matching in text content
    config.keywords.forEach(keyword => {
      if (analysis.textContent.includes(keyword)) {
        score += 10;
      }
    });

    // Question-specific scoring
    config.questions.forEach(questionId => {
      if (answers[questionId]) {
        const answer = answers[questionId];
        
        if (typeof answer === 'boolean' && answer) {
          score += 15;
        } else if (typeof answer === 'string' && answer.length > 0) {
          score += 10;
        } else if (Array.isArray(answer) && answer.length > 0) {
          score += 8 * answer.length;
        } else if (typeof answer === 'number' && answer > 0) {
          score += 5;
        }
      }
    });

    // Apply service-specific multipliers
    scores[serviceType] = score * config.score_multiplier;
  });

  return scores;
};

const mapScoreToService = async (scores) => {
  try {
    // Get all services to map scores to actual service records
    const { data: services, error } = await supabase
      .from('services')
      .select('id, name, category, description, price_min, price_max, currency')
      .eq('is_active', true);

    if (error) {
      throw error;
    }

    // Map service types to actual services
    const serviceMapping = {
      'business_plan': services.find(s => s.name.includes('Business Plan')),
      'financial_model': services.find(s => s.name.includes('Financial')),
      'kyc_documentation': services.find(s => s.name.includes('KYC')),
      'executive_summary': services.find(s => s.name.includes('Executive')),
      'logo_design': services.find(s => s.name.includes('Logo')),
      'website_design': services.find(s => s.name.includes('Website')),
      'trade_leads': services.find(s => s.name.includes('Trade') || s.name.includes('Lead')),
      'marketing': services.find(s => s.name.includes('Marketing'))
    };

    // Find the highest scoring service that exists
    const sortedScores = Object.entries(scores)
      .filter(([serviceType]) => serviceMapping[serviceType])
      .sort(([,a], [,b]) => b - a);

    if (sortedScores.length > 0) {
      const [topServiceType, topScore] = sortedScores[0];
      const recommendedService = serviceMapping[topServiceType];

      if (recommendedService && topScore > 20) { // Minimum threshold
        return {
          service: recommendedService,
          confidence: Math.min(Math.round((topScore / 100) * 100), 100),
          reasoning: generateRecommendationReasoning(topServiceType, topScore),
          alternatives: sortedScores.slice(1, 3)
            .filter(([type]) => serviceMapping[type])
            .map(([type, score]) => ({
              service: serviceMapping[type],
              score: Math.round(score)
            }))
        };
      }
    }

    // Default recommendation if no clear match
    const defaultService = services.find(s => s.name.includes('Business Plan'));
    return {
      service: defaultService,
      confidence: 50,
      reasoning: 'Based on your responses, we recommend starting with a comprehensive business plan to establish a solid foundation for your business.',
      alternatives: []
    };

  } catch (error) {
    logger.error('Error mapping scores to services:', error);
    throw error;
  }
};

const generateRecommendationReasoning = (serviceType, score) => {
  const reasoningMap = {
    'business_plan': 'Your responses indicate a need for comprehensive business planning, financial projections, and investor-ready documentation.',
    'financial_model': 'Your focus on financial projections and analysis suggests you need detailed financial modeling services.',
    'kyc_documentation': 'Your compliance and regulatory requirements indicate a need for KYC documentation preparation.',
    'executive_summary': 'Your investor focus suggests an executive summary would be most valuable at this stage.',
    'logo_design': 'Your branding and design requirements indicate a need for professional logo design services.',
    'website_design': 'Your digital marketing focus suggests you need a professional website to establish your online presence.',
    'trade_leads': 'Your international business interests indicate a need for trade lead sourcing services.',
    'marketing': 'Your marketing strategy requirements suggest you need digital marketing services.'
  };

  return reasoningMap[serviceType] || 'Based on your responses, this service best matches your current business needs.';
};

export const recommendService = async (answers, questionnaire) => {
  try {
    logger.info('Starting service recommendation analysis');

    // Analyze the user's answers
    const analysis = analyzeAnswers(answers);

    // Calculate scores for each service type
    const scores = calculateServiceScores(analysis, answers);

    logger.info('Service scores calculated:', scores);

    // Map scores to actual services and generate recommendation
    const recommendation = await mapScoreToService(scores);

    logger.info('Service recommendation generated:', {
      serviceId: recommendation.service?.id,
      serviceName: recommendation.service?.name,
      confidence: recommendation.confidence
    });

    return recommendation;

  } catch (error) {
    logger.error('Service recommendation error:', error);
    throw new Error('Failed to generate service recommendation');
  }
};

export default {
  recommendService
};