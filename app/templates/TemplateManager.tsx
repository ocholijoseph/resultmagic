
'use client';

import { useState, useEffect } from 'react';

export default function TemplateManager({ onUseTemplate, onBack }) {
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
    if (formData.name && formData.className && formData.examType && formData.term) {
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
    }
  };

  const updateTemplate = () => {
    if (editingTemplate && formData.name && formData.className && formData.examType && formData.term) {
      const updatedTemplates = templates.map(template =>
        template.id === editingTemplate.id
          ? { ...template, ...formData, subjects: [...formData.subjects], gradingComponents: [...formData.gradingComponents] }
          : template
      );
      saveTemplates(updatedTemplates);
      resetForm();
    }
  };

  const deleteTemplate = (id) => {
    const updatedTemplates = templates.filter(template => template.id !== id);
    saveTemplates(updatedTemplates);
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
      gradingComponents: template.gradingComponents || [
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

  const removeSubject = (subject) => {
    setFormData({
      ...formData,
      subjects: formData.subjects.filter(s => s !== subject)
    });
  };

  const useTemplate = (template) => {
    const classData = {
      className: template.className,
      examType: template.examType,
      term: template.term,
      subjects: template.subjects,
      gradingComponents: template.gradingComponents || [
        { name: '1st CA', percentage: 10 },
        { name: '2nd CA', percentage: 10 },
        { name: 'Project', percentage: 10 },
        { name: 'Assessment', percentage: 10 },
        { name: 'Examination', percentage: 60 }
      ]
    };
    onUseTemplate(classData);
  };

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Templates</h2>
          <p className="text-gray-600">Manage your class templates</p>
        </div>
        <button
          onClick={onBack}
          className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <i className="ri-arrow-left-line text-gray-600"></i>
        </button>
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
                      <div className="flex flex-wrap gap-1">
                        {template.subjects.map((subject) => (
                          <span key={subject} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                            {subject}
                          </span>
                        ))}
                      </div>
                      {template.gradingComponents && (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Grading Components:</p>
                          <ul>
                            {template.gradingComponents.map((component) => (
                              <li key={component.name} className="text-sm text-gray-600">
                                {component.name}: {component.percentage}%
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2 ml-3">
                      <button
                        onClick={() => useTemplate(template)}
                        className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center hover:bg-green-200 transition-colors"
                      >
                        <i className="ri-check-line text-green-600"></i>
                      </button>
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
                Subjects
              </label>
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="Add subject"
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={addSubject}
                  className="px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors !rounded-button"
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grading Components
              </label>
              <ul>
                {formData.gradingComponents.map((component, index) => (
                  <li key={index} className="flex items-center mb-2">
                    <input
                      type="text"
                      value={component.name}
                      onChange={(e) => {
                        const newGradingComponents = [...formData.gradingComponents];
                        newGradingComponents[index].name = e.target.value;
                        setFormData({ ...formData, gradingComponents: newGradingComponents });
                      }}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mr-2"
                    />
                    <input
                      type="number"
                      value={component.percentage}
                      onChange={(e) => {
                        const newGradingComponents = [...formData.gradingComponents];
                        newGradingComponents[index].percentage = parseInt(e.target.value);
                        setFormData({ ...formData, gradingComponents: newGradingComponents });
                      }}
                      className="w-20 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newGradingComponents = [...formData.gradingComponents];
                        newGradingComponents.splice(index, 1);
                        setFormData({ ...formData, gradingComponents: newGradingComponents });
                      }}
                      className="w-4 h-4 flex items-center justify-center text-gray-500 hover:text-red-500 ml-2"
                    >
                      <i className="ri-close-line text-xs"></i>
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => {
                  const newGradingComponents = [...formData.gradingComponents, { name: '', percentage: 0 }];
                  setFormData({ ...formData, gradingComponents: newGradingComponents });
                }}
                className="px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors !rounded-button"
              >
                <i className="ri-add-line"></i> Add Grading Component
              </button>
            </div>

            <button
              onClick={editingTemplate ? updateTemplate : createTemplate}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all !rounded-button"
            >
              {editingTemplate ? 'Update Template' : 'Save Template'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
