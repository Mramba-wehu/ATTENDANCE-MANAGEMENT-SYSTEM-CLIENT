import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
  type Router,
} from "vue-router";

import * as AMSN from "@/components/routes/names";
import * as AMSR from "@/components/routes/components";

import { useAuthStore } from "@/services/unniversal/store";
import { getRole } from "@/components/utils/role";

const N = AMSN;
const C = AMSR.RouteComponents;
type MODULES = AMSN.MODULES;

const routes: readonly RouteRecordRaw[] = [
  {
    path: "/admin/login",
    name: `${N.MODULES.ADMIN}${N.ACCESS.LOGIN}`,
    component: C[N.MODULES.ADMIN][N.ACCESS.LOGIN]!,
    meta: { requiresAuth: false }
  },
  {
    path: "/admin",
    component: C[N.MODULES.UNNIVERSAL][N.FLUX.HOME]!,
    meta: { requiresAuth: true },
    children: [
      {
        path: "register",
        name: `${N.MODULES.ADMIN}${N.ACCESS.REGISTER}`,
        component: C[N.MODULES.ADMIN][N.ACCESS.REGISTER]!,
      },
      {
        path: "dashboard",
        name: `${N.MODULES.ADMIN}${N.FLUX.DASHBOARD}`,
        component: C[N.MODULES.ADMIN][N.FLUX.DASHBOARD]!,
      },
      {
        path: "courses",
        name: `${N.MODULES.ADMIN}${N.FLUX.COURSES}`,
        component: C[N.MODULES.ADMIN][N.FLUX.COURSES]!,
      },
      {
        path: "profile",
        name: `${N.MODULES.ADMIN}${N.MODULES.UNNIVERSAL}${N.FLUX.PROFILE}`,
        component: C[N.MODULES.UNNIVERSAL][N.FLUX.PROFILE]!,
      }
    ]
  },
  {
    path: "/lecturer/login",
    name: `${N.MODULES.LECTURER}${N.ACCESS.LOGIN}`,
    component: C[N.MODULES.LECTURER][N.ACCESS.LOGIN]!,
    meta: { requiresAuth: false }
  },
  {
    path: "/lecturer",
    component: C[N.MODULES.UNNIVERSAL][N.FLUX.HOME]!,
    meta: { requiresAuth: true },
    children: [
      {
        path: "dashboard",
        name: `${N.MODULES.LECTURER}${N.FLUX.DASHBOARD}`,
        component: C[N.MODULES.LECTURER][N.FLUX.DASHBOARD]!,
      },
      {
        path: "summary",
        name: `${N.MODULES.LECTURER}${N.FLUX.SUMMARY}`,
        component: C[N.MODULES.LECTURER][N.FLUX.SUMMARY]!,
      },
      {
        path: "tempo",
        name: `${N.MODULES.LECTURER}${N.FLUX.TEMPO}`,
        component: C[N.MODULES.LECTURER][N.FLUX.TEMPO]!,
      },
      {
        path: "notes",
        name: `${N.MODULES.LECTURER}${N.FLUX.NOTES}`,
        component: C[N.MODULES.LECTURER][N.FLUX.NOTES]!,
      },
      {
        path: "profile",
        name: `${N.MODULES.LECTURER}${N.MODULES.UNNIVERSAL}${N.FLUX.PROFILE}`,
        component: C[N.MODULES.UNNIVERSAL][N.FLUX.PROFILE]!,
      }
    ]
  },
  {
    path: "/login",
    name: `${N.MODULES.STUDENT}${N.ACCESS.LOGIN}`,
    component: C[N.MODULES.STUDENT][N.ACCESS.LOGIN]!,
    meta: { requiresAuth: false }
  },
  {
    path: "/",
    component: C[N.MODULES.UNNIVERSAL][N.FLUX.HOME]!,
    meta: { requiresAuth: true },
    children: [
      {
        path: "dashboard",
        name: `${N.MODULES.STUDENT}${N.FLUX.DASHBOARD}`,
        component: C[N.MODULES.STUDENT][N.FLUX.DASHBOARD]!,
      },
      {
        path: "plea",
        name: `${N.MODULES.STUDENT}${N.FLUX.PLEA}`,
        component: C[N.MODULES.STUDENT][N.FLUX.PLEA]!,
      },
      {
        path: "tempo",
        name: `${N.MODULES.STUDENT}${N.FLUX.TEMPO}`,
        component: C[N.MODULES.STUDENT][N.FLUX.TEMPO]!,
      },
      {
        path: "notes",
        name: `${N.MODULES.STUDENT}${N.FLUX.NOTES}`,
        component: C[N.MODULES.STUDENT][N.FLUX.NOTES]!,
      },
      {
        path: "profile",
        name: `${N.MODULES.STUDENT}${N.MODULES.UNNIVERSAL}${N.FLUX.PROFILE}`,
        component: C[N.MODULES.UNNIVERSAL][N.FLUX.PROFILE]!,
      }
    ]
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: (to) =>
      to.path.startsWith("/admin")
        ? "/admin/login"
        : to.path.startsWith("/lecturer")
        ? "/lecturer/login"
        : "/login",
  },
];

const router: Router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
});

router.beforeEach((to, _from, next) => {
  const auth = useAuthStore();
  const isLoggedIn = auth.isLoggedIn;
  const requiresAuth = Boolean(to.meta?.requiresAuth);
  const intendedRole: MODULES | null = getRole(to.path) ?? null;

  if (!intendedRole) return next("/login");

  auth.setIntendedRole(intendedRole as any);

  if (requiresAuth && !isLoggedIn) {
    switch (intendedRole) {
      case N.MODULES.ADMIN:
        return next("/admin/login");
      case N.MODULES.LECTURER:
        return next("/lecturer/login");
      case N.MODULES.STUDENT:
        return next("/login");
    }
  }

  const isAccessingAuthPage = !requiresAuth;
  if (isAccessingAuthPage && isLoggedIn) {
    switch (intendedRole) {
      case N.MODULES.ADMIN:
        return next("/admin");
      case N.MODULES.LECTURER:
        return next("/lecturer");
      case N.MODULES.STUDENT:
        return next("/");
    }
  }

  return next();
});

export default router;