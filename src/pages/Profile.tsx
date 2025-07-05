import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { 
  User, 
  Mail, 
  Phone, 
  Globe, 
  Clock, 
  Languages,
  Lock,
  Save
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

export const Profile: React.FC = () => {
  const { t } = useTranslation();
  const { user, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      username: user?.username || '',
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      country: user?.country || '',
      timezone: user?.timezone || '',
      language: user?.language || '',
    },
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      await updateProfile(data);
      reset(data);
    } catch (error) {
      // Error is handled by the auth context
    } finally {
      setIsLoading(false);
    }
  };

  const countries = [
    { value: 'Singapore', label: 'Singapore' },
    { value: 'Dubai', label: 'Dubai' },
    { value: 'Malta', label: 'Malta' },
    { value: 'Cayman Islands', label: 'Cayman Islands' },
    { value: 'Other', label: 'Other' },
  ];

  const timezones = [
    { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
    { value: 'Asia/Dubai', label: 'Dubai (GST)' },
    { value: 'Europe/Malta', label: 'Malta (CET)' },
    { value: 'America/Cayman', label: 'Cayman Islands (EST)' },
    { value: 'UTC', label: 'UTC' },
  ];

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'zh', label: '中文 (Chinese)' },
    { value: 'ar', label: 'العربية (Arabic)' },
  ];

  const tabs = [
    { id: 'personal', label: t('profile.personalInfo'), icon: User },
    { id: 'account', label: t('profile.accountSettings'), icon: Globe },
    { id: 'security', label: t('profile.security'), icon: Lock },
  ];

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {t('profile.title')}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <tab.icon className="w-4 h-4 mr-3" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {activeTab === 'personal' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  {t('profile.personalInfo')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label={t('auth.firstName')}
                      leftIcon={<User className="w-4 h-4" />}
                      error={errors.firstName?.message}
                      {...register('firstName', {
                        required: t('validation.required'),
                      })}
                    />

                    <Input
                      label={t('auth.lastName')}
                      leftIcon={<User className="w-4 h-4" />}
                      error={errors.lastName?.message}
                      {...register('lastName', {
                        required: t('validation.required'),
                      })}
                    />
                  </div>

                  <Input
                    label={t('auth.username')}
                    leftIcon={<User className="w-4 h-4" />}
                    error={errors.username?.message}
                    {...register('username', {
                      required: t('validation.required'),
                      minLength: {
                        value: 3,
                        message: t('validation.minLength', { min: 3 }),
                      },
                    })}
                  />

                  <Input
                    label={t('auth.email')}
                    type="email"
                    leftIcon={<Mail className="w-4 h-4" />}
                    value={user.email}
                    disabled
                    helperText="Email cannot be changed"
                  />

                  <Input
                    label={t('auth.phone')}
                    type="tel"
                    leftIcon={<Phone className="w-4 h-4" />}
                    {...register('phone')}
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('auth.country')}
                    </label>
                    <select
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      {...register('country')}
                    >
                      <option value="">Select a country</option>
                      {countries.map((country) => (
                        <option key={country.value} value={country.value}>
                          {country.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" isLoading={isLoading}>
                      <Save className="w-4 h-4 mr-2" />
                      {t('profile.updateProfile')}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === 'account' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  {t('profile.accountSettings')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('profile.timezone')}
                    </label>
                    <select
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      {...register('timezone')}
                    >
                      {timezones.map((timezone) => (
                        <option key={timezone.value} value={timezone.value}>
                          {timezone.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('profile.language')}
                    </label>
                    <select
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      {...register('language')}
                    >
                      {languages.map((language) => (
                        <option key={language.value} value={language.value}>
                          {language.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Account Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Role:</span>
                        <span className="font-medium capitalize">{user.role}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Account Status:</span>
                        <span className="font-medium text-green-600">
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Member Since:</span>
                        <span className="font-medium">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {user.lastLogin && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Last Login:</span>
                          <span className="font-medium">
                            {new Date(user.lastLogin).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {user.complianceStatus && Object.keys(user.complianceStatus).length > 0 && (
                        <div>
                          <span className="text-gray-600">Compliance Status:</span>
                          <pre className="text-xs bg-gray-100 p-2 rounded mt-1 whitespace-pre-wrap">
                            {JSON.stringify(user.complianceStatus, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" isLoading={isLoading}>
                      <Save className="w-4 h-4 mr-2" />
                      Save Settings
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="w-5 h-5 mr-2" />
                  {t('profile.security')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-800 mb-2">
                      Two-Factor Authentication
                    </h4>
                    <p className="text-sm text-yellow-700 mb-3">
                      {user.twoFactorEnabled 
                        ? 'Two-factor authentication is enabled for your account.'
                        : 'Enhance your account security by enabling two-factor authentication.'
                      }
                    </p>
                    <Button 
                      variant={user.twoFactorEnabled ? 'danger' : 'primary'} 
                      size="sm"
                    >
                      {user.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                    </Button>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">
                      {t('profile.changePassword')}
                    </h4>
                    <div className="space-y-4">
                      <Input
                        label={t('profile.currentPassword')}
                        type="password"
                        leftIcon={<Lock className="w-4 h-4" />}
                      />
                      <Input
                        label={t('profile.newPassword')}
                        type="password"
                        leftIcon={<Lock className="w-4 h-4" />}
                      />
                      <Input
                        label={t('profile.confirmPassword')}
                        type="password"
                        leftIcon={<Lock className="w-4 h-4" />}
                      />
                      <Button>
                        Update Password
                      </Button>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="font-medium text-gray-900 mb-4">
                      Account Actions
                    </h4>
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start">
                        Download Account Data
                      </Button>
                      <Button variant="danger" className="w-full justify-start">
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};