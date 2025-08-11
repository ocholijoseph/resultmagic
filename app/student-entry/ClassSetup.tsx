
'use client';

import { useState } from 'react';

export default function ClassSetup({ onSetup }) {
  const [className, setClassName] = useState('');
  const [examType, setExamType] = useState('');
  const [term, setTerm] = useState('');
  const [subjects, setSubjects] = useState(['Mathematics', 'English', 'Science']);
  const [newSubject, setNewSubject] = useState('');
  const [gradingComponents, setGradingComponents] = useState([
    { name: '1st CA', percentage: 10 },
    { name: '2nd CA', percentage: 10 },
    { name: 'Project', percentage: 10 },
    { name: 'Assessment', percentage: 10 },
    { name: 'Examination', percentage: 60 }
  ]);
  const [subjectGradingComponents, setSubjectGradingComponents] = useState({});
  const [showSubjectCustomization, setShowSubjectCustomization] = useState(false);

  const addSubject = () => {
    if (newSubject.trim() && !subjects.includes(newSubject.trim())) {
      setSubjects([...subjects, newSubject.trim()]);
      setNewSubject('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSubject();
    }
  };

  const removeSubject = (subject) => {
    setSubjects(subjects.filter(s => s !== subject));
    const newSubjectGrading = { ...subjectGradingComponents };
    delete newSubjectGrading[subject];
    setSubjectGradingComponents(newSubjectGrading);
  };

  const updateComponentPercentage = (index, percentage) => {
    const newComponents = [...gradingComponents];
    newComponents[index].percentage = Math.max(0, Math.min(100, parseInt(percentage) || 0));
    setGradingComponents(newComponents);
  };

  const getTotalPercentage = () => {
    return gradingComponents.reduce((sum, comp) => sum + comp.percentage, 0);
  };

  const updateSubjectGradingComponent = (subject, componentIndex, field, value) => {
    const subjectComponents = subjectGradingComponents[subject] || [...gradingComponents];
    const newComponents = [...subjectComponents];
    
    if (field === 'percentage') {
      newComponents[componentIndex].percentage = Math.max(0, Math.min(100, parseInt(value) || 0));
    } else if (field === 'enabled') {
      newComponents[componentIndex].enabled = value;
    }
    
    setSubjectGradingComponents({
      ...subjectGradingComponents,
      [subject]: newComponents
    });
  };

  const getSubjectTotalPercentage = (subject) => {
    const subjectComponents = subjectGradingComponents[subject] || gradingComponents;
    return subjectComponents
      .filter(comp => comp.enabled !== false)
      .reduce((sum, comp) => sum + comp.percentage, 0);
  };

  const applyCommonTemplate = (templateType) => {
    const templates = {
      'with-project': [
        { name: '1st CA', percentage: 10, enabled: true },
        { name: '2nd CA', percentage: 10, enabled: true },
        { name: 'Project', percentage: 10, enabled: true },
        { name: 'Assessment', percentage: 10, enabled: true },
        { name: 'Examination', percentage: 60, enabled: true }
      ],
      'without-project': [
        { name: '1st CA', percentage: 20, enabled: true },
        { name: '2nd CA', percentage: 20, enabled: true },
        { name: 'Project', percentage: 0, enabled: false },
        { name: 'Assessment', percentage: 0, enabled: false },
        { name: 'Examination', percentage: 60, enabled: true }
      ]
    };

    const newSubjectGrading = {};
    subjects.forEach(subject => {
      newSubjectGrading[subject] = [...templates[templateType]];
    });
    setSubjectGradingComponents(newSubjectGrading);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate all subjects have 100% total
    const allValid = subjects.every(subject => getSubjectTotalPercentage(subject) === 100);
    
    if (className && examType && term && subjects.length > 0 && allValid) {
      // Prepare final grading components for each subject
      const finalSubjectGrading = {};
      subjects.forEach(subject => {
        const subjectComponents = subjectGradingComponents[subject] || gradingComponents;
        finalSubjectGrading[subject] = subjectComponents.filter(comp => comp.enabled !== false);
      });
      
      onSetup({ 
        className, 
        examType, 
        term, 
        subjects, 
        gradingComponents, 
        subjectGradingComponents: finalSubjectGrading 
      });
    }
  };

  const saveAsTemplate = () => {
    const allValid = subjects.every(subject => getSubjectTotalPercentage(subject) === 100);
    
    if (className && examType && term && subjects.length > 0 && allValid) {
      const templateName = `${className} ${examType}`;
      
      // Prepare final grading components for each subject
      const finalSubjectGrading = {};
      subjects.forEach(subject => {
        const subjectComponents = subjectGradingComponents[subject] || gradingComponents;
        finalSubjectGrading[subject] = subjectComponents.filter(comp => comp.enabled !== false);
      });
      
      const template = {
        id: Date.now(),
        name: templateName,
        className,
        examType,
        term,
        subjects: [...subjects],
        gradingComponents: [...gradingComponents],
        subjectGradingComponents: finalSubjectGrading,
        createdAt: new Date().toISOString()
      };
      
      const existingTemplates = JSON.parse(localStorage.getItem('resultMagicTemplates') || '[]');
      const updatedTemplates = [...existingTemplates, template];
      localStorage.setItem('resultMagicTemplates', JSON.stringify(updatedTemplates));
      
      // Show success message
      const successDiv = document.createElement('div');
      successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      successDiv.textContent = 'Template saved successfully!';
      document.body.appendChild(successDiv);
      setTimeout(() => successDiv.remove(), 3000);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4">
          <i className="ri-school-line text-white text-xl"></i>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Class Setup</h3>
          <p className="text-sm text-gray-600">Configure your class details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Class Name
          </label>
          <input
            type="text"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            placeholder="e.g., Grade 5A"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Exam Type
          </label>
          <input
            type="text"
            value={examType}
            onChange={(e) => setExamType(e.target.value)}
            placeholder="e.g., Mid-term Exam"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Term/Session
          </label>
          <input
            type="text"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="e.g., First Term 2024"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subjects
          </label>
          <div className="flex space-x-2 mb-3">
            <input
              type="text"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add subject"
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={addSubject}
              disabled={!newSubject.trim() || subjects.includes(newSubject.trim())}
              className="px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed !rounded-button"
            >
              <i className="ri-add-line"></i>
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {subjects.map((subject) => (
              <div key={subject} className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                <span className="text-sm text-gray-700 mr-2">{subject}</span>
                <button
                  type="button"
                  onClick={() => removeSubject(subject)}
                  className="w-4 h-4 flex items-center justify-center text-gray-500 hover:text-red-500"
                >
                  <i className="ri-close-line text-xs"></i>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Grading Components
            </label>
            <button
              type="button"
              onClick={() => setShowSubjectCustomization(!showSubjectCustomization)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {showSubjectCustomization ? 'Hide' : 'Customize per Subject'}
            </button>
          </div>

          {!showSubjectCustomization && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              {gradingComponents.map((component, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-700 w-20">{component.name}</span>
                  <div className="flex-1 flex items-center space-x-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={component.percentage}
                      onChange={(e) => updateComponentPercentage(index, e.target.value)}
                      className="w-16 px-2 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">%</span>
                  </div>
                </div>
              ))}
              <div className="border-t pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Total:</span>
                  <span className={`text-sm font-bold ${getTotalPercentage() === 100 ? 'text-green-600' : 'text-red-600'}`}>
                    {getTotalPercentage()}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {showSubjectCustomization && (
            <div className="space-y-4">
              <div className="flex space-x-2 mb-4">
                <button
                  type="button"
                  onClick={() => applyCommonTemplate('with-project')}
                  className="flex-1 bg-blue-100 text-blue-700 py-2 px-3 rounded-lg text-sm hover:bg-blue-200 transition-colors !rounded-button"
                >
                  Apply: With Project (10%+10%+10%+10%+60%)
                </button>
                <button
                  type="button"
                  onClick={() => applyCommonTemplate('without-project')}
                  className="flex-1 bg-green-100 text-green-700 py-2 px-3 rounded-lg text-sm hover:bg-green-200 transition-colors !rounded-button"
                >
                  Apply: Without Project (20%+20%+60%)
                </button>
              </div>

              {subjects.map((subject) => (
                <div key={subject} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-800">{subject}</h4>
                    <span className={`text-sm font-bold ${getSubjectTotalPercentage(subject) === 100 ? 'text-green-600' : 'text-red-600'}`}>
                      {getSubjectTotalPercentage(subject)}%
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {(subjectGradingComponents[subject] || gradingComponents).map((component, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={component.enabled !== false}
                          onChange={(e) => updateSubjectGradingComponent(subject, index, 'enabled', e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700 w-20">{component.name}</span>
                        <div className="flex-1 flex items-center space-x-2">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={component.percentage}
                            onChange={(e) => updateSubjectGradingComponent(subject, index, 'percentage', e.target.value)}
                            disabled={component.enabled === false}
                            className="w-16 px-2 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                          />
                          <span className="text-sm text-gray-600">%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={saveAsTemplate}
            disabled={!subjects.every(subject => getSubjectTotalPercentage(subject) === 100)}
            className="flex-1 bg-green-500 text-white py-3 rounded-xl font-medium hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed !rounded-button"
          >
            Save as Template
          </button>
          <button
            type="submit"
            disabled={!subjects.every(subject => getSubjectTotalPercentage(subject) === 100)}
            className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed !rounded-button"
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  );
}
