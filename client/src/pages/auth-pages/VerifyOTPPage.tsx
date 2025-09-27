import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CustomForm, CustomFormField, CustomButton } from '../../components';
import { useAuth } from '../../context';

const VerifyOTPPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOTP, isLoading: authLoading, error: authError, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    // Get email from location state or URL params
    const stateEmail = location.state?.email;
    const urlParams = new URLSearchParams(location.search);
    const paramEmail = urlParams.get('email');

    const emailToUse = stateEmail || paramEmail;
    if (emailToUse) {
      setEmail(emailToUse);
    } else {
      // If no email, redirect back to signup
      navigate('/signup');
    }
  }, [location, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'otp') {
      // Only allow numbers and limit to 6 digits
      const numericValue = value.replace(/\D/g, '').slice(0, 6);
      setOtp(numericValue);
    }

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

    if (!otp) {
      newErrors.otp = 'OTP is required';
    } else if (otp.length !== 6) {
      newErrors.otp = 'OTP must be 6 digits';
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
      await verifyOTP(email, otp);
      toast.success('Account verified successfully! Welcome to Event Planner.');
      navigate('/');
    } catch (error) {
      console.error('OTP verification error:', error);
      toast.error('Invalid OTP. Please try again.');
    }
  };

  const handleResendOTP = async () => {
    // For now, just show a message. In a real app, you'd call an API to resend
    toast('OTP resent to your email. Please check your inbox.');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-block">
            <h1 className="text-3xl font-bold text-indigo-600 mb-2">Event Planner</h1>
          </Link>
          <p className="text-gray-600">Enter the verification code sent to your email.</p>
        </div>

        <div className="bg-white py-8 px-6 shadow-md rounded-lg">
          <CustomForm onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Email Display */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-md">
                  {email}
                </div>
              </div>

              {/* OTP Input */}
              <CustomFormField
                type="text"
                name="otp"
                label="Verification Code"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={handleInputChange}
                error={errors.otp}
                required
              />

              {/* Error Display */}
              {authError && (
                <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md">
                  {authError}
                </div>
              )}

              {/* Submit Button */}
              <CustomButton
                type="submit"
                variant="primary"
                className="w-full"
                disabled={authLoading}
              >
                {authLoading ? 'Verifying...' : 'Verify Account'}
              </CustomButton>

              {/* Resend OTP */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                  disabled={authLoading}
                >
                  Didn't receive the code? Resend OTP
                </button>
              </div>

              {/* Back to Signup */}
              <div className="text-center">
                <Link
                  to="/signup"
                  className="text-sm text-gray-600 hover:text-gray-500"
                >
                  Wrong email? Go back to signup
                </Link>
              </div>
            </div>
          </CustomForm>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTPPage;