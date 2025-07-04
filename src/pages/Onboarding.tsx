import React from 'react';
import { useNavigate } from 'react-router-dom';
import { QuestionnaireWizard } from '../components/questionnaire/QuestionnaireWizard';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { updateProfile } = useAuth();

  const handleComplete = async (recommendation?: any) => {
    try {
      // Update user's onboarding status in context
      await updateProfile({ onboarding_status: 'completed' });

      if (recommendation?.service) {
        toast.success(
          `Great! Based on your responses, we recommend: ${recommendation.service.name}`,
          { duration: 6000 }
        );
        
        // Redirect to the recommended service
        navigate(`/questionnaire/${recommendation.service.id}`, {
          state: { 
            recommendation,
            fromOnboarding: true 
          }
        });
      } else {
        // No specific recommendation, go to services page
        navigate('/services', {
          state: { fromOnboarding: true }
        });
      }
    } catch (error) {
      // If update fails, still proceed
      navigate('/dashboard');
    }
  };

  const handleSkip = async () => {
    try {
      // Update user's onboarding status in context
      await updateProfile({ onboarding_status: 'skipped' });
      navigate('/dashboard');
    } catch (error) {
      // If update fails, still proceed
      navigate('/dashboard');
    }
  };

  return (
    <QuestionnaireWizard
      onComplete={handleComplete}
      onSkip={handleSkip}
    />
  );
};