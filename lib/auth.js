// Authentication and user management utilities
export const AUTH_ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher'
};

export const getCurrentUser = () => {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('resultMagicCurrentUser');
    return user ? JSON.parse(user) : null;
  }
  return null;
};

export const setCurrentUser = (user) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('resultMagicCurrentUser', JSON.stringify(user));
  }
};

export const clearCurrentUser = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('resultMagicCurrentUser');
  }
};

export const getCurrentSchool = () => {
  if (typeof window !== 'undefined') {
    const schoolId = localStorage.getItem('resultMagicCurrentSchool');
    return schoolId || null;
  }
  return null;
};

export const setCurrentSchool = (schoolId) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('resultMagicCurrentSchool', schoolId);
  }
};

export const generateSchoolId = () => {
  return 'school_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

export const generateUserId = () => {
  return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

export const isAdmin = (user) => {
  return user && user.role === AUTH_ROLES.ADMIN;
};

export const isTeacher = (user) => {
  return user && user.role === AUTH_ROLES.TEACHER;
};

export const canAccessClass = (user, className) => {
  if (isAdmin(user)) return true;
  if (isTeacher(user)) {
    return user.assignedClasses && user.assignedClasses.includes(className);
  }
  return false;
};