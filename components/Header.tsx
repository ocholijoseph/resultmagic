
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, getCurrentSchool, clearCurrentUser, isAdmin } from '../lib/auth';
import { getSchoolById } from '../lib/schoolManager';

export default function Header() {
  const [user, setUser] = useState(null);
  const [school, setSchool] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const currentUser = getCurrentUser();
    const currentSchoolId = getCurrentSchool();
    
    if (currentUser && currentSchoolId) {
      setUser(currentUser);
      const schoolData = getSchoolById(currentSchoolId);
      setSchool(schoolData);
    }
  }, []);

  const handleLogout = () => {
    clearCurrentUser();
    router.push('/auth/login');
  };

  if (!user || !school) {
    return null;
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <i className="ri-book-read-line text-white text-lg"></i>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800" style={{ fontFamily: 'Pacifico, serif' }}>
              ResultMagic
            </h1>
            <p className="text-xs text-gray-600">{school.name}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {isAdmin(user) && (
            <Link href="/school-management" className="w-8 h-8 flex items-center justify-center">
              <i className="ri-building-line text-gray-600 text-lg"></i>
            </Link>
          )}
          <Link href="/settings" className="w-8 h-8 flex items-center justify-center">
            <i className="ri-settings-3-line text-gray-600 text-lg"></i>
          </Link>
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center"
            >
              <i className="ri-user-line text-blue-600 text-lg"></i>
            </button>
            
            {showUserMenu && (
              <div className="absolute right-0 top-10 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-48">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="font-medium text-gray-800">{user.name}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <p className="text-xs text-blue-600 capitalize">{user.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <i className="ri-logout-circle-line mr-2"></i>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
