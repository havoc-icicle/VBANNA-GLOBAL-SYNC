import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Globe, 
  Eye, 
  EyeOff,
  Users
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { RegisterData } from '../../types/auth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

export const Register: React.FC = () => {
  const { t } = useTranslation();
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterData & { confirmPassword: string; referralCode?: string }>();

  const password = watch('password');

  const onSubmit = async (data: RegisterData & { confirmPassword: string; referralCode?: string }) => {
    setIsLoading(true);
    try {
      const { confirmPassword, ...registerData } = data;
      await registerUser(registerData);
      navigate('/dashboard');
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

  const roles = [
    { value: 'End User', label: 'End User (Client)' },
    { value: 'Mid-Broker', label: 'Mid-Broker (Intermediary)' },
  ];

  const partnerTypes = [
    { value: '', label: 'No Partnership' },
    { value: 'zenith', label: 'Zenith Partnership' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">VB</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          {t('auth.createAccount')}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {t('auth.alreadyHaveAccount')}{' '}
          <Link
            to="/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            {t('auth.signIn')}
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {t('auth.joinUs')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={t('auth.firstName')}
                  leftIcon={<User className="w-4 h-4" />}
                  error={errors.firstName?.message}
                  {...register('firstName', {
                    required: t('validation.required'),
                    minLength: {
                      value: 1,
                      message: t('validation.minLength', { min: 1 }),
                    },
                  })}
                />

                <Input
                  label={t('auth.lastName')}
                  leftIcon={<User className="w-4 h-4" />}
                  error={errors.lastName?.message}
                  {...register('lastName', {
                    required: t('validation.required'),
                    minLength: {
                      value: 1,
                      message: t('validation.minLength', { min: 1 }),
                    },
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
                  pattern: {
                    value: /^[a-zA-Z0-9_]+$/,
                    message: 'Username can only contain letters, numbers, and underscores',
                  },
                })}
              />

              <Input
                label={t('auth.email')}
                type="email"
                leftIcon={<Mail className="w-4 h-4" />}
                error={errors.email?.message}
                {...register('email', {
                  required: t('validation.required'),
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: t('validation.email'),
                  },
                })}
              />

              <Input
                label={t('auth.password')}
                type={showPassword ? 'text' : 'password'}
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                }
                error={errors.password?.message}
                {...register('password', {
                  required: t('validation.required'),
                  minLength: {
                    value: 6,
                    message: t('validation.minLength', { min: 6 }),
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                    message: 'Password must contain at least one lowercase letter, one uppercase letter, and one number',
                  },
                })}
              />

              <Input
                label="Confirm Password"
                type={showPassword ? 'text' : 'password'}
                leftIcon={<Lock className="w-4 h-4" />}
                error={errors.confirmPassword?.message}
                {...register('confirmPassword', {
                  required: t('validation.required'),
                  validate: (value) =>
                    value === password || t('validation.passwordMatch'),
                })}
              />

              <Input
                label={t('auth.phone')}
                type="tel"
                leftIcon={<Phone className="w-4 h-4" />}
                error={errors.phone?.message}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('auth.role')}
                </label>
                <select
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  {...register('role', { required: t('validation.required') })}
                >
                  <option value="">Select your role</option>
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
                {errors.role && (
                  <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Partnership Type
                </label>
                <select
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  {...register('partnerType')}
                >
                  {partnerTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Referral Code (Optional)"
                leftIcon={<Users className="w-4 h-4" />}
                helperText="Enter a referral code if you were referred by a partner"
                {...register('referralCode')}
              />

              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
              >
                {t('auth.signUp')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};