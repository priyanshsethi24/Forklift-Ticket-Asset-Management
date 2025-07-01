import React from 'react';


export const DashboardLoader = ({ message = "Loading..." }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
  <div className="text-center px-4 w-full max-w-sm">
    <div className="mx-auto h-12 w-12 sm:h-14 sm:w-14 mb-4 sm:mb-6">
      <div className="animate-spin h-full w-full border-4 sm:border-8 border-gray-200 border-t-blue-500 rounded-full"></div>
    </div>
    <div className="text-white text-lg sm:text-xl font-medium break-words">{message}</div>
  </div>
</div>
); 