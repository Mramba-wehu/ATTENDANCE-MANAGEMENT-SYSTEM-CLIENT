import { useAuthStore } from "@/services/unniversal/store";
/**
 * Logs out the current user and redirects them to the appropriate login page.
 * @param router - Vue Router instance
 * @param role - Optional role string; if null, will use the role from the auth store
 */
export var logout = function (router, role) {
    var _a;
    if (role === void 0) { role = null; }
    try {
        var auth = useAuthStore();
        var currentRole = role !== null && role !== void 0 ? role : auth.role;
        auth.reset();
        var rolePath = (_a = currentRole === null || currentRole === void 0 ? void 0 : currentRole.toLowerCase) === null || _a === void 0 ? void 0 : _a.call(currentRole).trim();
        if (!rolePath || typeof rolePath !== "string") {
            console.error("Invalid role for logout redirect:", currentRole);
            return;
        }
        var loginPath = rolePath === "student" ? "/login" : "/".concat(rolePath, "/login");
        router.replace(loginPath);
    }
    catch (error) {
        console.error("Logout failed:", error);
    }
};
/**
 * Loads content by navigating to a route and closing the provided offcanvas button.
 * @param path - Target path (can be relative)
 * @param router - Vue Router instance
 * @param btn - HTMLButtonElement (used to close offcanvas menu)
 */
export var loadContent = function (path, router, btn) {
    router.push(path).then(function () {
        if (btn)
            btn.click();
    }).catch(function () { });
};
export var formatDate = function (input) {
    var date = new Date(input);
    return isNaN(date.getTime()) ? input : date.toISOString().split('T')[0];
};
export var formatTime = function (input) {
    var _a = input.split(':'), hourStr = _a[0], minute = _a[1];
    var hour = parseInt(hourStr, 10);
    if (isNaN(hour) || isNaN(parseInt(minute)))
        return input;
    var period = hour >= 12 ? 'PM' : 'AM';
    var formattedHour = hour % 12 || 12;
    return "".concat(formattedHour, ":").concat(minute, " ").concat(period);
};
