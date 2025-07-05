import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { 
  ArrowRight, 
  ArrowLeft, 
  Save, 
  SkipForward,
  CheckCircle,
  AlertCircle,
  FileText,
  UploadCloud
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { apiService } from '../../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

interface Question {
  id: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'multiselect' | 'boolean' | 'date' | 'file';
  question: string;
  options?: string[];
  required: boolean;
  section: string;
  conditional?: string;
}

interface Questionnaire {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  conditionalLogic: Record<string, any>;
  service: {
    id: string;
    name: string;
    category: string;
    description: string;
  };
}

interface QuestionnaireWizardProps {
  onComplete: (recommendation?: any) => void;
  onSkip: () => void;
  serviceId?: string; // Make serviceId optional for onboarding, required for service-specific
}

export const QuestionnaireWizard: React.FC<QuestionnaireWizardProps> = ({
  onComplete,
  onSkip,
  serviceId
}) => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Get user from auth context to access country/industry
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentSection, setCurrentSection] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [filesToUpload, setFilesToUpload] = useState<Record<string, File | null>>({});
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  // Group questions by section
  const sections = questionnaire ? 
    [...new Set(questionnaire.questions.map(q => q.section))] : [];
  
  const questionsBySection = questionnaire ? 
    sections.map(section => ({
      name: section,
      questions: questionnaire.questions.filter(q => q.section === section)
    })) : [];

  const currentSectionData = questionsBySection[currentSection];
  const totalSections = sections.length;
  const progressPercentage = totalSections > 0 ? Math.round(((currentSection + 1) / totalSections) * 100) : 0;

  useEffect(() => {
    fetchQuestionnaire();
  }, [serviceId, user]); // Re-fetch if serviceId or user changes

  const fetchQuestionnaire = async () => {
    try {
      setIsLoading(true);
      let response;
      if (serviceId) {
        // Fetch service-specific questionnaire
        // TODO: Implement backend endpoint for /questionnaires/service/:serviceId/:industryId/:countryId
        // For now, we'll use a simplified approach or rely on the existing active one if no specific match
        response = await apiService.get(`/questionnaires/active?serviceId=${serviceId}&country=${user?.country || ''}&industry=${user?.partnerSpecificMetadata?.industry || ''}`);
      } else {
        // Fetch general onboarding questionnaire
        response = await apiService.get('/questionnaires/active');
      }
      
      setQuestionnaire(response.questionnaire);
      
      // Try to load saved progress
      if (response.questionnaire.id) {
        try {
          const progressResponse = await apiService.get(
            `/questionnaires/${response.questionnaire.id}/progress`
          );
          if (progressResponse.progress?.answers) {
            setAnswers(progressResponse.progress.answers);
          }
        } catch (error) {
          // No saved progress, continue with empty answers
          console.warn('No saved progress found or error fetching progress:', error);
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load questionnaire');
      console.error('Error fetching questionnaire:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProgress = async () => {
    if (!questionnaire || Object.keys(answers).length === 0) return;

    try {
      setIsSaving(true);
      // Upload files first if any
      const uploadedFileUrls = await handleFileUploads();
      const answersWithFiles = { ...answers, ...uploadedFileUrls };

      await apiService.post('/questionnaires/progress', {
        questionnaireId: questionnaire.id,
        answers: answersWithFiles
      });
      toast.success('Progress saved');
    } catch (error: any) {
      toast.error('Failed to save progress');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUploads = async () => {
    const uploadedUrls: Record<string, string> = {};
    for (const questionId in filesToUpload) {
      const file = filesToUpload[questionId];
      if (file) {
        try {
          setUploadProgress(prev => ({ ...prev, [questionId]: 0 }));
          const response = await apiService.uploadFile(
            `/questionnaires/upload-response-file?questionId=${questionId}`,
            file,
            (progress) => setUploadProgress(prev => ({ ...prev, [questionId]: progress }))
          );
          uploadedUrls[questionId] = response.filePath; // Assuming backend returns filePath
          toast.success(`File ${file.name} uploaded!`);
        } catch (error: any) {
          toast.error(`Failed to upload file ${file.name}: ${error.message}`);
          console.error(`File upload error for ${file.name}:`, error);
          // Do not re-throw, allow other parts of the form to submit
        } finally {
          setFilesToUpload(prev => ({ ...prev, [questionId]: null })); // Clear file after attempt
          setUploadProgress(prev => ({ ...prev, [questionId]: 100 })); // Mark as done
        }
      }
    }
    return uploadedUrls;
  };

  const isQuestionVisible = (question: Question): boolean => {
    if (!question.conditional || !questionnaire?.conditionalLogic) return true;

    const logic = questionnaire.conditionalLogic[question.conditional];
    if (!logic) return true;

    const triggerAnswer = answers[logic.trigger_question];
    
    if (logic.show_when === 'true') {
      return triggerAnswer === true;
    }
    
    return false;
  };

  const validateCurrentSection = (): boolean => {
    if (!currentSectionData) return true;

    const visibleQuestions = currentSectionData.questions.filter(isQuestionVisible);
    const requiredQuestions = visibleQuestions.filter(q => q.required);
    
    for (const question of requiredQuestions) {
      const answer = answers[question.id];
      if (question.type === 'file') {
        // For files, check if a file is selected or if a URL is already present in answers
        if (question.required && !filesToUpload[question.id] && !answers[question.id]) {
          return false;
        }
      } else if (!answer || (typeof answer === 'string' && answer.trim() === '')) {
        return false;
      }
    }
    
    return true;
  };

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (!questionnaire) return;

    if (!validateCurrentSection()) {
      toast.error('Please answer all required questions');
      return;
    }

    try {
      setIsSubmitting(true);
      // Upload files first if any
      const uploadedFileUrls = await handleFileUploads();
      const answersWithFiles = { ...answers, ...uploadedFileUrls };

      const response = await apiService.post('/questionnaires/responses', {
        questionnaireId: questionnaire.id,
        answers: answersWithFiles,
        isComplete: true
      });

      toast.success('Questionnaire completed successfully!');
      onComplete(response.recommendation);
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit questionnaire');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  const renderQuestion = (question: Question) => {
    if (!isQuestionVisible(question)) return null;

    const value = answers[question.id] || '';

    switch (question.type) {
      case 'text':
        return (
          <Input
            key={question.id}
            label={question.question}
            value={value}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            required={question.required}
          />
        );

      case 'textarea':
        return (
          <div key={question.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {question.question}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              value={value}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required={question.required}
            />
          </div>
        );

      case 'number':
        return (
          <Input
            key={question.id}
            label={question.question}
            type="number"
            value={value}
            onChange={(e) => handleAnswerChange(question.id, parseFloat(e.target.value) || 0)}
            required={question.required}
          />
        );

      case 'select':
        return (
          <div key={question.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {question.question}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              value={value}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required={question.required}
            >
              <option value="">Select an option</option>
              {question.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        );

      case 'multiselect':
        return (
          <div key={question.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {question.question}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="space-y-2">
              {question.options?.map((option) => (
                <label key={option} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={(value as string[])?.includes(option) || false}
                    onChange={(e) => {
                      const currentValues = (value as string[]) || [];
                      if (e.target.checked) {
                        handleAnswerChange(question.id, [...currentValues, option]);
                      } else {
                        handleAnswerChange(question.id, currentValues.filter(v => v !== option));
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'boolean':
        return (
          <div key={question.id} className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={value || false}
                onChange={(e) => handleAnswerChange(question.id, e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">
                {question.question}
                {question.required && <span className="text-red-500 ml-1">*</span>}
              </span>
            </label>
          </div>
        );

      case 'date':
        return (
          <Input
            key={question.id}
            label={question.question}
            type="date"
            value={value}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            required={question.required}
          />
        );

      case 'file':
        const onDropFile = useCallback((acceptedFiles: File[]) => {
          if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            setFilesToUpload(prev => ({ ...prev, [question.id]: file }));
            // Store file name in answers for display, actual upload happens on save/submit
            handleAnswerChange(question.id, file.name);
          }
        }, [question.id]);

        const { getRootProps, getInputProps, isDragActive } = useDropzone({
          onDrop: onDropFile,
          multiple: false,
          accept: { 'image/jpeg': [], 'image/png': [], 'application/pdf': [] },
          maxSize: 15 * 1024 * 1024, // 15MB
        });

        const currentFile = filesToUpload[question.id] || (answers[question.id] ? { name: answers[question.id] } : null);

        return (
          <div key={question.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {question.question}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
                ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
            >
              <input {...getInputProps()} />
              <UploadCloud className="mx-auto h-10 w-10 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                {isDragActive ? 'Drop the file here ...' : 'Drag & drop file here, or click to select file'}
              </p>
              <p className="text-xs text-gray-500">PDF, PNG, JPG up to 15MB</p>
              {currentFile && (
                <p className="mt-2 text-sm text-blue-600">
                  Selected: {currentFile.name} {uploadProgress[question.id] !== undefined && uploadProgress[question.id] < 100 && `(${uploadProgress[question.id]}%)`}
                </p>
              )}
            </div>
            {uploadProgress[question.id] !== undefined && uploadProgress[question.id] < 100 && (
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                <div 
                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress[question.id]}%` }}
                />
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!questionnaire) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Questionnaire Not Available
        </h3>
        <p className="text-gray-500 mb-4">
          Unable to load the questionnaire. Please try again later.
        </p>
        <Button onClick={() => navigate('/dashboard')}>
          Go to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{questionnaire.title}</h1>
                <p className="text-gray-600">{questionnaire.description}</p>
              </div>
            </div>
            <Button variant="ghost" onClick={handleSkip} leftIcon={<SkipForward className="w-4 h-4" />}>
              Skip
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>Section {currentSection + 1} of {totalSections}</span>
            <span>{progressPercentage}% Complete</span>
          </div>
        </div>

        {/* Current Section */}
        {currentSectionData && (
          <Card>
            <CardHeader>
              <CardTitle>{currentSectionData.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentSectionData.questions.map(renderQuestion)}
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <div className="flex items-center space-x-4">
            {currentSection > 0 && (
              <Button
                variant="outline"
                onClick={handlePrevious}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Previous
              </Button>
            )}
            
            <Button
              variant="outline"
              onClick={saveProgress}
              isLoading={isSaving}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Progress
            </Button>
          </div>

          <div>
            {currentSection < totalSections - 1 ? (
              <Button
                onClick={handleNext}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Next Section
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                isLoading={isSubmitting}
                rightIcon={<CheckCircle className="w-4 h-4" />}
              >
                Complete Questionnaire
              </Button>
            )}
          </div>
        </div>

        {/* Section Navigation */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {sections.map((section, index) => (
            <button
              key={section}
              onClick={() => setCurrentSection(index)}
              className={`p-2 text-xs rounded text-center transition-colors ${
                index === currentSection
                  ? 'bg-blue-600 text-white'
                  : index < currentSection
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {section}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};