
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import TabBar from '../../components/TabBar';
import { getCurrentUser, getCurrentSchool, isAdmin } from '../../lib/auth';
import { getSchoolById, updateSchool } from '../../lib/schoolManager';

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [school, setSchool] = useState(null);
  const [schoolName, setSchoolName] = useState('');
  const [schoolHeadPosition, setSchoolHeadPosition] = useState('Principal');
  const [schoolLogo, setSchoolLogo] = useState('');
  const [savedSchoolName, setSavedSchoolName] = useState('');
  const [savedSchoolHeadPosition, setSavedSchoolHeadPosition] = useState('Principal');
  const [savedSchoolLogo, setSavedSchoolLogo] = useState('');
  const router = useRouter();

  const headPositions = [
    'Principal',
    'Headmaster',
    'Headmistress',
    'Proprietor',
    'Proprietress',
    'Rector',
    'Director',
    'Head Teacher'
  ];

  useEffect(() => {
    const currentUser = getCurrentUser();
    const currentSchoolId = getCurrentSchool();
    
    if (!currentUser || !currentSchoolId) {
      router.push('/auth/login');
      return;
    }

    if (!isAdmin(currentUser)) {
      router.push('/');
      return;
    }

    setUser(currentUser);
    const schoolData = getSchoolById(currentSchoolId);
    
    if (schoolData) {
      setSchool(schoolData);
      setSchoolName(schoolData.name);
      setSchoolHeadPosition(schoolData.headPosition);
      setSchoolLogo(schoolData.logo || '');
      setSavedSchoolName(schoolData.name);
      setSavedSchoolHeadPosition(schoolData.headPosition);
      setSavedSchoolLogo(schoolData.logo || '');
    }
  }, [router]);

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('Logo file size must not exceed 5MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas to resize image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Calculate new dimensions maintaining aspect ratio
        let { width, height } = img;
        const maxSize = 192;
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and resize image
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to base64
        const resizedBase64 = canvas.toDataURL('image/png', 0.8);
        setSchoolLogo(resizedBase64);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!school) return;

    const updates = {
      name: schoolName,
      headPosition: schoolHeadPosition,
      logo: schoolLogo
    };

    updateSchool(school.id, updates);
    
    setSavedSchoolName(schoolName);
    setSavedSchoolHeadPosition(schoolHeadPosition);
    setSavedSchoolLogo(schoolLogo);

    // Show success message
    const successDiv = document.createElement('div');
    successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    successDiv.textContent = 'Settings saved successfully!';
    document.body.appendChild(successDiv);
    setTimeout(() => successDiv.remove(), 3000);
  };

  const hasChanges = schoolName !== savedSchoolName || 
                    schoolHeadPosition !== savedSchoolHeadPosition || 
                    schoolLogo !== savedSchoolLogo;

  if (!user || !school) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="ri-loader-4-line text-2xl text-gray-400 animate-spin mb-4"></i>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-16 pb-20 px-4 py-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Settings</h2>
          <p className="text-gray-600">Configure your school information</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                School Name
              </label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="Enter your school name"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-2">
                This name will appear on all printed result sheets
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                School Head Position
              </label>
              <select
                value={schoolHeadPosition}
                onChange={(e) => setSchoolHeadPosition(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {headPositions.map((position) => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-2">
                This title will appear in the signature section of result sheets
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                School Logo
              </label>
              <div className="space-y-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500">
                  Upload school logo (max 5MB, will be resized to 192x192px)
                </p>
                
                {schoolLogo && (
                  <div className="flex items-center space-x-4">
                    <img
                      src={schoolLogo}
                      alt="School Logo Preview"
                      className="w-16 h-16 object-contain border border-gray-200 rounded-lg"
                    />
                    <button
                      onClick={() => setSchoolLogo('')}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      <i className="ri-delete-bin-line mr-1"></i>
                      Remove Logo
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className="w-full bg-blue-500 text-white py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed !rounded-button"
            >
              <i className="ri-save-line mr-2"></i>
              Save Settings
            </button>

            {savedSchoolName && (
              <div className="p-4 bg-green-50 rounded-xl">
                <div className="flex items-center">
                  <i className="ri-check-circle-fill text-green-500 mr-2"></i>
                  <span className="text-green-700 font-medium">
                    Settings saved successfully
                  </span>
                </div>
                <div className="mt-2 text-sm text-green-600">
                  <p>School: {savedSchoolName}</p>
                  <p>Head Position: {savedSchoolHeadPosition}</p>
                  {savedSchoolLogo && <p>Logo: Uploaded</p>}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">About ResultMagic</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <p>Version 1.0.0</p>
            <p>A comprehensive student result management system</p>
            <p>Designed for schools and educational institutions</p>
          </div>
        </div>
      </div>

      <TabBar />
    </div>
  );
}
