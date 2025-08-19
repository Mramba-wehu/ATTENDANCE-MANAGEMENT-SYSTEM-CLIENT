import { MODULES as Role } from '@components/routes/names'

/**
 * Determines the user role based on the current path.
 * @param path - Current route path (e.g. /admin, /lecturer/settings, /notes)
 * @returns Role or undefined if path doesn't match any known module
 */

export function getRole(path:string): Role | undefined {
  if (path.startsWith('/admin')) return Role.ADMIN
  if (path.startsWith('/lecturer')) return Role.LECTURER
  return Role.STUDENT
}