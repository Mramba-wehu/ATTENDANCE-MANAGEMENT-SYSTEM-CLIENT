/**
 * Determines the user role based on the current path.
 * @param path - Current route path (e.g. /admin, /lecturer/settings, /notes)
 * @returns Role or undefined if path doesn't match any known module
 */
export function getRole(path) {
    if (path.startsWith('/admin'))
        return "Admin" /* Role.ADMIN */;
    if (path.startsWith('/lecturer'))
        return "Lecturer" /* Role.LECTURER */;
    return "Student" /* Role.STUDENT */;
}
