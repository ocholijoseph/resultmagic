'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getCurrentUser, getCurrentSchool } from '../lib/auth';

export default function AuthWrapper({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const publicRoutes = ['/auth/login', '/auth/register'];
  const isPublicRoute = publicRoutes.includes(pathname);

  useEffect(() => {
    const checkAuth = () => {
      const currentUser = getCurrentUser();
      const currentSchool = getCurrentSchool();

      if (!currentUser || !currentSchool) {
        if (!isPublicRoute) {
          router.push('/auth/login');
        }
      } else {
        setUser(currentUser);
        if (isPublicRoute) {
          router.push('/');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [pathname, router, isPublicRoute]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <i className="ri-loader-4-line text-white text-2xl animate-spin"></i>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return children;
}