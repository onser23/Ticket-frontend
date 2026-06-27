export const EMAIL_REGEX = /^[\w.+-]+@[\w-]+\.[\w.-]+$/;

export function validateEmail(email) {
  if (!email || !email.trim()) return 'E-poçt tələb olunur';
  if (!EMAIL_REGEX.test(email.trim())) return 'E-poçt formatı yanlışdır';
  return null;
}

export function validatePassword(password) {
  if (!password) return 'Şifrə tələb olunur';
  if (password.length < 6) return 'Şifrə minimum 6 simvol olmalıdır';
  return null;
}

export function validateRequired(value, fieldName) {
  if (!value || !value.trim()) return `${fieldName} tələb olunur`;
  return null;
}

export function validateName(value, fieldName) {
  const required = validateRequired(value, fieldName);
  if (required) return required;
  if (value.trim().length < 2) return `${fieldName} minimum 2 simvol olmalıdır`;
  if (value.trim().length > 50) return `${fieldName} maksimum 50 simvol ola bilər`;
  return null;
}

export function validateOtp(code) {
  if (!code) return 'OTP tələb olunur';
  if (!/^\d{6}$/.test(code)) return 'OTP 6 rəqəm olmalıdır';
  return null;
}
