import type { Router } from "vue-router";
import { useAuthStore } from "@/services/unniversal/store";

/**
 * Logs out the current user and redirects them to the appropriate login page.
 * @param router - Vue Router instance
 * @param role - Optional role string; if null, will use the role from the auth store
 */
export const logout = (router: Router, role: string | null = null): void => {
  try {
    const auth = useAuthStore();

    const currentRole = role ?? auth.role;

    auth.reset();

    const rolePath = currentRole?.toLowerCase?.().trim();
    if (!rolePath || typeof rolePath !== "string") {
      console.error("Invalid role for logout redirect:", currentRole);
      return;
    }

    const loginPath = rolePath === "student" ? "/login" : `/${rolePath}/login`;
    router.replace(loginPath);
  } catch (error) {
    console.error("Logout failed:", error);
  }
};

/**
 * Loads content by navigating to a route and closing the provided offcanvas button.
 * @param path - Target path (can be relative)
 * @param router - Vue Router instance
 * @param btn - HTMLButtonElement (used to close offcanvas menu)
 */
export const loadContent = (path: string, router: Router, btn?: HTMLButtonElement | null): void => {
  router.push(path).then(() => {
    if (btn) btn.click()
  }).catch(() => {})
}

export const formatDate = (input: string): string => {
  const date = new Date(input)
  return isNaN(date.getTime()) ? input : date.toISOString().split('T')[0]
}

export const formatTime = (input: string): string => {
  const [hourStr, minute] = input.split(':');
  const hour = parseInt(hourStr, 10);

  if (isNaN(hour) || isNaN(parseInt(minute))) return input;

  const period = hour >= 12 ? 'PM' : 'AM';
  const formattedHour = hour % 12 || 12;
  return `${formattedHour}:${minute} ${period}`;
}