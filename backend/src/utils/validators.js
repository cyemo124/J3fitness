// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

// Password validation
export const validatePassword = (password) => {
  // At least 6 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
  return passwordRegex.test(password);
};

// Phone validation
export const validatePhone = (phone) => {
  const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone);
};

// Name validation
export const validateName = (name) => {
  return name && name.trim().length >= 2 && name.trim().length <= 50;
};

// Object validation - check required fields
export const validateRequired = (obj, requiredFields) => {
  const missing = requiredFields.filter(field => !obj[field]);
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
};

// Validate dates
export const validateDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

// Validate positive number
export const validatePositiveNumber = (num) => {
  return num > 0 && Number.isFinite(num);
};

// Validate string length
export const validateStringLength = (str, min, max) => {
  return str.length >= min && str.length <= max;
};

// Validate URL
export const validateURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

// Validate enum value
export const validateEnum = (value, allowedValues) => {
  return allowedValues.includes(value);
};

// Sanitize string input
export const sanitizeString = (str) => {
  return str.trim().replace(/<[^>]*>/g, '').substring(0, 1000);
};
