import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CustomForm, CustomFormField, CustomButton } from '../../components';
import { useAuth } from '../../context';

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading: authLoading, error: authError, clearError } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
    }
    // Clear auth error when user starts typing
    if (authError) {
      clearError();
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (formData.phoneNumber.length !== 10) {
      newErrors.phoneNumber = 'Please enter a valid phone number of 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await register({
        name: formData.name,
        email: formData.email,
        phone_number: formData.phoneNumber,
        password: formData.password
      });
      // Navigate to home after successful registration
      navigate('/');
    } catch (error) {
      console.error('Signup error:', error);
      // Error is already handled by the auth context
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-block">
            <h1 className="text-3xl font-bold text-indigo-600 mb-2">Event Planner</h1>
          </Link>
          <p className="text-gray-600">Create your account to start planning amazing events.</p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md">
          <CustomForm
            title="Create Account"
            onSubmit={handleSubmit}
          >
            {(authError || errors.general) && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                <p className="text-sm text-red-600">{authError || errors.general}</p>
              </div>
            )}

            <CustomFormField
              type="text"
              name="name"
              label="Full Name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleInputChange}
              error={errors.name}
              required
            />

            <CustomFormField
              type="email"
              name="email"
              label="Email Address"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
              error={errors.email}
              required
            />

             <CustomFormField
              type="text"
              name="phoneNumber"
              label="Phone Number"
              placeholder="Enter your phone number"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              error={errors.phoneNumber}
              required
            />

            <CustomFormField
              type="password"
              name="password"
              label="Password"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleInputChange}
              error={errors.password}
              helperText="Must contain uppercase, lowercase, and number"
              required
            />

            <CustomFormField
              type="password"
              name="confirmPassword"
              label="Confirm Password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              error={errors.confirmPassword}
              required
            />

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                I agree to the{' '}
                <a href="#" className="text-indigo-600 hover:text-indigo-500">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-indigo-600 hover:text-indigo-500">
                  Privacy Policy
                </a>
              </label>
            </div>

            <CustomButton
              type="submit"
              variant="primary"
              disabled={authLoading}
              className="w-full"
            >
              {authLoading ? 'Creating Account...' : 'Create Account'}
            </CustomButton>
          </CustomForm>

          {/* Sign in link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;