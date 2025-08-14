import React from "react";
import { User, Mail, CreditCard, CheckCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../Button";

/**
 * ProfileCompletionWidget Component
 *
 * Shows profile completion status and prompts for missing information
 */
const ProfileCompletionWidget = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Calculate profile completion
  const completionItems = [
    {
      id: "name",
      label: "Full Name",
      icon: <User className='w-4 h-4' />,
      completed: !!(user?.name && user.name.trim().length > 0),
      required: true,
    },
    {
      id: "email",
      label: "Email Verified",
      icon: <Mail className='w-4 h-4' />,
      completed: !!user?.emailVerified,
      required: true,
    },
    {
      id: "identity",
      label: "ID Verification",
      icon: <CreditCard className='w-4 h-4' />,
      completed: !!user?.isFullyVerified,
      required: true,
    },
  ];

  const completedCount = completionItems.filter((item) => item.completed).length;
  const completionPercentage = Math.round((completedCount / completionItems.length) * 100);
  const isProfileComplete = completionItems
    .filter((item) => item.required)
    .every((item) => item.completed);

  // Don't show if profile is complete
  if (isProfileComplete && completionPercentage === 100) {
    return null;
  }

  return (
    <div className='card'>
      <div className='flex items-center gap-3 mb-4'>
        <div className='p-2 bg-ideas-accent/10 rounded-lg'>
          <User className='w-5 h-5 text-ideas-accent' />
        </div>
        <div className='flex-1'>
          <h3 className='text-lg font-semibold'>Profile Completion</h3>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            {completionPercentage}% complete
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className='mb-4'>
        <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
          <div
            className='bg-ideas-accent rounded-full h-2 transition-all duration-300'
            style={{ width: `${completionPercentage}%` }}></div>
        </div>
      </div>

      {/* Completion Items */}
      <div className='space-y-3 mb-4'>
        {completionItems.map((item) => (
          <div
            key={item.id}
            className='flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700'>
            <div
              className={`p-2 rounded-lg ${
                item.completed ? "bg-green-50 dark:bg-green-900/20" : "bg-gray-50 dark:bg-gray-800"
              }`}>
              {item.icon}
            </div>
            <div className='flex-1'>
              <div className='flex items-center gap-2'>
                <span
                  className={`text-sm font-medium ${
                    item.completed
                      ? "text-gray-900 dark:text-white"
                      : "text-gray-600 dark:text-gray-300"
                  }`}>
                  {item.label}
                </span>
                {item.required && !item.completed && (
                  <span className='text-xs bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full'>
                    Required
                  </span>
                )}
              </div>
            </div>
            <div className='flex-shrink-0'>
              {item.completed ? (
                <CheckCircle className='w-5 h-5 text-green-600 dark:text-green-400' />
              ) : (
                <AlertCircle className='w-5 h-5 text-gray-400' />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Action Button */}
      <div className='space-y-2'>
        <Button variant='primary' size='sm' fullWidth={true} onClick={() => navigate("/settings")}>
          Complete Profile
        </Button>

        {/* Additional Info */}
        <div className='text-xs text-gray-600 dark:text-gray-400 text-center'>
          {!isProfileComplete && (
            <p className='flex items-center justify-center gap-1 text-yellow-600 dark:text-yellow-400'>
              <AlertCircle className='w-3 h-3' />
              Complete required fields to unlock all features
            </p>
          )}
        </div>
      </div>

      {/* Benefits of completion */}
      {!isProfileComplete && (
        <div className='mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800'>
          <h4 className='text-sm font-medium text-blue-900 dark:text-blue-100 mb-2'>
            Benefits of completing your profile:
          </h4>
          <ul className='text-xs text-blue-700 dark:text-blue-300 space-y-1'>
            <li>• Faster booking and checkout process</li>
            <li>• Access to exclusive offers and discounts</li>
            <li>• Better customer support experience</li>
            <li>• Secure payment processing</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProfileCompletionWidget;
