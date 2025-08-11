import { generateSchoolId, generateUserId, getCurrentSchool } from './auth';

export const createSchool = (schoolData) => {
  const schoolId = generateSchoolId();
  const newSchool = {
    id: schoolId,
    name: schoolData.name,
    headPosition: schoolData.headPosition || 'Principal',
    logo: schoolData.logo || '',
    createdAt: new Date().toISOString(),
    isActive: true
  };

  // Save school data
  const schools = getAllSchools();
  schools.push(newSchool);
  localStorage.setItem('resultMagicSchools', JSON.stringify(schools));

  // Create admin user for the school
  const adminUser = {
    id: generateUserId(),
    name: schoolData.adminName || 'Admin',
    email: schoolData.adminEmail || '',
    role: 'admin',
    schoolId: schoolId,
    createdAt: new Date().toISOString(),
    isActive: true
  };

  const users = getAllUsers();
  users.push(adminUser);
  localStorage.setItem('resultMagicUsers', JSON.stringify(users));

  return { school: newSchool, admin: adminUser };
};

export const getAllSchools = () => {
  if (typeof window !== 'undefined') {
    const schools = localStorage.getItem('resultMagicSchools');
    return schools ? JSON.parse(schools) : [];
  }
  return [];
};

export const getSchoolById = (schoolId) => {
  const schools = getAllSchools();
  return schools.find(school => school.id === schoolId);
};

export const updateSchool = (schoolId, updates) => {
  const schools = getAllSchools();
  const updatedSchools = schools.map(school => 
    school.id === schoolId ? { ...school, ...updates } : school
  );
  localStorage.setItem('resultMagicSchools', JSON.stringify(updatedSchools));
  return getSchoolById(schoolId);
};

export const deleteSchool = (schoolId) => {
  // Delete school
  const schools = getAllSchools();
  const filteredSchools = schools.filter(school => school.id !== schoolId);
  localStorage.setItem('resultMagicSchools', JSON.stringify(filteredSchools));

  // Delete all users from this school
  const users = getAllUsers();
  const filteredUsers = users.filter(user => user.schoolId !== schoolId);
  localStorage.setItem('resultMagicUsers', JSON.stringify(filteredUsers));

  // Delete all school data
  deleteSchoolData(schoolId);
};

export const deleteSchoolData = (schoolId) => {
  // Delete results database entries for this school
  const resultsKey = `studentResultsDatabase_${schoolId}`;
  localStorage.removeItem(resultsKey);

  // Delete templates for this school
  const templatesKey = `resultMagicTemplates_${schoolId}`;
  localStorage.removeItem(templatesKey);

  // Delete current session data if it belongs to this school
  const currentData = localStorage.getItem('resultMagicData');
  if (currentData) {
    const parsedData = JSON.parse(currentData);
    if (parsedData.schoolId === schoolId) {
      localStorage.removeItem('resultMagicData');
    }
  }
};

export const getAllUsers = () => {
  if (typeof window !== 'undefined') {
    const users = localStorage.getItem('resultMagicUsers');
    return users ? JSON.parse(users) : [];
  }
  return [];
};

export const getUsersBySchool = (schoolId) => {
  const users = getAllUsers();
  return users.filter(user => user.schoolId === schoolId && user.isActive);
};

export const createUser = (userData) => {
  const userId = generateUserId();
  const newUser = {
    id: userId,
    name: userData.name,
    email: userData.email,
    role: userData.role,
    schoolId: userData.schoolId,
    assignedClasses: userData.assignedClasses || [],
    createdAt: new Date().toISOString(),
    isActive: true
  };

  const users = getAllUsers();
  users.push(newUser);
  localStorage.setItem('resultMagicUsers', JSON.stringify(users));

  return newUser;
};

export const updateUser = (userId, updates) => {
  const users = getAllUsers();
  const updatedUsers = users.map(user => 
    user.id === userId ? { ...user, ...updates } : user
  );
  localStorage.setItem('resultMagicUsers', JSON.stringify(updatedUsers));
  return updatedUsers.find(user => user.id === userId);
};

export const deleteUser = (userId) => {
  const users = getAllUsers();
  const filteredUsers = users.filter(user => user.id !== userId);
  localStorage.setItem('resultMagicUsers', JSON.stringify(filteredUsers));
};

export const getSchoolSpecificData = (key, schoolId = null) => {
  const currentSchoolId = schoolId || getCurrentSchool();
  if (!currentSchoolId) return [];
  
  const schoolKey = `${key}_${currentSchoolId}`;
  const data = localStorage.getItem(schoolKey);
  return data ? JSON.parse(data) : [];
};

export const setSchoolSpecificData = (key, data, schoolId = null) => {
  const currentSchoolId = schoolId || getCurrentSchool();
  if (!currentSchoolId) return;
  
  const schoolKey = `${key}_${currentSchoolId}`;
  localStorage.setItem(schoolKey, JSON.stringify(data));
};