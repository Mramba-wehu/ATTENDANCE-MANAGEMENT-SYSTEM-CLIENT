/**
 * Executes a function and returns a consistent object:
 * - `{ status: true, msg: null }` on success
 * - `{ status: false, msg: string }` on error
 */
export function safe(fn, sender) {
    try {
        fn();
        return { status: true, msg: null };
    }
    catch (err) {
        var message = err instanceof Error ? err.message : String(err);
        console.error("".concat(sender, " ERROR:"), message);
        return { status: false, msg: message };
    }
}
