import React from "react";
import { User, Mail, Phone } from "lucide-react";

/**
 * RefereeForm Component
 *
 * Form for collecting referee information for equipment rentals.
 * Replaces security deposit requirement with reference verification.
 *
 * @component
 * @param {Object} props - Props object
 * @param {Object} props.referee - Referee information object
 * @param {Function} props.setReferee - Function to update referee info
 * @param {boolean} props.required - Whether referee info is required
 * @returns {JSX.Element}
 */
const RefereeForm = ({ referee, setReferee, required = true }) => {
  const handleInputChange = (field, value) => {
    setReferee((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className='space-y-6'>
      <div>
        <h3 className='text-lg font-semibold mb-2'>Reference Information</h3>
        <p className='text-sm text-subtle mb-4'>
          Please provide a reference who can vouch for you. This person should be available during
          your rental period.
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div>
          <label className='block text-sm font-medium mb-2'>
            <User className='w-4 h-4 inline mr-2' />
            Full Name {required && <span className='text-red-500'>*</span>}
          </label>
          <input
            type='text'
            value={referee?.name || ""}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder='Enter referee full name'
            className='w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-ideas-darkInput focus:ring-2 focus:ring-ideas-accent focus:border-transparent'
            required={required}
          />
        </div>

        <div>
          <label className='block text-sm font-medium mb-2'>
            <Mail className='w-4 h-4 inline mr-2' />
            Email Address {required && <span className='text-red-500'>*</span>}
          </label>
          <input
            type='email'
            value={referee?.email || ""}
            onChange={(e) => handleInputChange("email", e.target.value)}
            placeholder='referee@example.com'
            className='w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-ideas-darkInput focus:ring-2 focus:ring-ideas-accent focus:border-transparent'
            required={required}
          />
        </div>
      </div>

      <div>
        <label className='block text-sm font-medium mb-2'>
          <Phone className='w-4 h-4 inline mr-2' />
          Phone Number {required && <span className='text-red-500'>*</span>}
        </label>
        <input
          type='tel'
          value={referee?.phone || ""}
          onChange={(e) => handleInputChange("phone", e.target.value)}
          placeholder='+234 xxx xxx xxxx'
          className='w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-ideas-darkInput focus:ring-2 focus:ring-ideas-accent focus:border-transparent'
          required={required}
        />
      </div>

      <div className='bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg'>
        <h4 className='text-sm font-semibold mb-2'>Why do we need a reference?</h4>
        <ul className='text-xs text-subtle space-y-1'>
          <li>• Your reference serves as a contact person during the rental period</li>
          <li>• They may be contacted to verify your identity and rental responsibility</li>
          <li>• This helps us maintain equipment security without requiring deposits</li>
          <li>• Please ensure your reference is available and aware of this rental</li>
        </ul>
      </div>
    </div>
  );
};

export default RefereeForm;
