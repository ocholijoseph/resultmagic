
'use client';

import { useState, useEffect } from 'react';

export default function StudentResult({ student, classData, totalStudents }) {
  const [schoolName, setSchoolName] = useState('');
  const [schoolHeadPosition, setSchoolHeadPosition] = useState('Principal');
  const [schoolLogo, setSchoolLogo] = useState('');

  useEffect(() => {
    const savedName = localStorage.getItem('resultMagicSchoolName');
    const savedPosition = localStorage.getItem('resultMagicSchoolHeadPosition');
    const savedLogo = localStorage.getItem('resultMagicSchoolLogo');
    
    if (savedName) {
      setSchoolName(savedName);
    }
    if (savedPosition) {
      setSchoolHeadPosition(savedPosition);
    }
    if (savedLogo) {
      setSchoolLogo(savedLogo);
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

  const getPerformanceLevel = (average) => {
    if (average >= 90) return 'Excellent';
    if (average >= 80) return 'Very Good';
    if (average >= 70) return 'Good';
    if (average >= 60) return 'Satisfactory';
    if (average >= 50) return 'Fair';
    return 'Needs Improvement';
  };

  const getSubjectGradingComponents = (subject) => {
    if (classData.subjectGradingComponents && classData.subjectGradingComponents[subject]) {
      return classData.subjectGradingComponents[subject];
    }
    return classData.gradingComponents || [];
  };

  const calculateSubjectTotal = (subject) => {
    // Safety check for componentScores
    if (!student.componentScores || !student.componentScores[subject]) {
      // Fallback to subjectTotals if componentScores is not available
      if (student.subjectTotals && student.subjectTotals[subject]) {
        return student.subjectTotals[subject];
      }
      return 0;
    }

    const componentScores = student.componentScores[subject];
    let total = 0;

    total += parseFloat(componentScores['1st CA'] || 0);
    total += parseFloat(componentScores['2nd CA'] || 0);
    total += parseFloat(componentScores['Project'] || 0);
    total += parseFloat(componentScores['Assessment'] || 0);
    total += parseFloat(componentScores['Examination'] || 0);

    return Math.round(total);
  };

  const calculateOverallStats = () => {
    if (!classData || !classData.subjects || !Array.isArray(classData.subjects)) {
      return { overallTotal: 0, average: 0 };
    }

    let totalMarks = 0;
    const subjectCount = classData.subjects.length;
    
    classData.subjects.forEach(subject => {
      totalMarks += calculateSubjectTotal(subject);
    });

    const overallTotal = totalMarks;
    const average = subjectCount > 0 ? Math.round(totalMarks / subjectCount) : 0;
    
    return { overallTotal, average };
  };

  const { overallTotal, average } = calculateOverallStats();

  if (!student || !classData) {
    return (
      <div className="print-content bg-white p-6">
        <div className="text-center">
          <p className="text-gray-600">No student data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="print-content bg-white p-6 print:p-4 print:max-w-none print:w-full print:h-auto print:shadow-none print:rounded-none print:m-0">
      <style dangerouslySetInnerHTML={{
        __html: `
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
            .print-content tbody tr {
              height: 24px;
            }
            .print-content tbody td {
              padding: 2px 8px;
              vertical-align: middle;
            }
            .print-content thead th {
              padding: 4px 8px;
            }
          }
        `
      }} />

      <div className="text-center mb-6 border-b-2 border-gray-200 pb-4">
        <div className="flex items-center justify-center space-x-4 mb-2">
          {schoolLogo && (
            <img
              src={schoolLogo}
              alt="School Logo"
              className="w-16 h-16 object-contain"
            />
          )}
          <div>
            {schoolName && (
              <h1 className="text-2xl font-bold text-gray-800 mb-1">
                {schoolName}
              </h1>
            )}
            <h3 className="text-lg font-medium text-gray-600">Student Result Sheet</h3>
          </div>
        </div>
        <p className="text-gray-600">{classData.examType} - {classData.term}</p>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Student Information</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Name:</span>
              <span className="font-medium">{student.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Admission No.:</span>
              <span className="font-medium">{student.admissionNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Class:</span>
              <span className="font-medium">{classData.className}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Position:</span>
              <span className="font-medium">{student.position} of {totalStudents}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Overall Total:</span>
              <span className="font-medium">{overallTotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Average:</span>
              <span className="font-medium">{average}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Performance Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Overall Grade:</span>
              <span className="font-medium">{getGrade(average)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Performance:</span>
              <span className="font-medium">{getPerformanceLevel(average)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Subjects:</span>
              <span className="font-medium">{classData.subjects ? classData.subjects.length : 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Subject Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-3 py-1 text-left">Subject</th>
                <th className="border border-gray-300 px-2 py-1 text-center">1st CA</th>
                <th className="border border-gray-300 px-2 py-1 text-center">2nd CA</th>
                <th className="border border-gray-300 px-2 py-1 text-center">Project</th>
                <th className="border border-gray-300 px-2 py-1 text-center">Assessment</th>
                <th className="border border-gray-300 px-2 py-1 text-center">Examination</th>
                <th className="border border-gray-300 px-3 py-1 text-center">Total (100)</th>
                <th className="border border-gray-300 px-3 py-1 text-center">Grade</th>
              </tr>
            </thead>
            <tbody>
              {classData.subjects && classData.subjects.map((subject) => {
                const componentScores = (student.componentScores && student.componentScores[subject]) || {};
                const subjectTotal = calculateSubjectTotal(subject);

                return (
                  <tr key={subject} className="h-6">
                    <td className="border border-gray-300 px-3 py-1 font-medium">{subject}</td>
                    <td className="border border-gray-300 px-2 py-1 text-center text-sm">
                      {componentScores['1st CA'] || 0}
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-center text-sm">
                      {componentScores['2nd CA'] || 0}
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-center text-sm">
                      {componentScores['Project'] || 'N/A'}
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-center text-sm">
                      {componentScores['Assessment'] || 'N/A'}
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-center text-sm">
                      {componentScores['Examination'] || 0}
                    </td>
                    <td className="border border-gray-300 px-3 py-1 text-center font-medium">
                      {subjectTotal}
                    </td>
                    <td className="border border-gray-300 px-3 py-1 text-center">
                      {getGrade(subjectTotal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-3 text-sm text-gray-600">
          <p><strong>Note:</strong> Each subject is graded out of 100 total marks per term.</p>
          <p>Components may vary by subject. N/A indicates component not applicable for that subject.</p>
        </div>
      </div>

      <div className="border-t-2 border-gray-200 pt-4">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Teacher's Comments</h4>
            <div className="border border-gray-200 rounded-lg p-3 h-16 bg-gray-50">
              <p className="text-sm text-gray-600">
                {average >= 80
                  ? 'Excellent performance across all components. Keep up the good work!'
                  : average >= 60
                  ? 'Good effort in most areas. Continue to strive for excellence.'
                  : 'More effort needed in continuous assessments. Please see me for additional support.'
                }
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
                <span className="text-sm text-gray-600">{schoolHeadPosition}:</span>
                <div className="border-b border-gray-300 mt-1 h-4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
