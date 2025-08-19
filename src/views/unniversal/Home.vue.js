var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var _a;
var _b;
import Navbar from '@views/unniversal/Navbar.vue';
import Footer from '@views/unniversal/Footer.vue';
import { ref, computed, onMounted } from 'vue';
import { useRoute, RouterView, useRouter } from 'vue-router';
import { useAuthStore } from '@/services/unniversal/store';
import { getRole } from '@components/utils/role';
import { loadContent } from '@components/utils/unniversal';
var auth = useAuthStore();
var route = useRoute();
var router = useRouter();
var role = computed(function () {
    var _a;
    return ((_a = auth.intendedRole) !== null && _a !== void 0 ? _a : getRole(route.path));
});
var roleToClassMap = (_a = {},
    _a["Admin" /* Role.ADMIN */] = {
        class: 'purple-gradient',
        icon: 'fa-shield-halved'
    },
    _a["Lecturer" /* Role.LECTURER */] = {
        class: 'orange-gradient',
        icon: 'fa-user-tie'
    },
    _a["Student" /* Role.STUDENT */] = {
        class: 'blue-gradient',
        icon: 'fa-graduation-cap'
    },
    _a["Unniversal" /* Role.UNNIVERSAL */] = {
        class: null,
        icon: null
    },
    _a);
var targetClass = ref(((_b = roleToClassMap[role.value]) === null || _b === void 0 ? void 0 : _b.class) || '');
var isLoggedIn = computed(function () { return auth.isLoggedIn; });
var label = ref(null);
onMounted(function () {
    var targetRoute = role.value == "Student" /* Role.STUDENT */
        ? '/dashboard'
        : "/".concat(role.value.toLowerCase(), "/dashboard");
    document.body.classList.add(targetClass.value);
    loadContent(targetRoute, router);
});
var __VLS_exposed = { Navbar: Navbar, Footer: Footer, RouterView: RouterView, role: role, isLoggedIn: isLoggedIn, label: label };
defineExpose(__VLS_exposed);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
var __VLS_ctx = {};
var __VLS_components;
var __VLS_directives;
var __VLS_dollars;
var __VLS_self = (await import('vue')).defineComponent({
    setup: function () {
        return {};
    },
});
export default (await import('vue')).defineComponent({
    setup: function () {
        return __assign({}, __VLS_exposed);
    },
});
; /* PartiallyEnd: #4569/main.vue */
