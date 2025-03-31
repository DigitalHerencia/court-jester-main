export function isValidEmail(email: string): boolean {
  if (!email) return false

  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validates a phone number
 * @param phone The phone number to validate
 * @returns Boolean indicating if the phone number is valid
 */
export function isValidPhone(phone: string): boolean {
  if (!phone) return false

  // Basic phone validation regex (allows various formats)
  const phoneRegex = /^[\d\s\-+()]{7,20}$/
  return phoneRegex.test(phone)
}

/**
 * Validates a case number
 * @param caseNumber The case number to validate
 * @returns Boolean indicating if the case number is valid
 */
export function isValidCaseNumber(caseNumber: string): boolean {
  if (!caseNumber) return false

  // Example case number format: ABC-12345 or 12-CR-3456
  const caseNumberRegex = /^[A-Za-z0-9-]{5,20}$/
  return caseNumberRegex.test(caseNumber)
}

/**
 * Validates a password
 * @param password The password to validate
 * @returns Object with validation result and error message
 */
export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (!password) {
    return { valid: false, message: "Password is required" }
  }

  if (password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters long" }
  }

  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one uppercase letter" }
  }

  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one lowercase letter" }
  }

  // Check for at least one number
  if (!/\d/.test(password)) {
    return { valid: false, message: "Password must contain at least one number" }
  }

  // Check for at least one special character
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return { valid: false, message: "Password must contain at least one special character" }
  }

  return { valid: true }
}

/**
 * Sanitizes a string for safe display in HTML
 * @param input The input string to sanitize
 * @returns Sanitized string
 */
export function sanitizeHtml(input: string): string {
  if (!input) return ""

  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

/**
 * Validates form data against a schema
 * @param data The data to validate
 * @param schema The validation schema
 * @returns Object with validation results
 */
export function validateForm(
  data: Record<string, any>,
  schema: Record<string, { required?: boolean; validator?: (value: any) => boolean; message?: string }>,
): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {}

  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field]

    // Check required fields
    if (rules.required && (value === undefined || value === null || value === "")) {
      errors[field] = rules.message || `${field} is required`
      continue
    }

    // Skip validation for empty optional fields
    if ((value === undefined || value === null || value === "") && !rules.required) {
      continue
    }

    // Run custom validator if provided
    if (rules.validator && !rules.validator(value)) {
      errors[field] = rules.message || `${field} is invalid`
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

