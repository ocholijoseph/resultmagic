
'use client';

import { useState, useEffect } from 'react';
import ClassRanking from './ClassRanking';
import SubjectRanking from './SubjectRanking';

export default function ResultGeneration() {
  const [data, setData] = useState(null);
  const [rankedStudents, setRankedStudents] = useState([]);
  const [subjectRankings, setSubjectRankings] = useState({});
  const [viewMode, setViewMode] = useState('class');

  useEffect(() => {
    const savedData = localStorage.getItem('resultMagicData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setData(parsedData);
      calculateRankings(parsedData);
    }
  }, []);

  const calculateRankings = (data) => {
    if (!data || !data.students || !data.classData) return;

    // Calculate rankings using the correct data structure
    const sortedStudents = [...data.students].sort((a, b) => (b.average || 0) - (a.average || 0));
    
    let currentRank = 1;
    const rankedStudents = sortedStudents.map((student, index) => {
      if (index > 0 && (student.average || 0) < (sortedStudents[index - 1].average || 0)) {
        currentRank = index + 1;
      }
      return { ...student, position: currentRank };
    });

    setRankedStudents(rankedStudents);

    // Calculate subject rankings using subjectTotals
    const subjectRankings = {};
    if (data.classData.subjects && Array.isArray(data.classData.subjects)) {
      data.classData.subjects.forEach(subject => {
        const sortedBySubject = [...data.students].sort((a, b) => {
          const aScore = (a.subjectTotals && a.subjectTotals[subject]) ? a.subjectTotals[subject] : 0;
          const bScore = (b.subjectTotals && b.subjectTotals[subject]) ? b.subjectTotals[subject] : 0;
          return bScore - aScore;
        });
        
        let subjectRank = 1;
        const rankedBySubject = sortedBySubject.map((student, index) => {
          const currentScore = (student.subjectTotals && student.subjectTotals[subject]) ? student.subjectTotals[subject] : 0;
          const prevScore = index > 0 && sortedBySubject[index - 1].subjectTotals && sortedBySubject[index - 1].subjectTotals[subject] 
            ? sortedBySubject[index - 1].subjectTotals[subject] : 0;
            
          if (index > 0 && currentScore < prevScore) {
            subjectRank = index + 1;
          }
          return { ...student, position: subjectRank };
        });
        subjectRankings[subject] = rankedBySubject;
      });
    }

    setSubjectRankings(subjectRankings);
  };

  if (!data) {
    return (
      <div className="px-4 py-6 text-center">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-database-line text-gray-400 text-2xl"></i>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Data Found</h3>
          <p className="text-gray-600 mb-4">Please add students and scores first</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors !rounded-button"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Results & Rankings</h2>
        <p className="text-gray-600">View class and subject rankings</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-4">
        <div className="grid grid-cols-2 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setViewMode('class')}
            className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'class'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Class Ranking
          </button>
          <button
            onClick={() => setViewMode('subject')}
            className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'subject'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Subject Ranking
          </button>
        </div>
      </div>

      {viewMode === 'class' ? (
        <ClassRanking 
          classData={data.classData} 
          students={rankedStudents} 
        />
      ) : (
        <SubjectRanking 
          classData={data.classData} 
          subjectRankings={subjectRankings} 
        />
      )}
    </div>
  );
}
