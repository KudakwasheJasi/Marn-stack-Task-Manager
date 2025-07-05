/**
    * @description      : 
    * @author           : kudakwashe Ellijah
    * @group            : 
    * @created          : 06/07/2025 - 01:09:46
    * 
    * MODIFICATION LOG
    * - Version         : 1.0.0
    * - Date            : 06/07/2025
    * - Author          : kudakwashe Ellijah
    * - Modification    : 
**/
import React from 'react';

const EmptyState = ({
  icon,
  title,
  message,
  actionLabel,
  onAction,
  showAction = true,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-16 ${className}`}>
      <div className="mb-6 text-6xl text-blue-400 dark:text-blue-500">
        {icon}
      </div>
      <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">{title}</h2>
      <p className="text-gray-500 dark:text-gray-300 mb-6 text-center max-w-md">{message}</p>
      {showAction && (
        <button
          onClick={onAction}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState; 