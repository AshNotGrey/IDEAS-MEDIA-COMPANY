import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import Button from "../Button";
import { Camera, CheckCircle, AlertCircle, RefreshCw, Shield } from "lucide-react";
import useTheme from "../../hooks/useTheme.js";
import { useAuth } from "../../contexts/AuthContext";

/**
 * ID Verification Page Component
 *
 * ID verification page for when users need to verify their identity
 * documents. Handles document upload and verification status.
 */
const IDVerification = () => {
  const location = useLocation();
  const { user, submitVerificationDocument } = useAuth();

  const [verificationStatus, setVerificationStatus] = useState("pending"); // pending, success, error, submitted
  const [isLoading, setIsLoading] = useState(false);
  const [documentType, setDocumentType] = useState("nin"); // nin or driversLicense
  const [documentNumber, setDocumentNumber] = useState("");

  // Use theme hook to ensure proper theme state initialization
  useTheme();

  // Logo component
  const Logo = () => (
    <div className='flex items-center justify-center space-x-2'>
      <Camera size={32} className='text-ideas-accent' />
      <span className='text-2xl font-heading font-bold text-ideas-black dark:text-ideas-white'>
        Ideal Photography
      </span>
    </div>
  );

  // Check current verification status on mount
  useEffect(() => {
    if (user) {
      const ninStatus = user.verification?.nin?.status;
      const driversLicenseStatus = user.verification?.driversLicense?.status;

      if (ninStatus === "verified" || driversLicenseStatus === "verified") {
        setVerificationStatus("success");
      } else if (ninStatus === "pending" || driversLicenseStatus === "pending") {
        setVerificationStatus("submitted");
      }
    }
  }, [user]);

  // Handle document submission
  const handleSubmitDocument = async () => {
    if (!documentNumber.trim()) {
      alert("Please enter the document number");
      return;
    }

    // Validate document number format
    if (documentType === "nin" && !/^\d{11}$/.test(documentNumber.trim())) {
      alert("NIN must be exactly 11 digits");
      return;
    }

    if (
      documentType === "driversLicense" &&
      !/^[A-Z]{3}\d{6}[A-Z]{2}\d{2}$/.test(documentNumber.trim())
    ) {
      alert("Please enter a valid Driver's License Number (e.g., ABC123456XY12)");
      return;
    }

    setIsLoading(true);

    try {
      // Submit verification document
      const result = await submitVerificationDocument({
        type: documentType,
        number: documentNumber.trim(),
      });

      if (result.success) {
        setVerificationStatus("submitted");
        setDocumentNumber("");
      } else {
        console.error("Document submission failed:", result.error);
        setVerificationStatus("error");
      }
    } catch (error) {
      console.error("Document submission error:", error);
      setVerificationStatus("error");
    } finally {
      setIsLoading(false);
    }
  };

  // Success state
  if (verificationStatus === "success") {
    return (
      <AuthLayout title='ID Verified!' subtitle='Your identity has been successfully verified'>
        <div className='text-center space-y-6'>
          {/* Success Icon */}
          <div className='mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center'>
            <CheckCircle size={32} className='text-green-600 dark:text-green-400' />
          </div>

          {/* Success Message */}
          <div className='space-y-4'>
            <h3 className='text-xl font-semibold text-ideas-black dark:text-ideas-white'>
              Verification complete!
            </h3>
            <p className='text-gray-600 dark:text-gray-400'>
              Your identity has been verified. You can now access all features.
            </p>
          </div>

          {/* Action Buttons */}
          <div className='space-y-3'>
            <Button
              to={location.state?.from?.pathname || "/dashboard"}
              variant='primary'
              className='w-full'>
              Continue
            </Button>

            <Link
              to='/dashboard'
              className='inline-flex items-center text-ideas-accent hover:text-ideas-accentHover transition-colors duration-200'>
              Back to Dashboard
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // Submitted state
  if (verificationStatus === "submitted") {
    return (
      <AuthLayout title='Document Submitted' subtitle='Your document is being reviewed'>
        <div className='text-center space-y-6'>
          {/* Pending Icon */}
          <div className='mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center'>
            <RefreshCw size={32} className='text-blue-600 dark:text-blue-400 animate-spin' />
          </div>

          {/* Pending Message */}
          <div className='space-y-4'>
            <h3 className='text-xl font-semibold text-ideas-black dark:text-ideas-white'>
              Document under review
            </h3>
            <p className='text-gray-600 dark:text-gray-400'>
              We're currently reviewing your submitted document. This process typically takes 1-2
              business days.
            </p>
          </div>

          {/* Action Buttons */}
          <div className='space-y-3'>
            <Button to='/dashboard' variant='primary' className='w-full'>
              Back to Dashboard
            </Button>

            <p className='text-sm text-gray-500 dark:text-gray-400'>
              You'll receive a notification once verification is complete
            </p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // Error state
  if (verificationStatus === "error") {
    return (
      <AuthLayout title='Verification Failed' subtitle='There was an issue with your submission'>
        <div className='text-center space-y-6'>
          {/* Error Icon */}
          <div className='mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center'>
            <AlertCircle size={32} className='text-red-600 dark:text-red-400' />
          </div>

          {/* Error Message */}
          <div className='space-y-4'>
            <h3 className='text-xl font-semibold text-ideas-black dark:text-ideas-white'>
              Something went wrong
            </h3>
            <p className='text-gray-600 dark:text-gray-400'>
              There was an error processing your document. Please try again.
            </p>
          </div>

          {/* Action Buttons */}
          <div className='space-y-3'>
            <Button
              onClick={() => setVerificationStatus("pending")}
              variant='primary'
              className='w-full'>
              Try Again
            </Button>

            <Link
              to='/dashboard'
              className='inline-flex items-center text-ideas-accent hover:text-ideas-accentHover transition-colors duration-200'>
              Back to Dashboard
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // Main form state
  return (
    <AuthLayout title='ID Verification' subtitle='Verify your identity to continue'>
      <div className='space-y-6'>
        {/* Security Notice */}
        <div className='bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4'>
          <div className='flex items-start space-x-3'>
            <Shield className='w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0' />
            <div className='text-sm text-blue-800 dark:text-blue-200'>
              <p className='font-medium'>Security & Privacy</p>
              <p>
                Your ID information is encrypted and securely stored. We only use it for identity
                verification to ensure secure transactions.
              </p>
            </div>
          </div>
        </div>

        {/* Document Type Selection */}
        <div className='space-y-3'>
          <label className='block text-sm font-medium text-ideas-black dark:text-ideas-white'>
            Document Type
          </label>
          <div className='grid grid-cols-2 gap-3'>
            <button
              type='button'
              onClick={() => setDocumentType("nin")}
              className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                documentType === "nin"
                  ? "border-ideas-accent bg-ideas-accent/10 text-ideas-accent"
                  : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500"
              }`}>
              National ID (NIN)
            </button>
            <button
              type='button'
              onClick={() => setDocumentType("driversLicense")}
              className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                documentType === "driversLicense"
                  ? "border-ideas-accent bg-ideas-accent/10 text-ideas-accent"
                  : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500"
              }`}>
              Driver's License
            </button>
          </div>
        </div>

        {/* Document Number */}
        <div className='space-y-3'>
          <label className='block text-sm font-medium text-ideas-black dark:text-ideas-white'>
            {documentType === "nin" ? "NIN Number" : "License Number"}
          </label>
          <input
            type='text'
            value={documentNumber}
            onChange={(e) => setDocumentNumber(e.target.value)}
            placeholder={
              documentType === "nin" ? "Enter your NIN number" : "Enter your license number"
            }
            className='w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ideas-accent focus:border-transparent bg-ideas-white dark:bg-ideas-black text-ideas-black dark:text-ideas-white placeholder-gray-500 dark:placeholder-gray-400'
          />
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmitDocument}
          variant='primary'
          className='w-full'
          disabled={!documentNumber.trim() || isLoading}>
          {isLoading ? "Submitting..." : "Submit for Verification"}
        </Button>

        {/* Back Link */}
        <div className='text-center'>
          <Link
            to='/dashboard'
            className='inline-flex items-center text-ideas-accent hover:text-ideas-accentHover transition-colors duration-200'>
            Back to Dashboard
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default IDVerification;
