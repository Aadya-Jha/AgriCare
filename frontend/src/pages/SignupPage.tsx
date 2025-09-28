import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, MapPin, Leaf, ArrowRight, CheckCircle2 } from 'lucide-react';

interface SignupPageProps {
  onSignup: (userData: any) => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({ onSignup }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    farmLocation: '',
    role: 'farmer'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

    if (!formData.name) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    } else {
      // Check if email already exists in localStorage
      const existingAccounts = JSON.parse(localStorage.getItem('agricare_accounts') || '[]');
      const emailExists = existingAccounts.some((account: any) => account.email === formData.email);
      if (emailExists) {
        newErrors.email = 'Account with this email already exists. Please use the login page instead.';
      }
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.farmLocation) {
      newErrors.farmLocation = 'Farm location is required';
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
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful signup
      const userData = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name,
        email: formData.email,
        password: formData.password, // In a real app, this would be hashed
        role: formData.role,
        farmLocation: formData.farmLocation,
        joinDate: new Date().toISOString()
      };
      
      // Store account in accounts list for future login validation
      const existingAccounts = JSON.parse(localStorage.getItem('agricare_accounts') || '[]');
      existingAccounts.push(userData);
      localStorage.setItem('agricare_accounts', JSON.stringify(existingAccounts));
      
      onSignup(userData);
      navigate('/dashboard');
    } catch (error) {
      setErrors({ general: 'Signup failed. Please try again.' });
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
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
            <p className="text-gray-600">Join AgriCare and start optimizing your agriculture</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm">{errors.general}</p>
              </div>
            )}
            
            {/* Account exists warning */}
            {errors.email && errors.email.includes('already exists') && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <div className="text-blue-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-blue-800 font-medium text-sm">Account Already Exists</p>
                    <p className="text-blue-700 text-sm mt-1">
                      It looks like you already have an account with us. 
                      <Link to="/login" className="font-medium underline hover:no-underline">
                        Click here to sign in instead
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
                      errors.name ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your full name"
                  />
                </div>
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

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

              {/* Farm Location Field */}
              <div>
                <label htmlFor="farmLocation" className="block text-sm font-medium text-gray-700 mb-2">
                  Farm Location
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="farmLocation"
                    name="farmLocation"
                    type="text"
                    value={formData.farmLocation}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
                      errors.farmLocation ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g. Karnataka, India"
                  />
                </div>
                {errors.farmLocation && <p className="mt-1 text-sm text-red-600">{errors.farmLocation}</p>}
              </div>

              {/* Role Selection */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
                >
                  <option value="farmer">Farmer</option>
                  <option value="researcher">Agricultural Researcher</option>
                  <option value="consultant">Agricultural Consultant</option>
                  <option value="student">Student</option>
                </select>
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
                    placeholder="Create a password"
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

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
                      errors.confirmPassword ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                I agree to the{' '}
                <Link to="/terms" className="hover:underline" style={{color: 'var(--agricare-primary)'}}>
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="hover:underline" style={{color: 'var(--agricare-primary)'}}>
                  Privacy Policy
                </Link>
              </label>
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
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            {/* Sign In Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="font-medium hover:underline" 
                      style={{color: 'var(--agricare-primary)'}}>
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side - Agricultural Background */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden"
           style={{background: 'linear-gradient(135deg, var(--agricare-secondary) 0%, var(--agricare-sage) 100%)'}}>
        <div className="absolute inset-0">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="floating-elements">
              <div className="floating-element delay-0">🌾</div>
              <div className="floating-element delay-1">🌱</div>
              <div className="floating-element delay-2">🌿</div>
              <div className="floating-element delay-3">🍃</div>
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
                  <span className="text-lg font-semibold">Personalized Dashboard</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle2 className="h-6 w-6" />
                  <span className="text-lg font-semibold">Data Analytics</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle2 className="h-6 w-6" />
                  <span className="text-lg font-semibold">Expert Recommendations</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold">Start Your Agricultural Journey</h3>
              <p className="text-lg opacity-90">
                Create your profile and unlock powerful tools for modern farming and crop optimization.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
