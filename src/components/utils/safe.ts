export interface SafeResult {
  status: boolean
  msg: string | null
}

/**
 * Executes a function and returns a consistent object:
 * - `{ status: true, msg: null }` on success
 * - `{ status: false, msg: string }` on error
 */
export function safe(fn: () => void, sender: string): SafeResult {
  try {
    fn();
    return { status: true, msg: null };
  } catch (err) {
    const message: string = err instanceof Error ? err.message : String(err);
    console.error(`${sender} ERROR:`, message);
    return { status: false, msg: message };
  }
}
