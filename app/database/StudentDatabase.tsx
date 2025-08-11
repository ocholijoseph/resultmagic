
'use client';

import { useState, useEffect } from 'react';
import { getSchoolSpecificData } from '../../lib/schoolManager';

export default function StudentDatabase() {
  const [allResults, setAllResults] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [studentHistory, setStudentHistory] = useState([]);
  const [promotionCriteria, setPromotionCriteria] = useState(50);

  useEffect(() => {
    loadAllResults();
  }, []);

  const loadAllResults = () => {
    const results = getSchoolSpecificData('studentResultsDatabase');
    setAllResults(results);
  };

  const getUniqueStudents = () => {
    const studentsMap = new Map();
    allResults.forEach(result => {
      if (result.students && Array.isArray(result.students)) {
        result.students.forEach(student => {
          if (student && student.name && student.admissionNumber) {
            studentsMap.set(student.admissionNumber, {
              name: student.name,
              admissionNumber: student.admissionNumber,
              parentDetails: student.parentDetails || null
            });
          }
        });
      }
    });
    return Array.from(studentsMap.values()).sort((a, b) => a.admissionNumber.localeCompare(b.admissionNumber));
  };

  const getStudentHistory = (admissionNumber) => {
    const history = [];
    allResults.forEach(result => {
      if (result.students && Array.isArray(result.students)) {
        const student = result.students.find(s => s && s.admissionNumber === admissionNumber);
        if (student) {
          history.push({
            ...student,
            term: result.term || 'Unknown Term',
            academicYear: result.academicYear || new Date().getFullYear(),
            className: result.classData?.className || 'Unknown Class',
            examType: result.classData?.examType || 'Unknown Exam',
            timestamp: result.timestamp || new Date().toISOString(),
            subjectTotals: student.subjectTotals || {},
            average: student.average || 0
          });
        }
      }
    });
    return history.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  };

  const calculateCumulativeAverage = (history) => {
    if (history.length === 0) return 0;
    const total = history.reduce((sum, record) => sum + (record.average || 0), 0);
    return Math.round((total / history.length) * 100) / 100;
  };

  const determinePromotionStatus = (cumulativeAverage) => {
    return cumulativeAverage >= promotionCriteria;
  };

  const handleStudentSelect = (admissionNumber) => {
    setSelectedStudent(admissionNumber);
    const history = getStudentHistory(admissionNumber);
    setStudentHistory(history);
  };

  const exportStudentData = (admissionNumber) => {
    const history = getStudentHistory(admissionNumber);
    const studentInfo = getUniqueStudents().find(s => s.admissionNumber === admissionNumber);
    const data = {
      student: studentInfo,
      history: history,
      cumulativeAverage: calculateCumulativeAverage(history),
      promotionStatus: determinePromotionStatus(calculateCumulativeAverage(history))
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${studentInfo.name}_${admissionNumber}_results.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearDatabase = () => {
    if (confirm('Are you sure you want to clear all student data? This action cannot be undone.')) {
      // Clear school-specific data
      const currentSchool = getCurrentSchool();
      if (currentSchool) {
        localStorage.removeItem(`studentResultsDatabase_${currentSchool}`);
      }
      setAllResults([]);
      setStudentHistory([]);
      setSelectedStudent('');
    }
  };

  const selectedStudentInfo = getUniqueStudents().find(s => s.admissionNumber === selectedStudent);

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Student Database</h2>
        <p className="text-gray-600">View cumulative records and promotion status</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Database Overview</h3>
          <button
            onClick={clearDatabase}
            className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors !rounded-button"
          >
            Clear Database
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{allResults.length}</div>
            <div className="text-sm text-blue-700">Total Records</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{getUniqueStudents().length}</div>
            <div className="text-sm text-green-700">Unique Students</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{promotionCriteria}%</div>
            <div className="text-sm text-purple-700">Promotion Criteria</div>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Promotion Criteria (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={promotionCriteria}
            onChange={(e) => setPromotionCriteria(parseInt(e.target.value) || 50)}
            className="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Student Records</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Student
          </label>
          <select
            value={selectedStudent}
            onChange={(e) => handleStudentSelect(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Choose a student...</option>
            {getUniqueStudents().map(student => (
              <option key={student.admissionNumber} value={student.admissionNumber}>
                {student.name} (#{student.admissionNumber})
              </option>
            ))}
          </select>
        </div>

        {selectedStudent && selectedStudentInfo && studentHistory.length > 0 && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-gray-800">{selectedStudentInfo.name}</h4>
                  <p className="text-sm text-gray-600">Admission Number: #{selectedStudentInfo.admissionNumber}</p>
                  {selectedStudentInfo.parentDetails && (
                    <div className="text-sm text-blue-600 mt-1">
                      <p>Parent: {selectedStudentInfo.parentDetails.fullName}</p>
                      {selectedStudentInfo.parentDetails.phoneNumber && (
                        <p>Phone: {selectedStudentInfo.parentDetails.phoneNumber}</p>
                      )}
                      {selectedStudentInfo.parentDetails.email && (
                        <p>Email: {selectedStudentInfo.parentDetails.email}</p>
                      )}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => exportStudentData(selectedStudent)}
                  className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors !rounded-button"
                >
                  Export Data
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Cumulative Average:</span>
                  <div className="text-lg font-bold text-blue-600">
                    {calculateCumulativeAverage(studentHistory)}%
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Promotion Status:</span>
                  <div className={`text-lg font-bold ${
                    determinePromotionStatus(calculateCumulativeAverage(studentHistory))
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    {determinePromotionStatus(calculateCumulativeAverage(studentHistory))
                      ? 'PROMOTED'
                      : 'NOT PROMOTED'
                    }
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">Term History</h4>
              {studentHistory.map((record, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-medium text-gray-800">{record.term}</span>
                      <span className="text-sm text-gray-600 ml-2">({record.academicYear})</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-blue-600">{record.average}%</div>
                      <div className="text-xs text-gray-500">{record.className}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {record.subjectTotals && Object.entries(record.subjectTotals).map(([subject, total]) => (
                      <div key={subject} className="flex justify-between">
                        <span className="text-gray-600">{subject}:</span>
                        <span className="font-medium">{total}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
