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
import { computed, ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { logout, loadContent } from "@components/utils/unniversal";
var props = defineProps();
var router = useRouter();
var route = useRoute();
var activePath = ref(route.path);
var processing = ref(false);
var spin = ref('fa-spin');
watch(function () { return route.path; }, function (newPath) {
    activePath.value = newPath;
});
var closeButton = ref(null);
var navItems = computed(function () {
    var items = [];
    switch (props.role.toLowerCase()) {
        case "Admin" /* MODULES.ADMIN */.toLowerCase():
            items.push({ name: "Users", path: "/admin/dashboard" }, { name: "Courses", path: "/admin/courses" });
            break;
        case "Lecturer" /* MODULES.LECTURER */.toLowerCase():
            items.push({ name: "Dashboard", path: '/lecturer/dashboard' }, { name: "Summary", path: "/lecturer/summary" }, { name: "Tempo", path: "/lecturer/tempo" });
            break;
        case "Student" /* MODULES.STUDENT */.toLowerCase():
            items.push({ name: "Dashboard", path: '/dashboard' }, { name: "Plea", path: "/plea" }, { name: "Tempo", path: "/tempo" });
            break;
    }
    items.push({
        name: "Profile",
        path: props.role.toLowerCase() === "student"
            ? "/profile"
            : "/".concat(props.role.toLowerCase(), "/profile"),
    });
    return items;
});
var handleLoadContent = function (path) {
    if (!path.startsWith("/")) {
        var base = props.role.toLowerCase() === "student"
            ? ""
            : "/".concat(props.role.toLowerCase());
        path = "".concat(base, "/").concat(path).replace(/\/+$/, "");
    }
    loadContent(path, router, closeButton.value);
};
var handleLogout = function () {
    try {
        processing.value = true;
        setTimeout(function () {
            logout(router);
        }, 1000);
    }
    catch (error) {
        console.log(error);
    }
    finally {
        setTimeout(function () {
            processing.value = false;
        }, 25000);
    }
};
var __VLS_exposed = { spin: spin, handleLoadContent: handleLoadContent, handleLogout: handleLogout, navItems: navItems, loadContent: loadContent };
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
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup: function () {
        return __assign({}, __VLS_exposed);
    },
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
