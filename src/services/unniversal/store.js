import { createPinia, defineStore } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import { safe } from '@components/utils/safe';
export var useAuthStore = defineStore('auth', {
    state: function () { return ({
        isLoggedIn: false,
        role: null,
        intendedRole: null,
        sender: 'Authentication Store',
        regNO: null
    }); },
    actions: {
        login: function (role, regNO) {
            var _this = this;
            if (regNO === void 0) { regNO = null; }
            return safe(function () {
                _this.isLoggedIn = true;
                _this.role = role;
                _this.intendedRole = null;
                _this.regNO = regNO;
            }, this.sender);
        },
        logout: function () {
            var _this = this;
            return safe(function () {
                _this.isLoggedIn = false;
                _this.role = null;
                _this.intendedRole = null;
            }, this.sender);
        },
        setIntendedRole: function (role) {
            var _this = this;
            return safe(function () {
                _this.intendedRole = role;
            }, this.sender);
        },
        reset: function () {
            var _this = this;
            return safe(function () {
                _this.$reset();
            }, this.sender);
        },
    },
    persist: true,
});
var pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
export default pinia;
