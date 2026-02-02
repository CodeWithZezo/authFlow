export const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validateFullName = (fullName) => {
  return fullName.trim().length > 0 && fullName.length <= 100;
};

export const validatePhone = (phone) => {
  // Accepts international and local numbers (8–15 digits)
  return /^\+?[1-9]\d{7,14}$/.test(phone);
};

export const validatePassword = (password) => {
  // At least 8 characters, including uppercase, lowercase, and numbers
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password);
};
