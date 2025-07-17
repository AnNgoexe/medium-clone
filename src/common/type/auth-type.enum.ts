export enum AuthType {
  // Public route
  NONE = 'NONE',

  // Access token authentication
  ACCESS_TOKEN = 'ACCESS_TOKEN',

  // Optional authentication (if token exists, validate; otherwise allow access)
  OPTIONAL = 'OPTIONAL',
}
