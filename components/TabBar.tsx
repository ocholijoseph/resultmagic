
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getCurrentUser, isAdmin } from '../lib/auth';

export default function TabBar() {
  const pathname = usePathname();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, []);

  const isActive = (path) => pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="grid grid-cols-5 h-16">
        <Link href="/" className={`flex flex-col items-center justify-center text-xs transition-colors ${
          isActive('/') 
            ? 'text-blue-600 bg-blue-50' 
            : 'text-gray-500 hover:text-gray-700'
        }`}>
          <i className="ri-home-line text-xl mb-1"></i>
          <span>Home</span>
        </Link>
        
        <Link href="/student-entry" className={`flex flex-col items-center justify-center text-xs transition-colors ${
          isActive('/student-entry') 
            ? 'text-blue-600 bg-blue-50' 
            : 'text-gray-500 hover:text-gray-700'
        }`}>
          <i className="ri-user-add-line text-xl mb-1"></i>
          <span>Entry</span>
        </Link>
        
        <Link href="/result-generation" className={`flex flex-col items-center justify-center text-xs transition-colors ${
          isActive('/result-generation') 
            ? 'text-blue-600 bg-blue-50' 
            : 'text-gray-500 hover:text-gray-700'
        }`}>
          <i className="ri-bar-chart-line text-xl mb-1"></i>
          <span>Results</span>
        </Link>
        
        <Link href="/database" className={`flex flex-col items-center justify-center text-xs transition-colors ${
          isActive('/database') 
            ? 'text-blue-600 bg-blue-50' 
            : 'text-gray-500 hover:text-gray-700'
        }`}>
          <i className="ri-database-line text-xl mb-1"></i>
          <span>Database</span>
        </Link>
        
        {user && isAdmin(user) ? (
          <Link href="/result-dispatch" className={`flex flex-col items-center justify-center text-xs transition-colors ${
            isActive('/result-dispatch') 
              ? 'text-blue-600 bg-blue-50' 
              : 'text-gray-500 hover:text-gray-700'
          }`}>
            <i className="ri-send-plane-line text-xl mb-1"></i>
            <span>Dispatch</span>
          </Link>
        ) : (
          <Link href="/settings" className={`flex flex-col items-center justify-center text-xs transition-colors ${
            isActive('/settings') 
              ? 'text-blue-600 bg-blue-50' 
              : 'text-gray-500 hover:text-gray-700'
          }`}>
            <i className="ri-settings-line text-xl mb-1"></i>
            <span>Settings</span>
          </Link>
        )}
      </div>
    </div>
  );
}
