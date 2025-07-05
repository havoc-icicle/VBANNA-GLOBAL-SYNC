import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState, LoginCredentials, RegisterData } from '../types/auth';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  skipOnboardingForSession: () => void;
  onboardingSkippedThisSession: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });
  const [onboardingSkippedThisSession, setOnboardingSkippedThisSession] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          const user = await authService.getProfile(token);
          setAuthState({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
          // Set i18n language based on user preference
          if (user.language) {
            i18n.changeLanguage(user.language);
          }
        } catch (error) {
          localStorage.removeItem('token');
          setAuthState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } else {
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authService.login(credentials);
      
      localStorage.setItem('token', response.token);
      setOnboardingSkippedThisSession(false); // Reset on new login
      
      setAuthState({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
      });

      // Set i18n language based on user preference
      if (response.user.language) {
        i18n.changeLanguage(response.user.language);
      }

      toast.success('Login successful!');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await authService.register(data);
      
      localStorage.setItem('token', response.token);
      setOnboardingSkippedThisSession(false); // Reset on new registration
      
      setAuthState({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
      });

      // Set i18n language based on user preference
      if (response.user.language) {
        i18n.changeLanguage(response.user.language);
      }

      toast.success('Registration successful!');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
    setOnboardingSkippedThisSession(false); // Reset on logout
    i18n.changeLanguage('en'); // Reset to default language on logout
    toast.success('Logged out successfully');
  };

  const updateProfile = async (data: Partial<User>) => {
    console.log('[AuthContext.tsx] updateProfile called with:', data);
    try {
      const updatedUser = await authService.updateProfile(data, authState.token!);
      console.log('[AuthContext.tsx] Profile updated on backend, new user data:', updatedUser);
      
      setAuthState(prev => {
        console.log('[AuthContext.tsx] Updating local auth state.');
        const newState = {
          ...prev,
          user: updatedUser,
        };
        console.log('[AuthContext.tsx] New auth state:', newState);
        return newState;
      });

      // Update i18n language if language preference was changed
      if (data.language && data.language !== i18n.language) {
        i18n.changeLanguage(data.language);
      }

      toast.success('Profile updated successfully!');
      return updatedUser;
    } catch (error: any) {
      console.error('[AuthContext.tsx] Error updating profile:', error);
      toast.error(error.message || 'Profile update failed');
      throw error;
    }
  };

  const skipOnboardingForSession = () => {
    console.log('[AuthContext.tsx] Setting onboardingSkippedThisSession to true.');
    setOnboardingSkippedThisSession(true);
  };

  const contextValue: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    updateProfile,
    skipOnboardingForSession,
    onboardingSkippedThisSession,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};