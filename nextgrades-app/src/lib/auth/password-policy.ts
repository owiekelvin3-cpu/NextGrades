export type PasswordPolicyResult = {
  valid: boolean;
  errors: string[];
};

const MIN_LENGTH = 12;

export function validateStrongPassword(password: string): PasswordPolicyResult {
  const errors: string[] = [];

  if (password.length < MIN_LENGTH) {
    errors.push(`Password must be at least ${MIN_LENGTH} characters`);
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must include an uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must include a lowercase letter");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must include a number");
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push("Password must include a special character");
  }

  return { valid: errors.length === 0, errors };
}

export function passwordPolicyError(password: string): string | null {
  const result = validateStrongPassword(password);
  return result.errors[0] ?? null;
}

export const PASSWORD_MIN_LENGTH = MIN_LENGTH;
