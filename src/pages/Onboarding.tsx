import React from 'react';
import { useNavigate } from 'react-router-dom';
import { QuestionnaireWizard } from '../components/questionnaire/QuestionnaireWizard';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { updateProfile, skipOnboardingForSession } = useAuth();

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
    console.log('[Onboarding.tsx] handleSkip triggered.');
    try {
      console.log('[Onboarding.tsx] Calling updateProfile with onboarding_status: skipped');
      await updateProfile({ onboarding_status: 'skipped' });
      console.log('[Onboarding.tsx] updateProfile finished. Skipping for session and navigating to /dashboard.');
      skipOnboardingForSession();
      navigate('/dashboard');
    } catch (error) {
      console.error('[Onboarding.tsx] Error in handleSkip:', error);
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