
'use client';

import { useState, useEffect } from 'react';
import StudentResult from './StudentResult';
import ClassSummary from './ClassSummary';

export default function PrintResults() {
  const [data, setData] = useState(null);
  const [rankedStudents, setRankedStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [printMode, setPrintMode] = useState('individual');

  useEffect(() => {
    const savedData = localStorage.getItem('resultMagicData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setData(parsedData);
      calculateRankings(parsedData);
    }
  }, []);

  const calculateRankings = (data) => {
    if (!data || !data.students) return;

    const sortedStudents = [...data.students].sort((a, b) => (b.average || 0) - (a.average || 0));
    
    let currentRank = 1;
    const rankedStudents = sortedStudents.map((student, index) => {
      if (index > 0 && (student.average || 0) < (sortedStudents[index - 1].average || 0)) {
        currentRank = index + 1;
      }
      return { ...student, position: currentRank };
    });

    setRankedStudents(rankedStudents);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!data) {
    return (
      <div className="px-4 py-6 text-center">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-printer-line text-gray-400 text-2xl"></i>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Data to Print</h3>
          <p className="text-gray-600">Please add students and generate results first</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Print Results</h2>
        <p className="text-gray-600">Generate printable result sheets</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-4">
        <div className="grid grid-cols-2 bg-gray-100 rounded-xl p-1 mb-4">
          <button
            onClick={() => setPrintMode('individual')}
            className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              printMode === 'individual'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Individual
          </button>
          <button
            onClick={() => setPrintMode('summary')}
            className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              printMode === 'summary'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Class Summary
          </button>
        </div>

        {printMode === 'individual' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Student
              </label>
              <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                {rankedStudents.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                    className={`p-3 rounded-lg text-left transition-colors ${
                      selectedStudent?.id === student.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } !rounded-button`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{student.name}</span>
                        <span className="text-sm opacity-75 ml-2">#{student.admissionNumber}</span>
                      </div>
                      <span className="text-sm opacity-75">#{student.position}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handlePrint}
              disabled={!selectedStudent}
              className="w-full bg-blue-500 text-white py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed !rounded-button"
            >
              <i className="ri-printer-line mr-2"></i>
              Print Individual Result
            </button>
          </div>
        )}

        {printMode === 'summary' && (
          <button
            onClick={handlePrint}
            className="w-full bg-green-500 text-white py-3 rounded-xl font-medium hover:bg-green-600 transition-colors !rounded-button"
          >
            <i className="ri-printer-line mr-2"></i>
            Print Class Summary
          </button>
        )}
      </div>

      <div className="print-content">
        {printMode === 'individual' && selectedStudent ? (
          <StudentResult 
            student={selectedStudent} 
            classData={data.classData} 
            totalStudents={rankedStudents.length}
          />
        ) : printMode === 'summary' ? (
          <ClassSummary 
            classData={data.classData} 
            students={rankedStudents}
          />
        ) : null}
      </div>
    </div>
  );
}
