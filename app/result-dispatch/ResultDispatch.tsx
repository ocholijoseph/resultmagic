
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, getCurrentSchool, isAdmin } from '../../lib/auth';
import { getSchoolSpecificData } from '../../lib/schoolManager';

export default function ResultDispatch() {
  const [user, setUser] = useState(null);
  const [allResults, setAllResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [dispatchMethod, setDispatchMethod] = useState('email');
  const [customMessage, setCustomMessage] = useState('');
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchHistory, setDispatchHistory] = useState([]);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printStudent, setPrintStudent] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const currentUser = getCurrentUser();
    const currentSchool = getCurrentSchool();

    if (!currentUser || !currentSchool || !isAdmin(currentUser)) {
      router.push('/');
      return;
    }

    setUser(currentUser);
    loadResults();
    loadDispatchHistory();
  }, [router]);

  const loadResults = () => {
    const results = getSchoolSpecificData('studentResultsDatabase');
    setAllResults(results);
  };

  const loadDispatchHistory = () => {
    const history = getSchoolSpecificData('resultDispatchHistory');
    setDispatchHistory(history);
  };

  const saveDispatchHistory = (newRecord) => {
    const history = getSchoolSpecificData('resultDispatchHistory');
    const updatedHistory = [...history, newRecord];
    setDispatchHistory(updatedHistory);

    // Save to localStorage
    const currentSchool = getCurrentSchool();
    localStorage.setItem(`resultDispatchHistory_${currentSchool}`, JSON.stringify(updatedHistory));
  };

  const handleResultSelect = (result) => {
    setSelectedResult(result);
    setSelectedStudents([]);
  };

  const handleStudentToggle = (studentId) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === selectedResult.students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(selectedResult.students.map(s => s.id));
    }
  };

  const getWhatsAppMessage = (student) => {
    const defaultMessage = `Hello ${student.parentDetails.fullName},\n\nThis is ${selectedResult.classData.className} ${selectedResult.term} results for ${student.name} (${student.admissionNumber}).\n\nOverall Average: ${student.average}%\n\nSubject Breakdown:\n${selectedResult.classData.subjects.map(subject => `• ${subject}: ${student.subjectTotals[subject]}%`).join('\n')}\n\nBest regards,\nSchool Administration`;
    
    return customMessage || defaultMessage;
  };

  const getEmailContent = (student) => {
    const defaultMessage = `
      <h3>Student Result - ${selectedResult.term}</h3>
      <p>Dear ${student.parentDetails.fullName},</p>
      <p>Please find below the ${selectedResult.term} results for <strong>${student.name}</strong> (Admission Number: ${student.admissionNumber}):</p>
      
      <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h4>Overall Performance</h4>
        <p><strong>Average Score:</strong> ${student.average}%</p>
        <p><strong>Total Score:</strong> ${student.overallTotal}%</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h4>Subject Breakdown</h4>
        ${selectedResult.classData.subjects.map(subject =>
          `<p><strong>${subject}:</strong> ${student.subjectTotals[subject]}%</p>`
        ).join('')}
      </div>
      
      <p>Thank you for your continued support.</p>
      <p>Best regards,<br/>School Administration</p>
    `;
    
    return customMessage || defaultMessage;
  };

  const simulateWhatsAppSend = (student) => {
    const message = getWhatsAppMessage(student);
    const phoneNumber = student.parentDetails.phoneNumber.replace(/\\D/g, '');
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const simulateEmailSend = (student) => {
    const subject = `${selectedResult.classData.className} - ${selectedResult.term} Results for ${student.name}`;
    const body = getEmailContent(student);
    const emailUrl = `mailto:${student.parentDetails.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body.replace(/<[^>]*>/g, ''))}`;
    window.open(emailUrl, '_blank');
  };

  const handleDispatchResults = async () => {
    if (selectedStudents.length === 0) {
      alert('Please select at least one student');
      return;
    }

    setIsDispatching(true);

    const studentsToDispatch = selectedResult.students.filter(s => selectedStudents.includes(s.id));
    const successfulDispatches = [];
    const failedDispatches = [];

    for (const student of studentsToDispatch) {
      try {
        if (dispatchMethod === 'email' && student.parentDetails.email) {
          simulateEmailSend(student);
          successfulDispatches.push({
            studentName: student.name,
            parentName: student.parentDetails.fullName,
            method: 'email',
            contact: student.parentDetails.email
          });
        } else if (dispatchMethod === 'whatsapp' && student.parentDetails.phoneNumber) {
          simulateWhatsAppSend(student);
          successfulDispatches.push({
            studentName: student.name,
            parentName: student.parentDetails.fullName,
            method: 'whatsapp',
            contact: student.parentDetails.phoneNumber
          });
        } else {
          failedDispatches.push({
            studentName: student.name,
            parentName: student.parentDetails.fullName,
            reason: `No ${dispatchMethod} contact available`
          });
        }
      } catch (error) {
        failedDispatches.push({
          studentName: student.name,
          parentName: student.parentDetails.fullName,
          reason: error.message
        });
      }
    }

    // Save dispatch record
    const dispatchRecord = {
      id: Date.now(),
      resultId: selectedResult.id,
      className: selectedResult.classData.className,
      term: selectedResult.term,
      method: dispatchMethod,
      timestamp: new Date().toISOString(),
      successful: successfulDispatches,
      failed: failedDispatches,
      totalStudents: selectedStudents.length,
      dispatchedBy: user.name
    };

    saveDispatchHistory(dispatchRecord);

    setIsDispatching(false);
    setSelectedStudents([]);

    // Show success message
    const successDiv = document.createElement('div');
    successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    successDiv.textContent = `Results dispatched to ${successfulDispatches.length} parent(s)`;
    document.body.appendChild(successDiv);
    setTimeout(() => successDiv.remove(), 3000);

    if (failedDispatches.length > 0) {
      alert(`${failedDispatches.length} dispatch(es) failed. Check dispatch history for details.`);
    }
  };

  const handlePrintResult = (student) => {
    setPrintStudent(student);
    setShowPrintModal(true);
  };

  const handlePrintAll = () => {
    if (selectedStudents.length === 0) {
      alert('Please select at least one student to print');
      return;
    }

    const studentsData = selectedResult.students.filter(s => selectedStudents.includes(s.id));
    const printData = {
      classData: selectedResult.classData,
      students: studentsData,
      term: selectedResult.term,
      academicYear: selectedResult.academicYear,
      timestamp: selectedResult.timestamp
    };

    // Store print data temporarily
    localStorage.setItem('tempPrintData', JSON.stringify(printData));

    // Open print page in new window
    const printWindow = window.open('/print-results', '_blank');

    // Clean up after a short delay
    setTimeout(() => {
      localStorage.removeItem('tempPrintData');
    }, 5000);
  };

  const renderStudentResult = (student) => {
    const getGrade = (score) => {
      if (score >= 90) return 'A+';
      if (score >= 80) return 'A';
      if (score >= 70) return 'B';
      if (score >= 60) return 'C';
      if (score >= 50) return 'D';
      return 'F';
    };

    return (
      <div className="bg-white p-6 print:p-4 print:max-w-none print:w-full print:h-auto print:shadow-none print:rounded-none print:m-0">
        <style dangerouslySetInnerHTML={{
          __html: `
            @media print {
              body * {
                visibility: hidden;
              }
              .print-modal-content, .print-modal-content * {
                visibility: visible;
              }
              .print-modal-content {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                padding: 20px;
                font-size: 12px;
                line-height: 1.3;
              }
              .print-modal-content .text-2xl {
                font-size: 18px;
              }
              .print-modal-content .text-lg {
                font-size: 14px;
              }
              .print-modal-content .text-sm {
                font-size: 10px;
              }
              .print-modal-content table {
                font-size: 10px;
              }
              .print-modal-content .mb-6 {
                margin-bottom: 16px;
              }
              .print-modal-content .mb-4 {
                margin-bottom: 8px;
              }
            }
          `
        }} />

        <div className="text-center mb-6 border-b-2 border-gray-200 pb-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {localStorage.getItem('resultMagicSchoolName') || 'School Name'}
          </h1>
          <h3 className="text-lg font-medium text-gray-600">Student Result Sheet</h3>
          <p className="text-gray-600">{selectedResult.classData.examType} - {selectedResult.term}</p>
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
                <span className="font-medium">{selectedResult.classData.className}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Position:</span>
                <span className="font-medium">{student.position} of {selectedResult.students.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Average:</span>
                <span className="font-medium">{student.average}%</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Parent Information</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Parent/Guardian:</span>
                <span className="font-medium">{student.parentDetails.fullName}</span>
              </div>
              {student.parentDetails.phoneNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium">{student.parentDetails.phoneNumber}</span>
                </div>
              )}
              {student.parentDetails.email && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{student.parentDetails.email}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Overall Grade:</span>
                <span className="font-medium">{getGrade(student.average)}</span>
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
                  <th className="border border-gray-300 px-3 py-2 text-left">Subject</th>
                  <th className="border border-gray-300 px-3 py-2 text-center">Score</th>
                  <th className="border border-gray-300 px-3 py-2 text-center">Grade</th>
                </tr>
              </thead>
              <tbody>
                {selectedResult.classData.subjects.map((subject) => {
                  const score = student.subjectTotals[subject] || 0;
                  return (
                    <tr key={subject}>
                      <td className="border border-gray-300 px-3 py-2 font-medium">{subject}</td>
                      <td className="border border-gray-300 px-3 py-2 text-center">{score}%</td>
                      <td className="border border-gray-300 px-3 py-2 text-center">{getGrade(score)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="border-t-2 border-gray-200 pt-4">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Teacher's Comments</h4>
              <div className="border border-gray-200 rounded-lg p-3 h-16 bg-gray-50">
                <p className="text-sm text-gray-600">
                  {student.average >= 80
                    ? 'Excellent performance. Keep up the good work!'
                    : student.average >= 60
                    ? 'Good effort. Continue to strive for excellence.'
                    : 'More effort needed. Please see teacher for additional support.'
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
                  <span className="text-sm text-gray-600">Principal:</span>
                  <div className="border-b border-gray-300 mt-1 h-4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Generated on {new Date().toLocaleDateString()} • Official School Document
          </p>
        </div>
      </div>
    );
  };

  if (!user) {
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
    <div className="px-4 py-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Result Dispatch</h2>
        <p className="text-gray-600">Send results to parents via email or WhatsApp</p>
      </div>

      {/* Results Selection */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Results to Dispatch</h3>

        {allResults.length === 0 ? (
          <div className="text-center py-8">
            <i className="ri-file-list-line text-gray-400 text-2xl mb-4"></i>
            <p className="text-gray-500">No results available for dispatch</p>
          </div>
        ) : (
          <div className="space-y-3">
            {allResults.map((result) => (
              <div 
                key={result.id} 
                className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  selectedResult?.id === result.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleResultSelect(result)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-800">{result.classData.className}</h4>
                    <p className="text-sm text-gray-600">{result.term} - {result.academicYear}</p>
                    <p className="text-sm text-gray-500">{result.students.length} students</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-500">
                      {new Date(result.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedResult && (
        <>
          {/* Student Selection */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Select Students</h3>
              <div className="flex space-x-2">
                <button
                  onClick={handlePrintAll}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors !rounded-button"
                >
                  <i className="ri-printer-line mr-1"></i>
                  Print Selected
                </button>
                <button
                  onClick={handleSelectAll}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors !rounded-button"
                >
                  {selectedStudents.length === selectedResult.students.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {selectedResult.students.map((student) => (
                <div key={student.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(student.id)}
                    onChange={() => handleStudentToggle(student.id)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{student.name}</div>
                    <div className="text-sm text-gray-600">#{student.admissionNumber}</div>
                    <div className="text-sm text-blue-600">
                      Parent: {student.parentDetails.fullName}
                      {student.parentDetails.phoneNumber && ` • ${student.parentDetails.phoneNumber}`}
                      {student.parentDetails.email && ` • ${student.parentDetails.email}`}
                    </div>
                  </div>
                  <div className="text-right flex items-center space-x-2">
                    <button
                      onClick={() => handlePrintResult(student)}
                      className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors !rounded-button"
                      title="Print individual result"
                    >
                      <i className="ri-printer-line"></i>
                    </button>
                    <div className="font-bold text-green-600">{student.average}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dispatch Method & Custom Message */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Dispatch Options</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dispatch Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setDispatchMethod('email')}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      dispatchMethod === 'email' 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <i className="ri-mail-line text-xl mb-2"></i>
                    <div className="font-medium">Email</div>
                  </button>
                  <button
                    onClick={() => setDispatchMethod('whatsapp')}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      dispatchMethod === 'whatsapp' 
                        ? 'border-green-500 bg-green-50 text-green-700' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <i className="ri-whatsapp-line text-xl mb-2"></i>
                    <div className="font-medium">WhatsApp</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Message (Optional)
                </label>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Enter custom message or leave empty for default message..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="4"
                />
              </div>

              <button
                onClick={handleDispatchResults}
                disabled={selectedStudents.length === 0 || isDispatching}
                className="w-full bg-blue-500 text-white py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed !rounded-button"
              >
                {isDispatching ? (
                  <>
                    <i className="ri-loader-4-line animate-spin mr-2"></i>
                    Dispatching...
                  </>
                ) : (
                  <>
                    <i className="ri-send-plane-line mr-2"></i>
                    Dispatch to {selectedStudents.length} Parent(s)
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Print Modal */}
      {showPrintModal && printStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Print Result - {printStudent.name}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors !rounded-button"
                  >
                    <i className="ri-printer-line mr-2"></i>
                    Print
                  </button>
                  <button
                    onClick={() => setShowPrintModal(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors !rounded-button"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
            <div className="print-modal-content">
              {renderStudentResult(printStudent)}
            </div>
          </div>
        </div>
      )}

      {/* Dispatch History */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Dispatch History</h3>

        {dispatchHistory.length === 0 ? (
          <div className="text-center py-8">
            <i className="ri-history-line text-gray-400 text-2xl mb-4"></i>
            <p className="text-gray-500">No dispatch history available</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {dispatchHistory.reverse().map((record) => (
              <div key={record.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-gray-800">{record.className} - {record.term}</h4>
                    <p className="text-sm text-gray-600">
                      Dispatched by {record.dispatchedBy} via {record.method}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">
                      {new Date(record.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-green-600">
                    <i className="ri-checkbox-circle-line mr-1"></i>
                    {record.successful.length} successful
                  </div>
                  <div className="text-red-600">
                    <i className="ri-error-warning-line mr-1"></i>
                    {record.failed.length} failed
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
