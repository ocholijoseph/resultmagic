
'use client';

import { useState, useEffect } from 'react';

export default function ClassSummary({ classData, students }) {
  const [schoolName, setSchoolName] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('resultMagicSchoolName');
    if (saved) {
      setSchoolName(saved);
    }
  }, []);

  const getGrade = (score) => {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  };

  // Add safety checks for empty data
  if (!students || students.length === 0 || !classData) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-sm print:shadow-none print:rounded-none">
        <div className="text-center">
          <p className="text-gray-600">No data available for class summary</p>
        </div>
      </div>
    );
  }

  const classAverage = students.reduce((sum, student) => sum + (student.average || 0), 0) / students.length;
  const passCount = students.filter(student => (student.average || 0) >= 60).length;
  const failCount = students.length - passCount;

  return (
    <div className="bg-white p-6 print:p-4 print:max-w-none print:w-full print:h-auto print:shadow-none print:rounded-none print:m-0">
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-content, .print-content * {
            visibility: visible;
          }
          .print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            padding: 20px;
            font-size: 12px;
            line-height: 1.3;
          }
          header, .tabbar, nav {
            display: none !important;
          }
          .print-content table {
            font-size: 10px;
          }
          .print-content .text-2xl {
            font-size: 18px;
          }
          .print-content .text-xl {
            font-size: 16px;
          }
          .print-content .text-lg {
            font-size: 14px;
          }
          .print-content .text-sm {
            font-size: 10px;
          }
          .print-content .mb-8 {
            margin-bottom: 16px;
          }
          .print-content .mb-4 {
            margin-bottom: 8px;
          }
          .print-content .p-4 {
            padding: 8px;
          }
          .print-content .space-y-2 > * + * {
            margin-top: 4px;
          }
          .print-content .gap-6 {
            gap: 12px;
          }
        }
      `}</style>

      <div className="text-center mb-6 border-b-2 border-gray-200 pb-4">
        {schoolName && (
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {schoolName}
          </h1>
        )}
        <h3 className="text-lg font-medium text-gray-600 mb-1">Class Summary Report</h3>
        <p className="text-gray-600">{classData.className} - {classData.examType} - {classData.term}</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-xl font-bold text-blue-600">{students.length}</div>
          <div className="text-sm text-blue-800">Total Students</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-xl font-bold text-green-600">{passCount}</div>
          <div className="text-sm text-green-800">Passed</div>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="text-xl font-bold text-red-600">{failCount}</div>
          <div className="text-sm text-red-800">Failed</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Class Statistics</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Class Average:</span>
              <span className="font-medium">{classAverage.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Highest Score:</span>
              <span className="font-medium">{Math.max(...students.map(s => s.average || 0)).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Lowest Score:</span>
              <span className="font-medium">{Math.min(...students.map(s => s.average || 0)).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pass Rate:</span>
              <span className="font-medium">{((passCount / students.length) * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Subject Averages</h3>
          <div className="space-y-2">
            {classData.subjects && classData.subjects.map((subject) => {
              const subjectAverage = students.reduce((sum, student) => {
                const subjectScore = student.subjectTotals && student.subjectTotals[subject]
                  ? student.subjectTotals[subject] : 0;
                return sum + subjectScore;
              }, 0) / students.length;
              return (
                <div key={subject} className="flex justify-between">
                  <span className="text-gray-600">{subject}:</span>
                  <span className="font-medium">{subjectAverage.toFixed(1)}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Student Rankings</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-2 py-2 text-center">Position</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Student Name</th>
                <th className="border border-gray-300 px-2 py-2 text-center">Admission No.</th>
                <th className="border border-gray-300 px-2 py-2 text-center">Average</th>
                <th className="border border-gray-300 px-2 py-2 text-center">Grade</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} className={student.position <= 3 ? 'bg-yellow-50' : ''}>
                  <td className="border border-gray-300 px-2 py-2 text-center font-medium">
                    {student.position}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 font-medium">
                    {student.name}
                  </td>
                  <td className="border border-gray-300 px-2 py-2 text-center">
                    {student.admissionNumber}
                  </td>
                  <td className="border border-gray-300 px-2 py-2 text-center">
                    {(student.average || 0).toFixed(1)}%
                  </td>
                  <td className="border border-gray-300 px-2 py-2 text-center">
                    {getGrade(student.average || 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="border-t-2 border-gray-200 pt-4">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Teacher's Remarks</h4>
            <div className="border border-gray-200 rounded-lg p-3 h-16 bg-gray-50">
              <p className="text-sm text-gray-600">
                {classAverage >= 80
                  ? 'Excellent class performance overall. Well done!'
                  : classAverage >= 60
                  ? 'Good class performance with room for improvement.'
                  : 'Class needs more attention and support.'}
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Signatures</h4>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600">Class Teacher:</span>
                <div className="border-b border-gray-300 mt-1 h-4"></div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Principal:</span>
                <div className="border-b border-gray-300 mt-1 h-4"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Generated on {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}