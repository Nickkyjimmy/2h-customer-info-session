/**
 * Validates if an email belongs to the allowed domains
 * @param email - The email address to validate
 * @returns true if the email is valid and from an allowed domain
 */
export function isValidDomain(email: string): boolean {
  const allowedDomains = ['@mservice.com.vn', '@momo.vn']
  
  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return false
  }
  
  // Check if email ends with one of the allowed domains
  return allowedDomains.some(domain => email.toLowerCase().endsWith(domain))
}

/**
 * Extracts the domain from an email address
 * @param email - The email address
 * @returns the domain part (e.g., "@mservice.com.vn")
 */
export function extractDomain(email: string): string | null {
  const match = email.match(/@.+$/)
  return match ? match[0] : null
}

/**
 * Validates and returns error message if invalid
 * @param email - The email address to validate
 * @returns error message if invalid, null if valid
 */
export function validateDomainWithError(email: string): string | null {
  if (!email) {
    return 'Email is required'
  }
  
  if (!isValidDomain(email)) {
    return 'Email must be from @mservice.com.vn or @momo.vn domain'
  }
  
  return null
}
