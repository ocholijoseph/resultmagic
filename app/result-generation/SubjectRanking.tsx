
'use client';

import { useState } from 'react';

export default function SubjectRanking({ classData, subjectRankings }) {
  const [selectedSubject, setSelectedSubject] = useState(classData.subjects && classData.subjects.length > 0 ? classData.subjects[0] : '');

  const getPositionBadge = (position) => {
    const colors = {
      1: 'bg-yellow-500',
      2: 'bg-gray-400',
      3: 'bg-orange-500'
    };
    return colors[position] || 'bg-blue-500';
  };

  const currentRanking = subjectRankings[selectedSubject] || [];

  const getSubjectScore = (student, subject) => {
    if (!student.subjectTotals || !student.subjectTotals[subject]) return 0;
    return student.subjectTotals[subject];
  };

  const calculateSubjectAverage = () => {
    if (!currentRanking.length) return 0;
    const total = currentRanking.reduce((sum, s) => sum + getSubjectScore(s, selectedSubject), 0);
    return (total / currentRanking.length).toFixed(1);
  };

  const getHighestScore = () => {
    if (!currentRanking.length) return 0;
    return Math.max(...currentRanking.map(s => getSubjectScore(s, selectedSubject)));
  };

  const getPassCount = () => {
    return currentRanking.filter(s => getSubjectScore(s, selectedSubject) >= 60).length;
  };

  if (!classData.subjects || !classData.subjects.length) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-book-open-line text-gray-400 text-2xl"></i>
          </div>
          <p className="text-gray-500">No subjects available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center mr-4">
          <i className="ri-book-open-line text-white text-xl"></i>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Subject Rankings</h3>
          <p className="text-sm text-gray-600">Performance by subject</p>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Subject
        </label>
        <div className="grid grid-cols-2 gap-2">
          {classData.subjects.map((subject) => (
            <button
              key={subject}
              onClick={() => setSelectedSubject(subject)}
              className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                selectedSubject === subject
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } !rounded-button`}
            >
              {subject}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {currentRanking.map((student) => (
          <div key={student.id} className="flex items-center p-4 bg-gray-50 rounded-xl">
            <div className={`w-8 h-8 ${getPositionBadge(student.position)} rounded-full flex items-center justify-center mr-4`}>
              <span className="text-white font-bold text-sm">{student.position}</span>
            </div>
            
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800">{student.name}</h4>
              <p className="text-sm text-gray-600">#{student.admissionNumber}</p>
              <div className="flex items-center space-x-4 mt-1">
                <span className="text-sm text-gray-600">
                  Score: {getSubjectScore(student, selectedSubject)}%
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  getSubjectScore(student, selectedSubject) >= 80
                    ? 'bg-green-100 text-green-800'
                    : getSubjectScore(student, selectedSubject) >= 60
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {getSubjectScore(student, selectedSubject) >= 80 ? 'Excellent' : 
                   getSubjectScore(student, selectedSubject) >= 60 ? 'Good' : 'Needs Improvement'}
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-lg font-bold text-gray-800">
                  {getSubjectScore(student, selectedSubject)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-green-50 rounded-xl">
        <h4 className="font-semibold text-green-800 mb-2">{selectedSubject} Statistics</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">
              {calculateSubjectAverage()}%
            </div>
            <div className="text-xs text-green-700">Average Score</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">
              {getHighestScore()}%
            </div>
            <div className="text-xs text-green-700">Highest Score</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">
              {getPassCount()}
            </div>
            <div className="text-xs text-green-700">Pass Count</div>
          </div>
        </div>
      </div>
    </div>
  );
}
