// Auth Guard utilities for protecting routes and checking permissions

export const checkToken = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

export const getToken = () => {
  return localStorage.getItem('token');
};

export const getUser = () => {
  const userStr = localStorage.getItem('user');
  try {
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    localStorage.removeItem('user');
    return null;
  }
};

export const hasRole = (role) => {
  const user = getUser();
  return user && user.role === role;
};

export const hasAnyRole = (roles) => {
  const user = getUser();
  return user && roles.includes(user.role);
};

export const isAdmin = () => {
  return hasRole('admin');
};

export const isTrainer = () => {
  return hasRole('trainer');
};

export const isMember = () => {
  return hasRole('member');
};

export const isAuthenticated = () => {
  return checkToken() && !!getUser();
};

export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const setAuth = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

// Check if user has active membership
export const hasActiveMembership = () => {
  const user = getUser();
  return (
    user &&
    user.membership &&
    user.membership.status === 'active' &&
    new Date(user.membership.expiryDate) > new Date()
  );
};

// Get user full name
export const getUserFullName = () => {
  const user = getUser();
  return user ? `${user.firstName} ${user.lastName}` : 'User';
};

// Get user initials
export const getUserInitials = () => {
  const user = getUser();
  if (!user) return 'U';
  return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
};
