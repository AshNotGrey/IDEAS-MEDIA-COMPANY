import React from "react";
import { Search, X } from "lucide-react";

const SettingsSearch = ({ searchTerm, onSearchChange }) => {
  return (
    <div className='relative'>
      <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
        <Search className='h-4 w-4 text-gray-400' />
      </div>
      <input
        type='text'
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder='Search settings...'
        className='block w-full pl-9 pr-9 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
      />
      {searchTerm && (
        <button
          onClick={() => onSearchChange("")}
          className='absolute inset-y-0 right-0 pr-3 flex items-center'>
          <X className='h-4 w-4 text-gray-400 hover:text-gray-600' />
        </button>
      )}
    </div>
  );
};

export default SettingsSearch;
