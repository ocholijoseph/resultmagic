'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import TabBar from '../../components/TabBar';
import { getCurrentUser, getCurrentSchool, isAdmin } from '../../lib/auth';
import { getSchoolById, deleteSchool, getUsersBySchool, createUser, updateUser, deleteUser } from '../../lib/schoolManager';

export default function SchoolManagementPage() {
  const [user, setUser] = useState(null);
  const [school, setSchool] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [teacherForm, setTeacherForm] = useState({
    name: '',
    email: '',
    assignedClasses: []
  });
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [newClass, setNewClass] = useState('');
  const router = useRouter();

  useEffect(() => {
    const currentUser = getCurrentUser();
    const currentSchool = getCurrentSchool();
    
    if (!currentUser || !currentSchool || !isAdmin(currentUser)) {
      router.push('/');
      return;
    }

    setUser(currentUser);
    const schoolData = getSchoolById(currentSchool);
    setSchool(schoolData);
    
    const schoolTeachers = getUsersBySchool(currentSchool).filter(u => u.role === 'teacher');
    setTeachers(schoolTeachers);
  }, [router]);

  const handleAddClass = () => {
    if (newClass.trim() && !teacherForm.assignedClasses.includes(newClass.trim())) {
      setTeacherForm({
        ...teacherForm,
        assignedClasses: [...teacherForm.assignedClasses, newClass.trim()]
      });
      setNewClass('');
    }
  };

  const handleRemoveClass = (className) => {
    setTeacherForm({
      ...teacherForm,
      assignedClasses: teacherForm.assignedClasses.filter(c => c !== className)
    });
  };

  const handleSaveTeacher = () => {
    if (teacherForm.name.trim() && teacherForm.email.trim()) {
      const teacherData = {
        name: teacherForm.name,
        email: teacherForm.email,
        role: 'teacher',
        schoolId: school.id,
        assignedClasses: teacherForm.assignedClasses
      };

      if (editingTeacher) {
        updateUser(editingTeacher.id, teacherData);
      } else {
        createUser(teacherData);
      }

      // Refresh teachers list
      const schoolTeachers = getUsersBySchool(school.id).filter(u => u.role === 'teacher');
      setTeachers(schoolTeachers);
      
      resetTeacherForm();
    }
  };

  const resetTeacherForm = () => {
    setTeacherForm({
      name: '',
      email: '',
      assignedClasses: []
    });
    setEditingTeacher(null);
    setShowAddTeacher(false);
  };

  const handleEditTeacher = (teacher) => {
    setTeacherForm({
      name: teacher.name,
      email: teacher.email,
      assignedClasses: teacher.assignedClasses || []
    });
    setEditingTeacher(teacher);
    setShowAddTeacher(true);
  };

  const handleDeleteTeacher = (teacherId) => {
    deleteUser(teacherId);
    const schoolTeachers = getUsersBySchool(school.id).filter(u => u.role === 'teacher');
    setTeachers(schoolTeachers);
  };

  const handleDeleteSchool = () => {
    if (school) {
      deleteSchool(school.id);
      router.push('/auth/login');
    }
  };

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
          <h2 className="text-2xl font-bold text-gray-800 mb-2">School Management</h2>
          <p className="text-gray-600">Manage your school and class teachers</p>
        </div>

        {/* School Information */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">School Information</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">School Name:</span>
              <span className="font-medium">{school.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Head Position:</span>
              <span className="font-medium">{school.headPosition}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">School ID:</span>
              <span className="font-mono text-sm text-gray-500">{school.id}</span>
            </div>
          </div>
        </div>

        {/* Class Teachers Management */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Class Teachers</h3>
            <button
              onClick={() => setShowAddTeacher(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors !rounded-button"
            >
              <i className="ri-add-line mr-2"></i>
              Add Teacher
            </button>
          </div>

          {teachers.length > 0 ? (
            <div className="space-y-3">
              {teachers.map((teacher) => (
                <div key={teacher.id} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{teacher.name}</h4>
                      <p className="text-sm text-gray-600">{teacher.email}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {teacher.assignedClasses?.map((className) => (
                          <span key={className} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                            {className}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditTeacher(teacher)}
                        className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors"
                      >
                        <i className="ri-edit-line text-blue-600"></i>
                      </button>
                      <button
                        onClick={() => handleDeleteTeacher(teacher.id)}
                        className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors"
                      >
                        <i className="ri-delete-bin-line text-red-600"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <i className="ri-user-line text-gray-400 text-2xl mb-4"></i>
              <p className="text-gray-500">No teachers added yet</p>
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-red-200">
          <h3 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-800">Delete School</h4>
                <p className="text-sm text-gray-600">Permanently delete this school and all its data</p>
              </div>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors !rounded-button"
              >
                Delete School
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Teacher Modal */}
      {showAddTeacher && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
              </h3>
              <button
                onClick={resetTeacherForm}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <i className="ri-close-line text-gray-600"></i>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teacher Name
                </label>
                <input
                  type="text"
                  value={teacherForm.name}
                  onChange={(e) => setTeacherForm({...teacherForm, name: e.target.value})}
                  placeholder="Enter teacher name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={teacherForm.email}
                  onChange={(e) => setTeacherForm({...teacherForm, email: e.target.value})}
                  placeholder="Enter email address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assigned Classes
                </label>
                <div className="flex space-x-2 mb-3">
                  <input
                    type="text"
                    value={newClass}
                    onChange={(e) => setNewClass(e.target.value)}
                    placeholder="Add class name"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleAddClass}
                    className="px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors !rounded-button"
                  >
                    <i className="ri-add-line"></i>
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {teacherForm.assignedClasses.map((className) => (
                    <div key={className} className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                      <span className="text-sm text-gray-700 mr-2">{className}</span>
                      <button
                        onClick={() => handleRemoveClass(className)}
                        className="w-4 h-4 flex items-center justify-center text-gray-500 hover:text-red-500"
                      >
                        <i className="ri-close-line text-xs"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSaveTeacher}
                className="w-full bg-blue-500 text-white py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors !rounded-button"
              >
                {editingTeacher ? 'Update Teacher' : 'Add Teacher'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-error-warning-line text-red-600 text-2xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Delete School</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{school.name}"? This action will permanently remove all data including:
              </p>
              <div className="text-left bg-gray-50 rounded-lg p-4 mb-6">
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• All student records</li>
                  <li>• All teacher accounts</li>
                  <li>• All result data</li>
                  <li>• All templates</li>
                  <li>• School settings</li>
                </ul>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors !rounded-button"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteSchool}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors !rounded-button"
                >
                  Delete School
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <TabBar />
    </div>
  );
}