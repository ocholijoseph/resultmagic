
'use client';

import { useState, useEffect } from 'react';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    className: '',
    examType: '',
    term: '',
    subjects: ['Mathematics', 'English', 'Science'],
    gradingComponents: [
      { name: '1st CA', percentage: 10 },
      { name: '2nd CA', percentage: 10 },
      { name: 'Project', percentage: 10 },
      { name: 'Assessment', percentage: 10 },
      { name: 'Examination', percentage: 60 }
    ]
  });
  const [newSubject, setNewSubject] = useState('');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    const savedTemplates = localStorage.getItem('resultMagicTemplates');
    if (savedTemplates) {
      setTemplates(JSON.parse(savedTemplates));
    }
  };

  const saveTemplates = (templatesData) => {
    localStorage.setItem('resultMagicTemplates', JSON.stringify(templatesData));
    setTemplates(templatesData);
  };

  const createTemplate = () => {
    if (formData.name && formData.className && formData.examType && formData.term && getTotalPercentage() === 100) {
      const newTemplate = {
        id: Date.now(),
        name: formData.name,
        className: formData.className,
        examType: formData.examType,
        term: formData.term,
        subjects: [...formData.subjects],
        gradingComponents: [...formData.gradingComponents],
        createdAt: new Date().toISOString()
      };
      
      const updatedTemplates = [...templates, newTemplate];
      saveTemplates(updatedTemplates);
      resetForm();
      
      // Show success message
      const successDiv = document.createElement('div');
      successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      successDiv.textContent = 'Template created successfully!';
      document.body.appendChild(successDiv);
      setTimeout(() => successDiv.remove(), 3000);
    }
  };

  const updateTemplate = () => {
    if (editingTemplate && formData.name && formData.className && formData.examType && formData.term && getTotalPercentage() === 100) {
      const updatedTemplates = templates.map(template =>
        template.id === editingTemplate.id
          ? { ...template, ...formData, subjects: [...formData.subjects], gradingComponents: [...formData.gradingComponents] }
          : template
      );
      saveTemplates(updatedTemplates);
      resetForm();
      
      // Show success message
      const successDiv = document.createElement('div');
      successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      successDiv.textContent = 'Template updated successfully!';
      document.body.appendChild(successDiv);
      setTimeout(() => successDiv.remove(), 3000);
    }
  };

  const deleteTemplate = (id) => {
    const updatedTemplates = templates.filter(template => template.id !== id);
    saveTemplates(updatedTemplates);
    
    // Show success message
    const successDiv = document.createElement('div');
    successDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    successDiv.textContent = 'Template deleted successfully!';
    document.body.appendChild(successDiv);
    setTimeout(() => successDiv.remove(), 3000);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      className: '',
      examType: '',
      term: '',
      subjects: ['Mathematics', 'English', 'Science'],
      gradingComponents: [
        { name: '1st CA', percentage: 10 },
        { name: '2nd CA', percentage: 10 },
        { name: 'Project', percentage: 10 },
        { name: 'Assessment', percentage: 10 },
        { name: 'Examination', percentage: 60 }
      ]
    });
    setShowCreateForm(false);
    setEditingTemplate(null);
  };

  const startEdit = (template) => {
    setFormData({
      name: template.name,
      className: template.className,
      examType: template.examType,
      term: template.term,
      subjects: [...template.subjects],
      gradingComponents: template.gradingComponents ? [...template.gradingComponents] : [
        { name: '1st CA', percentage: 10 },
        { name: '2nd CA', percentage: 10 },
        { name: 'Project', percentage: 10 },
        { name: 'Assessment', percentage: 10 },
        { name: 'Examination', percentage: 60 }
      ]
    });
    setEditingTemplate(template);
    setShowCreateForm(true);
  };

  const addSubject = () => {
    if (newSubject.trim() && !formData.subjects.includes(newSubject.trim())) {
      setFormData({
        ...formData,
        subjects: [...formData.subjects, newSubject.trim()]
      });
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
    setFormData({
      ...formData,
      subjects: formData.subjects.filter(s => s !== subject)
    });
  };

  const updateComponentPercentage = (index, percentage) => {
    const newComponents = [...formData.gradingComponents];
    newComponents[index].percentage = Math.max(0, Math.min(100, parseInt(percentage) || 0));
    setFormData({
      ...formData,
      gradingComponents: newComponents
    });
  };

  const getTotalPercentage = () => {
    return formData.gradingComponents.reduce((sum, comp) => sum + comp.percentage, 0);
  };

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Templates</h2>
        <p className="text-gray-600">Manage your class templates</p>
      </div>

      {!showCreateForm ? (
        <div className="space-y-4">
          <button
            onClick={() => setShowCreateForm(true)}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all !rounded-button"
          >
            <i className="ri-add-line mr-2"></i>
            Create New Template
          </button>

          {templates.length > 0 ? (
            <div className="space-y-3">
              {templates.map((template) => (
                <div key={template.id} className="bg-white rounded-2xl shadow-sm p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-1">{template.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Class: {template.className} | {template.examType}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">Term: {template.term}</p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {template.subjects.map((subject) => (
                          <span key={subject} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                            {subject}
                          </span>
                        ))}
                      </div>
                      {template.gradingComponents && (
                        <div className="text-xs text-gray-500">
                          Grading: {template.gradingComponents.map(comp => `${comp.name} (${comp.percentage}%)`).join(', ')}
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2 ml-3">
                      <button
                        onClick={() => startEdit(template)}
                        className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors"
                      >
                        <i className="ri-edit-line text-blue-600"></i>
                      </button>
                      <button
                        onClick={() => deleteTemplate(template.id)}
                        className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors"
                      >
                        <i className="ri-delete-bin-line text-red-600"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-folder-line text-gray-400 text-2xl"></i>
              </div>
              <p className="text-gray-500">No templates saved yet</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">
              {editingTemplate ? 'Edit Template' : 'Create New Template'}
            </h3>
            <button
              onClick={resetForm}
              className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <i className="ri-close-line text-gray-600"></i>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Grade 5 Mid-term Template"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class Name
              </label>
              <input
                type="text"
                value={formData.className}
                onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                placeholder="e.g., Grade 5A"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exam Type
              </label>
              <input
                type="text"
                value={formData.examType}
                onChange={(e) => setFormData({ ...formData, examType: e.target.value })}
                placeholder="e.g., Mid-term Exam"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Term/Session
              </label>
              <input
                type="text"
                value={formData.term}
                onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                placeholder="e.g., First Term 2024"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grading Components
              </label>
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                {formData.gradingComponents.map((component, index) => (
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
                  disabled={!newSubject.trim() || formData.subjects.includes(newSubject.trim())}
                  className="px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed !rounded-button"
                >
                  <i className="ri-add-line"></i>
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {formData.subjects.map((subject) => (
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

            <button
              onClick={editingTemplate ? updateTemplate : createTemplate}
              disabled={getTotalPercentage() !== 100}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed !rounded-button"
            >
              {editingTemplate ? 'Update Template' : 'Save Template'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
