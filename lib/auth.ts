// Allowed emails and passwords
const ALLOWED_USERS = [
  { email: 'm7mdrf3t0@gmail.com', password: 'admin123' },
  { email: 'Hosammagy1414@gmail.com', password: 'admin123' },
  // Add more users as needed
]

export function validateCredentials(email: string, password: string): boolean {
  return ALLOWED_USERS.some(
    user => user.email === email && user.password === password
  )
}

export function getAllowedEmails(): string[] {
  return ALLOWED_USERS.map(user => user.email)
}

