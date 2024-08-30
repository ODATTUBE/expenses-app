import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';

const Settings = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
   
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="flex flex-row-reverse min-h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <div className="flex flex-grow justify-center items-center p-4 lg:mr-64">
        <div className="w-full max-w-sm p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md text-right">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4 text-center">الإعدادات</h2>
          <button
            onClick={toggleTheme}
            className="w-full py-2 px-4 bg-black dark:bg-gray-500 text-white rounded-md hover:bg-gray-700 dark:hover:bg-gray-500 focus:outline-none focus:bg-gray-700 dark:focus:bg-gray-600 transition duration-150"
          >
            {theme === 'dark' ? '🌙 الوضع الداكن' : '☀️ الوضع الفاتح'}
          </button>
    
        </div>
      </div>
    </div>
  );
};

export default Settings;