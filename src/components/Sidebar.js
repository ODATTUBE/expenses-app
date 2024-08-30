import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, LineChart, Package, Users, Settings, ShoppingCart, ShieldCheck, Activity , LogOut, FileArchive } from 'lucide-react';
import { auth } from '../config/firebase'; 
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <>
      <aside className={`fixed inset-y-0 right-0 z-20 w-64 bg-white dark:bg-gray-800 border-l dark:border-gray-600 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-200 ease-in-out lg:translate-x-0`}>
        <div className="flex flex-col h-full p-4">
          <nav className="flex flex-col space-y-4 mt-4">
            <Link to="/add-expense" onClick={closeSidebar} className="flex items-center justify-end gap-2 p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
              <span className="mr-2">إضافة مصروف</span>
              <ShoppingCart className="h-5 w-5" />
            </Link>
            <Link to="/records" onClick={closeSidebar} className="flex items-center justify-end gap-2 p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
              <span className="mr-2">سجل المصروفات</span>
              <FileArchive className="h-5 w-5" />
            </Link>
            <Link to="/lend" onClick={closeSidebar} className="flex items-center justify-end gap-2 p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
              <span className="mr-2">إقراض </span>
              <ShieldCheck className="h-5 w-5" />
            </Link>
            <Link to="/shares" onClick={closeSidebar} className="flex items-center justify-end gap-2 p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
              <span className="mr-2">الأسهم</span>
              <Activity className="h-5 w-5" />
            </Link>
            <Link to="/" onClick={closeSidebar} disabled className="flex items-center justify-end gap-2 p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                <span className="mr-2">التحليلات</span>
                <LineChart className="h-5 w-5" />
            </Link>
            <Link to="/settings" onClick={closeSidebar} className="flex items-center justify-end gap-2 p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
              <span className="mr-2">الإعدادات</span>
              <Settings className="h-5 w-5" />
            </Link>
            <button onClick={handleLogout} className="flex items-center justify-end gap-2 p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
              <span className="mr-2">تسجيل الخروج</span>
              <LogOut className="h-5 w-5" />
            </button>
            </nav>
        </div>
        </aside>
      <div className="lg:hidden fixed top-0 right-0 z-30 p-4">
        <button onClick={toggleSidebar} className="text-gray-500 hover:text-gray-600">
          <span className="sr-only">تبديل القائمة</span>
          <div className="flex flex-col space-y-1.5">
            <span className="block w-6 h-0.5 bg-gray-600"></span>
            <span className="block w-6 h-0.5 bg-gray-600"></span>
            <span className="block w-6 h-0.5 bg-gray-600"></span>
          </div>
        </button>
      </div>
    </>

    );
}

export default Sidebar;

