
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, getCurrentSchool, canAccessClass } from '../../lib/auth';
import { getSchoolSpecificData, setSchoolSpecificData } from '../../lib/schoolManager';

export default function ScoreEntry({ classData, students, setStudents, onReset }) {
  const [currentStudent, setCurrentStudent] = useState('');
  const [currentAdmissionNumber, setCurrentAdmissionNumber] = useState('');
  const [parentDetails, setParentDetails] = useState({
    fullName: '',
    phoneNumber: '',
    email: ''
  });
  const [componentScores, setComponentScores] = useState({});
  const [user, setUser] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [showParentForm, setShowParentForm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const currentUser = getCurrentUser();
    const currentSchoolId = getCurrentSchool();

    if (!currentUser || !currentSchoolId) {
      router.push('/auth/login');
      return;
    }

    setUser(currentUser);

    if (classData && classData.className) {
      const access = canAccessClass(currentUser, classData.className);
      setHasAccess(access);
    }
  }, [classData, router]);

  if (!classData || !classData.subjects || (!classData.gradingComponents && !classData.subjectGradingComponents)) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
        <div className="text-gray-500 mb-4">
          <i className="ri-error-warning-line text-4xl mb-2"></i>
          <p>Class data is not properly loaded. Please set up your class first.</p>
        </div>
        <button
          onClick={onReset}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors !rounded-button"
        >
          Setup Class
        </button>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
        <div className="text-red-500 mb-4">
          <i className="ri-lock-line text-4xl mb-2"></i>
          <p>You don't have access to this class.</p>
          <p className="text-sm text-gray-600 mt-2">
            Only assigned teachers can enter scores for this class.
          </p>
        </div>
        <button
          onClick={onReset}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors !rounded-button"
        >
          Choose Another Class
        </button>
      </div>
    );
  }

  const getSubjectGradingComponents = (subject) => {
    if (classData.subjectGradingComponents && classData.subjectGradingComponents[subject]) {
      return classData.subjectGradingComponents[subject];
    }
    return classData.gradingComponents || [];
  };

  const calculateSubjectTotal = (subject, subjectScores) => {
    const gradingComponents = getSubjectGradingComponents(subject);
    let total = 0;
    gradingComponents.forEach(component => {
      const score = subjectScores[component.name] || 0;
      total += (score * component.percentage) / 100;
    });
    return Math.round(total * 100) / 100;
  };

  const isAdmissionNumberExists = (admissionNumber) => {
    return students.some(student => student.admissionNumber === admissionNumber);
  };

  const resetForms = () => {
    setCurrentStudent('');
    setCurrentAdmissionNumber('');
    setParentDetails({
      fullName: '',
      phoneNumber: '',
      email: ''
    });
    setComponentScores({});
    setShowParentForm(false);
  };

  const addStudent = () => {
    if (!currentStudent.trim() || !currentAdmissionNumber.trim()) {
      alert('Please fill in student name and admission number');
      return;
    }

    if (!parentDetails.fullName.trim()) {
      alert('Please fill in parent/guardian full name');
      return;
    }

    if (!parentDetails.phoneNumber.trim() && !parentDetails.email.trim()) {
      alert('Please provide at least one contact method (phone or email) for the parent/guardian');
      return;
    }

    if (isAdmissionNumberExists(currentAdmissionNumber.trim())) {
      alert('Admission Number already exists! Please use a unique admission number.');
      return;
    }

    const studentScores = {};
    const studentTotals = {};
    let overallTotal = 0;

    classData.subjects.forEach(subject => {
      const subjectComponents = {};
      const gradingComponents = getSubjectGradingComponents(subject);

      gradingComponents.forEach(component => {
        const key = `${subject}-${component.name}`;
        subjectComponents[component.name] = componentScores[key] || 0;
      });

      studentScores[subject] = subjectComponents;
      const subjectTotal = calculateSubjectTotal(subject, subjectComponents);
      studentTotals[subject] = subjectTotal;
      overallTotal += subjectTotal;
    });

    const newStudent = {
      id: Date.now(),
      name: currentStudent.trim(),
      admissionNumber: currentAdmissionNumber.trim(),
      parentDetails: {
        fullName: parentDetails.fullName.trim(),
        phoneNumber: parentDetails.phoneNumber.trim(),
        email: parentDetails.email.trim()
      },
      componentScores: studentScores,
      subjectTotals: studentTotals,
      overallTotal: Math.round(overallTotal * 100) / 100,
      average: Math.round((overallTotal / classData.subjects.length) * 100) / 100
    };

    setStudents([...students, newStudent]);
    resetForms();
  };

  const removeStudent = (id) => {
    setStudents(students.filter(s => s.id !== id));
  };

  const handleComponentScoreChange = (subject, component, value) => {
    const score = Math.max(0, Math.min(100, parseInt(value) || 0));
    const key = `${subject}-${component}`;
    setComponentScores({ ...componentScores, [key]: score });
  };

  const saveToDatabase = () => {
    const currentSchoolId = getCurrentSchool();
    const resultData = {
      id: Date.now(),
      schoolId: currentSchoolId,
      classData,
      students,
      term: classData.term,
      academicYear: new Date().getFullYear(),
      timestamp: new Date().toISOString()
    };

    const existingResults = getSchoolSpecificData('studentResultsDatabase');
    const updatedResults = [...existingResults, resultData];
    setSchoolSpecificData('studentResultsDatabase', updatedResults);

    localStorage.setItem('resultMagicData', JSON.stringify(resultData));

    const successDiv = document.createElement('div');
    successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    successDiv.textContent = 'Results saved to database!';
    document.body.appendChild(successDiv);
    setTimeout(() => successDiv.remove(), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{classData.className}</h3>
            <p className="text-sm text-gray-600">{classData.examType} - {classData.term}</p>
          </div>
          <button
            onClick={onReset}
            className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <i className="ri-edit-line text-gray-600"></i>
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student Name
              </label>
              <input
                type="text"
                value={currentStudent}
                onChange={(e) => setCurrentStudent(e.target.value)}
                placeholder="Enter student name"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admission Number
              </label>
              <input
                type="text"
                value={currentAdmissionNumber}
                onChange={(e) => setCurrentAdmissionNumber(e.target.value)}
                placeholder="Enter admission number"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Parent/Guardian Details */}
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-blue-800">Parent/Guardian Details</h4>
              <button
                onClick={() => setShowParentForm(!showParentForm)}
                className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors"
              >
                <i className={`ri-${showParentForm ? 'subtract' : 'add'}-line text-blue-600 text-sm`}></i>
              </button>
            </div>
            
            {showParentForm && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={parentDetails.fullName}
                    onChange={(e) => setParentDetails({...parentDetails, fullName: e.target.value})}
                    placeholder="Enter parent/guardian full name"
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={parentDetails.phoneNumber}
                      onChange={(e) => setParentDetails({...parentDetails, phoneNumber: e.target.value})}
                      placeholder="Enter phone number"
                      className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={parentDetails.email}
                      onChange={(e) => setParentDetails({...parentDetails, email: e.target.value})}
                      placeholder="Enter email address"
                      className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
                <p className="text-xs text-blue-600">
                  * At least one contact method (phone or email) is required
                </p>
              </div>
            )}
          </div>

          {classData.subjects.map((subject) => {
            const gradingComponents = getSubjectGradingComponents(subject);
            return (
              <div key={subject} className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-medium text-gray-800 mb-3">{subject}</h4>
                <div className="grid grid-cols-1 gap-3">
                  {gradingComponents.map((component) => (
                    <div key={component.name} className="flex items-center space-x-3">
                      <label className="text-sm font-medium text-gray-700 w-20">
                        {component.name}
                      </label>
                      <div className="flex-1 flex items-center space-x-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={componentScores[`${subject}-${component.name}`] || ''}
                          onChange={(e) => handleComponentScoreChange(subject, component.name, e.target.value)}
                          placeholder="0"
                          className="w-16 px-2 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-xs text-gray-500">({component.percentage}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          <button
            onClick={addStudent}
            disabled={!currentStudent.trim() || !currentAdmissionNumber.trim()}
            className="w-full bg-blue-500 text-white py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed !rounded-button"
          >
            Add Student
          </button>
        </div>
      </div>

      {students.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Students ({students.length})
            </h3>
            <button
              onClick={saveToDatabase}
              className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors !rounded-button"
            >
              Save to Database
            </button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {students.map((student) => (
              <div key={student.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-gray-800">{student.name}</h4>
                    <p className="text-sm text-gray-600">#{student.admissionNumber}</p>
                    {student.parentDetails && (
                      <p className="text-xs text-blue-600 mt-1">
                        Parent: {student.parentDetails.fullName}
                        {student.parentDetails.phoneNumber && ` • ${student.parentDetails.phoneNumber}`}
                        {student.parentDetails.email && ` • ${student.parentDetails.email}`}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => removeStudent(student.id)}
                    className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors"
                  >
                    <i className="ri-close-line text-red-500 text-sm"></i>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  {classData.subjects.map((subject) => (
                    <div key={subject} className="bg-white rounded-lg p-2">
                      <div className="font-medium text-gray-700">{subject}</div>
                      <div className="text-blue-600 font-bold">{student.subjectTotals[subject]}%</div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Overall Total:</span>
                    <span className="font-bold text-blue-600">{student.overallTotal}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Average:</span>
                    <span className="font-bold text-green-600">{student.average}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
