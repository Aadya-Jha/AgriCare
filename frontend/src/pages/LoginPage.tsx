import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Leaf, ArrowRight, CheckCircle2 } from 'lucide-react';

interface LoginPageProps {
  onLogin: (userData: any) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Validate against stored accounts
      const existingAccounts = JSON.parse(localStorage.getItem('agricare_accounts') || '[]');
      const userAccount = existingAccounts.find((account: any) => 
        account.email === formData.email && account.password === formData.password
      );
      
      if (!userAccount) {
        setErrors({ general: 'Invalid email or password. Please check your credentials or sign up for a new account.' });
        return;
      }
      
      // Successful login with actual user data
      const userData = {
        id: userAccount.id,
        name: userAccount.name,
        email: userAccount.email,
        role: userAccount.role,
        farmLocation: userAccount.farmLocation,
        joinDate: userAccount.joinDate
      };
      
      onLogin(userData);
      navigate('/dashboard');
    } catch (error) {
      setErrors({ general: 'Login failed. Please check your credentials.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <Link to="/" className="flex items-center justify-center space-x-3 mb-8">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-soft" 
                   style={{backgroundColor: 'var(--agricare-light)'}}>
                <Leaf className="w-7 h-7" style={{color: 'var(--agricare-primary)'}} />
              </div>
              <h1 className="text-2xl font-heading font-bold" style={{color: 'var(--agricare-primary)'}}>
                AgriCare
              </h1>
            </Link>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-600">Sign in to access your agricultural dashboard</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm">{errors.general}</p>
              </div>
            )}

            <div className="space-y-4">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
                      errors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
                      errors.password ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <Link to="/forgot-password" className="text-sm hover:underline" 
                    style={{color: 'var(--agricare-primary)'}}>
                Forgot your password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: isLoading ? 'var(--agricare-sage)' : 'var(--agricare-primary)'
              }}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/signup" className="font-medium hover:underline" 
                      style={{color: 'var(--agricare-primary)'}}>
                  Create your account
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side - Agricultural Background */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden"
           style={{background: 'linear-gradient(135deg, var(--agricare-primary) 0%, var(--agricare-secondary) 100%)'}}>
        <div className="absolute inset-0">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="floating-elements">
              <div className="floating-element delay-0">🌱</div>
              <div className="floating-element delay-1">🌾</div>
              <div className="floating-element delay-2">🍃</div>
              <div className="floating-element delay-3">🌿</div>
              <div className="floating-element delay-4">🌾</div>
              <div className="floating-element delay-5">🌱</div>
            </div>
          </div>
          
          {/* Content Overlay */}
          <div className="relative z-10 flex items-center justify-center h-full text-white text-center p-12">
            <div className="max-w-md space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle2 className="h-6 w-6" />
                  <span className="text-lg font-semibold">Smart Monitoring</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle2 className="h-6 w-6" />
                  <span className="text-lg font-semibold">Real-time Analytics</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle2 className="h-6 w-6" />
                  <span className="text-lg font-semibold">Crop Optimization</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold">Transform Your Agriculture</h3>
              <p className="text-lg opacity-90">
                Join thousands of farmers using AgriCare to optimize their crops and increase productivity.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
