
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { clearCurrentUser } from '../lib/auth';

export default function Home() {
  const router = useRouter();

  const handleLogout = () => {
    clearCurrentUser();
    router.push('/auth/login');
  };

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Pacifico, serif' }}>
          ResultMagic
        </h1>
        <p className="text-gray-600">Complete student result management system</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Link href="/student-entry" className="block">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-2xl hover:from-blue-600 hover:to-indigo-700 transition-all">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                <i className="ri-user-add-line text-white text-xl"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Student Entry</h3>
                <p className="text-blue-100 text-sm">Add students and enter component scores</p>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/result-generation" className="block">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                <i className="ri-calculator-line text-white text-xl"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Result Generation</h3>
                <p className="text-green-100 text-sm">Generate rankings and view results</p>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/print-results" className="block">
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6 rounded-2xl hover:from-purple-600 hover:to-pink-700 transition-all">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                <i className="ri-printer-line text-white text-xl"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Print Results</h3>
                <p className="text-purple-100 text-sm">Print individual and class results</p>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/database" className="block">
          <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6 rounded-2xl hover:from-orange-600 hover:to-red-700 transition-all">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                <i className="ri-database-line text-white text-xl"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Student Database</h3>
                <p className="text-orange-100 text-sm">View cumulative records and promotion status</p>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/templates" className="block">
          <div className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white p-6 rounded-2xl hover:from-teal-600 hover:to-cyan-700 transition-all">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                <i className="ri-file-list-3-line text-white text-xl"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Templates</h3>
                <p className="text-teal-100 text-sm">Manage class templates and settings</p>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/settings" className="block">
          <div className="bg-gradient-to-r from-gray-500 to-slate-600 text-white p-6 rounded-2xl hover:from-gray-600 hover:to-slate-700 transition-all">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                <i className="ri-settings-3-line text-white text-xl"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Settings</h3>
                <p className="text-gray-100 text-sm">Configure school name and app preferences</p>
              </div>
            </div>
          </div>
        </Link>

        <button
          onClick={handleLogout}
          className="w-full bg-gradient-to-r from-red-500 to-rose-600 text-white p-6 rounded-2xl hover:from-red-600 hover:to-rose-700 transition-all !rounded-button"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
              <i className="ri-logout-circle-line text-white text-xl"></i>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Logout</h3>
              <p className="text-red-100 text-sm">Sign out of your account</p>
            </div>
          </div>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Features</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <i className="ri-check-line text-blue-600"></i>
            </div>
            <span className="text-sm text-gray-700">Component-based grading</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <i className="ri-check-line text-green-600"></i>
            </div>
            <span className="text-sm text-gray-700">Cumulative tracking</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <i className="ri-check-line text-purple-600"></i>
            </div>
            <span className="text-sm text-gray-700">Promotion status</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <i className="ri-check-line text-orange-600"></i>
            </div>
            <span className="text-sm text-gray-700">Print ready reports</span>
          </div>
        </div>
      </div>
    </div>
  );
}
