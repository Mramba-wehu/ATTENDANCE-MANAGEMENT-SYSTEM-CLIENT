import { createRouter, createWebHistory, } from "vue-router";
import * as AMSN from "@/components/routes/names";
import * as AMSR from "@/components/routes/components";
import { useAuthStore } from "@/services/unniversal/store";
import { getRole } from "@/components/utils/role";
var N = AMSN;
var C = AMSR.RouteComponents;
var routes = [
    {
        path: "/admin/login",
        name: "".concat("Admin" /* N.MODULES.ADMIN */).concat("Login" /* N.ACCESS.LOGIN */),
        component: C["Admin" /* N.MODULES.ADMIN */]["Login" /* N.ACCESS.LOGIN */],
        meta: { requiresAuth: false }
    },
    {
        path: "/admin",
        component: C["Unniversal" /* N.MODULES.UNNIVERSAL */]["Home" /* N.FLUX.HOME */],
        meta: { requiresAuth: true },
        children: [
            {
                path: "register",
                name: "".concat("Admin" /* N.MODULES.ADMIN */).concat("Register" /* N.ACCESS.REGISTER */),
                component: C["Admin" /* N.MODULES.ADMIN */]["Register" /* N.ACCESS.REGISTER */],
            },
            {
                path: "dashboard",
                name: "".concat("Admin" /* N.MODULES.ADMIN */).concat("Dashboard" /* N.FLUX.DASHBOARD */),
                component: C["Admin" /* N.MODULES.ADMIN */]["Dashboard" /* N.FLUX.DASHBOARD */],
            },
            {
                path: "courses",
                name: "".concat("Admin" /* N.MODULES.ADMIN */).concat("Courses" /* N.FLUX.COURSES */),
                component: C["Admin" /* N.MODULES.ADMIN */]["Courses" /* N.FLUX.COURSES */],
            },
            {
                path: "profile",
                name: "".concat("Admin" /* N.MODULES.ADMIN */).concat("Unniversal" /* N.MODULES.UNNIVERSAL */).concat("Profile" /* N.FLUX.PROFILE */),
                component: C["Unniversal" /* N.MODULES.UNNIVERSAL */]["Profile" /* N.FLUX.PROFILE */],
            }
        ]
    },
    {
        path: "/lecturer/login",
        name: "".concat("Lecturer" /* N.MODULES.LECTURER */).concat("Login" /* N.ACCESS.LOGIN */),
        component: C["Lecturer" /* N.MODULES.LECTURER */]["Login" /* N.ACCESS.LOGIN */],
        meta: { requiresAuth: false }
    },
    {
        path: "/lecturer",
        component: C["Unniversal" /* N.MODULES.UNNIVERSAL */]["Home" /* N.FLUX.HOME */],
        meta: { requiresAuth: true },
        children: [
            {
                path: "dashboard",
                name: "".concat("Lecturer" /* N.MODULES.LECTURER */).concat("Dashboard" /* N.FLUX.DASHBOARD */),
                component: C["Lecturer" /* N.MODULES.LECTURER */]["Dashboard" /* N.FLUX.DASHBOARD */],
            },
            {
                path: "summary",
                name: "".concat("Lecturer" /* N.MODULES.LECTURER */).concat("Summary" /* N.FLUX.SUMMARY */),
                component: C["Lecturer" /* N.MODULES.LECTURER */]["Summary" /* N.FLUX.SUMMARY */],
            },
            {
                path: "tempo",
                name: "".concat("Lecturer" /* N.MODULES.LECTURER */).concat("Tempo" /* N.FLUX.TEMPO */),
                component: C["Lecturer" /* N.MODULES.LECTURER */]["Tempo" /* N.FLUX.TEMPO */],
            },
            {
                path: "notes",
                name: "".concat("Lecturer" /* N.MODULES.LECTURER */).concat("Notes" /* N.FLUX.NOTES */),
                component: C["Lecturer" /* N.MODULES.LECTURER */]["Notes" /* N.FLUX.NOTES */],
            },
            {
                path: "profile",
                name: "".concat("Lecturer" /* N.MODULES.LECTURER */).concat("Unniversal" /* N.MODULES.UNNIVERSAL */).concat("Profile" /* N.FLUX.PROFILE */),
                component: C["Unniversal" /* N.MODULES.UNNIVERSAL */]["Profile" /* N.FLUX.PROFILE */],
            }
        ]
    },
    {
        path: "/login",
        name: "".concat("Student" /* N.MODULES.STUDENT */).concat("Login" /* N.ACCESS.LOGIN */),
        component: C["Student" /* N.MODULES.STUDENT */]["Login" /* N.ACCESS.LOGIN */],
        meta: { requiresAuth: false }
    },
    {
        path: "/",
        component: C["Unniversal" /* N.MODULES.UNNIVERSAL */]["Home" /* N.FLUX.HOME */],
        meta: { requiresAuth: true },
        children: [
            {
                path: "dashboard",
                name: "".concat("Student" /* N.MODULES.STUDENT */).concat("Dashboard" /* N.FLUX.DASHBOARD */),
                component: C["Student" /* N.MODULES.STUDENT */]["Dashboard" /* N.FLUX.DASHBOARD */],
            },
            {
                path: "plea",
                name: "".concat("Student" /* N.MODULES.STUDENT */).concat("Plea" /* N.FLUX.PLEA */),
                component: C["Student" /* N.MODULES.STUDENT */]["Plea" /* N.FLUX.PLEA */],
            },
            {
                path: "tempo",
                name: "".concat("Student" /* N.MODULES.STUDENT */).concat("Tempo" /* N.FLUX.TEMPO */),
                component: C["Student" /* N.MODULES.STUDENT */]["Tempo" /* N.FLUX.TEMPO */],
            },
            {
                path: "notes",
                name: "".concat("Student" /* N.MODULES.STUDENT */).concat("Notes" /* N.FLUX.NOTES */),
                component: C["Student" /* N.MODULES.STUDENT */]["Notes" /* N.FLUX.NOTES */],
            },
            {
                path: "profile",
                name: "".concat("Student" /* N.MODULES.STUDENT */).concat("Unniversal" /* N.MODULES.UNNIVERSAL */).concat("Profile" /* N.FLUX.PROFILE */),
                component: C["Unniversal" /* N.MODULES.UNNIVERSAL */]["Profile" /* N.FLUX.PROFILE */],
            }
        ]
    },
    {
        path: "/:pathMatch(.*)*",
        redirect: function (to) {
            return to.path.startsWith("/admin")
                ? "/admin/login"
                : to.path.startsWith("/lecturer")
                    ? "/lecturer/login"
                    : "/login";
        },
    },
];
var router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: routes,
    scrollBehavior: function () { return ({ top: 0 }); },
});
router.beforeEach(function (to, _from, next) {
    var _a, _b;
    var auth = useAuthStore();
    var isLoggedIn = auth.isLoggedIn;
    var requiresAuth = Boolean((_a = to.meta) === null || _a === void 0 ? void 0 : _a.requiresAuth);
    var intendedRole = (_b = getRole(to.path)) !== null && _b !== void 0 ? _b : null;
    if (!intendedRole)
        return next("/login");
    auth.setIntendedRole(intendedRole);
    if (requiresAuth && !isLoggedIn) {
        switch (intendedRole) {
            case "Admin" /* N.MODULES.ADMIN */:
                return next("/admin/login");
            case "Lecturer" /* N.MODULES.LECTURER */:
                return next("/lecturer/login");
            case "Student" /* N.MODULES.STUDENT */:
                return next("/login");
        }
    }
    var isAccessingAuthPage = !requiresAuth;
    if (isAccessingAuthPage && isLoggedIn) {
        switch (intendedRole) {
            case "Admin" /* N.MODULES.ADMIN */:
                return next("/admin");
            case "Lecturer" /* N.MODULES.LECTURER */:
                return next("/lecturer");
            case "Student" /* N.MODULES.STUDENT */:
                return next("/");
        }
    }
    return next();
});
export default router;
