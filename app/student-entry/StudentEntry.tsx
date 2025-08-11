'use client';

import { useState } from 'react';
import ClassSetup from './ClassSetup';
import ScoreEntry from './ScoreEntry';
import TemplateManager from '../templates/TemplateManager';

export default function StudentEntry() {
  const [classData, setClassData] = useState(null);
  const [students, setStudents] = useState([]);
  const [showTemplates, setShowTemplates] = useState(false);

  const handleUseTemplate = (templateData) => {
    setClassData(templateData);
    setShowTemplates(false);
  };

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Student Entry</h2>
        <p className="text-gray-600">Set up your class and enter student scores</p>
      </div>

      {showTemplates ? (
        <TemplateManager 
          onUseTemplate={handleUseTemplate}
          onBack={() => setShowTemplates(false)}
        />
      ) : !classData ? (
        <div className="space-y-4">
          <button
            onClick={() => setShowTemplates(true)}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all !rounded-button"
          >
            <i className="ri-file-list-3-line mr-2"></i>
            Use Template
          </button>
          <ClassSetup onSetup={setClassData} />
        </div>
      ) : (
        <ScoreEntry 
          classData={classData} 
          students={students}
          setStudents={setStudents}
          onReset={() => setClassData(null)}
        />
      )}
    </div>
  );
}