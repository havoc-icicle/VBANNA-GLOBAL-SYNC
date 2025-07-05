import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QuestionnaireWizard } from '../components/questionnaire/QuestionnaireWizard';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export const Questionnaire: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const { updateProfile } = useAuth();

  const handleComplete = async (recommendation?: any) => {
    try {
      // For a service-specific questionnaire, completing it means the user is done with this step.
      // We might want to update their onboarding status if this was part of an onboarding flow,
      // but for general service questionnaires, we just navigate.
      toast.success('Questionnaire completed successfully!');
      // TODO: Potentially create an order here or redirect to order confirmation
      navigate('/orders'); 
    } catch (error) {
      console.error('Error completing questionnaire:', error);
      toast.error('Failed to complete questionnaire.');
      navigate('/dashboard');
    }
  };

  const handleSkip = () => {
    // For service-specific questionnaires, skipping means going back to services or dashboard
    toast.info('Questionnaire skipped.');
    navigate('/services');
  };

  if (!serviceId) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Service not specified
        </h3>
        <p className="text-gray-500 mb-4">
          Please select a service to start the questionnaire.
        </p>
        {/* TODO: Add a button to navigate to services page */}
      </div>
    );
  }

  return (
    <QuestionnaireWizard
      serviceId={serviceId}
      onComplete={handleComplete}
      onSkip={handleSkip}
    />
  );
};