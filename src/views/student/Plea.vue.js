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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { onMounted, ref, computed, getCurrentInstance, nextTick, watch } from 'vue';
import { useRoute } from "vue-router";
import { useAuthStore } from "@/services/unniversal/store";
import { Schemas, Validate } from '@services/unniversal/validation';
import { getUsers } from '@services/unniversal/profile';
import { getCourses, getUnits } from '@services/unniversal/course';
import { getRole } from "@components/utils/role";
import { getTempos } from '@services/lecturer/tempo';
import { deletePlea, getPleas, newPlea } from '@services/students/plea';
import { formatDate, formatTime } from '@components/utils/unniversal';
var appContext = getCurrentInstance().appContext;
var $ = appContext.config.globalProperties.$;
var auth = useAuthStore();
var route = useRoute();
var activeTab = ref('view');
var serverRequest = ref(true);
var feed = ref({ show: false, status: null, msg: null });
var units = ref(null);
var course = ref(null);
var user = ref(null);
var scheduleList = ref([]);
var form = ref({
    regNo: null,
    courseCode: '',
    unitCode: '',
    scheduledDate: null,
    scheduledTime: null,
    reason: '',
    pleaFile: null,
});
var errors = ref(null);
var pleaList = ref([]);
var pleaTable = ref(null);
var role = computed(function () {
    var _a;
    return ((_a = auth.intendedRole) !== null && _a !== void 0 ? _a : getRole(route.path));
});
var fetchServer = function () {
    var args_1 = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args_1[_i] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([], args_1, true), void 0, function (target, multiple) {
        var res, status_1, msg, selectedCourseCode, now_1, selectedCourseCode, filteredSchedules, err_1;
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        if (target === void 0) { target = null; }
        if (multiple === void 0) { multiple = true; }
        return __generator(this, function (_m) {
            switch (_m.label) {
                case 0:
                    serverRequest.value = true;
                    feed.value = { show: false, status: null, msg: null };
                    _m.label = 1;
                case 1:
                    _m.trys.push([1, 12, 13, 14]);
                    res = void 0;
                    status_1 = false;
                    msg = null;
                    if (!((target === null || target === void 0 ? void 0 : target.toLowerCase()) === 'users')) return [3 /*break*/, 3];
                    return [4 /*yield*/, getUsers()];
                case 2:
                    res = _m.sent();
                    if (res.status && Array.isArray(res.data)) {
                        user.value = res.data.find(function (u) {
                            var _a, _b;
                            return u.role.toLowerCase() === role.value.toLowerCase() &&
                                u.regNo.toLowerCase() === ((_b = (_a = auth.regNO) === null || _a === void 0 ? void 0 : _a.toLowerCase()) !== null && _b !== void 0 ? _b : "");
                        }) || null;
                    }
                    if (!res.status)
                        multiple = res.status;
                    status_1 = res.status;
                    msg = (_b = (_a = res.data) === null || _a === void 0 ? void 0 : _a.message) !== null && _b !== void 0 ? _b : res.msg;
                    return [3 /*break*/, 11];
                case 3:
                    if (!((target === null || target === void 0 ? void 0 : target.toLowerCase()) === 'courses')) return [3 /*break*/, 5];
                    return [4 /*yield*/, getCourses()];
                case 4:
                    res = _m.sent();
                    if (res.status && Array.isArray(res.data)) {
                        course.value = res.data.find(function (c) { var _a; return c.courseCode.toLowerCase() === ((_a = user.value) === null || _a === void 0 ? void 0 : _a.courseCode.toLowerCase()); }) || null;
                    }
                    if (!res.status)
                        multiple = res.status;
                    status_1 = res.status;
                    msg = (_d = (_c = res.data) === null || _c === void 0 ? void 0 : _c.message) !== null && _d !== void 0 ? _d : res.msg;
                    return [3 /*break*/, 11];
                case 5:
                    if (!((target === null || target === void 0 ? void 0 : target.toLowerCase()) === 'units')) return [3 /*break*/, 7];
                    return [4 /*yield*/, getUnits((_e = user.value) === null || _e === void 0 ? void 0 : _e.courseCode)];
                case 6:
                    res = _m.sent();
                    if (res.status && Array.isArray(res.data)) {
                        units.value = res.data.filter(function (u) { var _a; return u.courseCode.toLowerCase() === ((_a = user.value) === null || _a === void 0 ? void 0 : _a.courseCode.toLowerCase()); }) || null;
                    }
                    if (!res.status)
                        multiple = res.status;
                    status_1 = res.status;
                    msg = (_g = (_f = res.data) === null || _f === void 0 ? void 0 : _f.message) !== null && _g !== void 0 ? _g : res.msg;
                    return [3 /*break*/, 11];
                case 7:
                    if (!((target === null || target === void 0 ? void 0 : target.toLowerCase()) === 'schedules')) return [3 /*break*/, 9];
                    scheduleList.value = [];
                    selectedCourseCode = (_h = course.value) === null || _h === void 0 ? void 0 : _h.courseCode;
                    if (!selectedCourseCode) {
                        throw new Error('Invalid course selected');
                    }
                    return [4 /*yield*/, getTempos(selectedCourseCode)];
                case 8:
                    res = _m.sent();
                    if (res.status && Array.isArray(res.data.schedules)) {
                        now_1 = new Date();
                        scheduleList.value = res.data.schedules
                            .filter(function (s) {
                            var scheduleDate = new Date(s.scheduledDate);
                            var _a = s.scheduledTime.split(':').map(Number), hours = _a[0], minutes = _a[1];
                            scheduleDate.setHours(hours, minutes, 0, 0);
                            var expiry = new Date(scheduleDate.getTime() + 2 * 60 * 60 * 1000);
                            return expiry >= now_1;
                        })
                            .map(function (s) { return (__assign(__assign({}, s), { status: false })); });
                        return [2 /*return*/];
                    }
                    if (!res.status)
                        multiple = res.status;
                    status_1 = res.status;
                    msg = (_k = (_j = res.data) === null || _j === void 0 ? void 0 : _j.message) !== null && _k !== void 0 ? _k : res.msg;
                    return [3 /*break*/, 11];
                case 9:
                    if (!((target === null || target === void 0 ? void 0 : target.toLowerCase()) === 'pleas')) return [3 /*break*/, 11];
                    selectedCourseCode = (_l = course.value) === null || _l === void 0 ? void 0 : _l.courseCode;
                    if (!selectedCourseCode) {
                        throw new Error('Invalid course selected');
                    }
                    return [4 /*yield*/, getPleas(selectedCourseCode)];
                case 10:
                    res = _m.sent();
                    if (!res.data) {
                        feed.value = {
                            show: true,
                            status: false,
                            msg: res.msg || 'Pleas not found'
                        };
                        pleaList.value = [];
                        return [2 /*return*/];
                    }
                    if (res.status && Array.isArray(res.data.pleas)) {
                        pleaList.value = res.data.pleas;
                        filteredSchedules = scheduleList.value.filter(function (schedule) {
                            var match = pleaList.value.some(function (plea) {
                                return plea.courseCode === schedule.courseCode &&
                                    plea.unitCode === schedule.unitCode &&
                                    new Date(plea.scheduledDate).toISOString().split('T')[0] ===
                                        new Date(schedule.scheduledDate).toISOString().split('T')[0] &&
                                    plea.scheduledTime === schedule.scheduledTime;
                            });
                            return !match;
                        });
                        scheduleList.value = filteredSchedules;
                        return [2 /*return*/];
                    }
                    _m.label = 11;
                case 11:
                    if (!multiple) {
                        feed.value = {
                            show: true,
                            status: status_1,
                            msg: msg
                        };
                    }
                    return [3 /*break*/, 14];
                case 12:
                    err_1 = _m.sent();
                    feed.value = {
                        show: true,
                        status: false,
                        msg: err_1.message || 'Failed to fetch from server'
                    };
                    multiple = false;
                    return [3 /*break*/, 14];
                case 13:
                    if (!multiple) {
                        setTimeout(function () {
                            serverRequest.value = false;
                            setTimeout(function () {
                                feed.value = { show: false, status: null, msg: null };
                            }, 2000);
                        }, 2000);
                    }
                    return [7 /*endfinally*/];
                case 14: return [2 /*return*/];
            }
        });
    });
};
var onFileChange = function (e) {
    var _a;
    var target = e.target;
    var file = (_a = target.files) === null || _a === void 0 ? void 0 : _a[0];
    form.value.pleaFile = file || null;
};
var handleSubmitPlea = function () { return __awaiter(void 0, void 0, void 0, function () {
    var selectedCourseCode_1, schedule, scheduledDate, schema, data, _a, status_2, error, res_1, error_1;
    var _b, _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                errors.value = null;
                feed.value = { show: false, status: null, msg: null };
                _e.label = 1;
            case 1:
                _e.trys.push([1, 4, 5, 6]);
                selectedCourseCode_1 = (_b = course.value) === null || _b === void 0 ? void 0 : _b.courseCode;
                if (!selectedCourseCode_1) {
                    throw new Error('Invalid course selected');
                }
                schedule = scheduleList.value.find(function (s) { return s.courseCode === selectedCourseCode_1; });
                scheduledDate = new Date(schedule === null || schedule === void 0 ? void 0 : schedule.scheduledDate);
                if (isNaN(scheduledDate.getTime())) {
                    throw new Error('Invalid scheduled date');
                }
                if (!user || !((_c = user.value) === null || _c === void 0 ? void 0 : _c.regNo)) {
                    throw new Error('Invalid registraion number');
                }
                form.value.regNo = user.value.regNo;
                form.value.courseCode = selectedCourseCode_1;
                form.value.scheduledDate = scheduledDate;
                form.value.scheduledTime = (_d = schedule === null || schedule === void 0 ? void 0 : schedule.scheduledTime) !== null && _d !== void 0 ? _d : null;
                schema = Schemas.plea;
                data = __assign({}, form.value);
                return [4 /*yield*/, Validate(schema, data)];
            case 2:
                _a = _e.sent(), status_2 = _a.status, error = _a.error;
                if (!status_2) {
                    errors.value = error;
                    return [2 /*return*/];
                }
                serverRequest.value = true;
                return [4 /*yield*/, newPlea(data)];
            case 3:
                res_1 = _e.sent();
                setTimeout(function () {
                    feed.value = {
                        show: true,
                        status: res_1.status ? true : false,
                        msg: res_1.data ? res_1.data.message : res_1.msg || 'Plea added succesfully'
                    };
                    if (res_1.status)
                        setTimeout(done, 500);
                }, 1500);
                return [3 /*break*/, 6];
            case 4:
                error_1 = _e.sent();
                feed.value = {
                    show: true,
                    status: false,
                    msg: error_1.message || 'Unable to update Plea'
                };
                return [3 /*break*/, 6];
            case 5:
                setTimeout(function () {
                    serverRequest.value = false;
                    setTimeout(function () {
                        feed.value = { show: false, status: null, msg: null };
                    }, 2000);
                }, 2000);
                return [7 /*endfinally*/];
            case 6: return [2 /*return*/];
        }
    });
}); };
var handleDeletePlea = function () {
    var args_1 = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args_1[_i] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([], args_1, true), void 0, function (pleaID) {
        var res_2, error_2;
        if (pleaID === void 0) { pleaID = null; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    serverRequest.value = false;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    if (!pleaID) {
                        throw new Error('Invalid Plea');
                    }
                    serverRequest.value = true;
                    return [4 /*yield*/, deletePlea(pleaID)];
                case 2:
                    res_2 = _a.sent();
                    setTimeout(function () {
                        feed.value = {
                            show: true,
                            status: (res_2 === null || res_2 === void 0 ? void 0 : res_2.status) ? true : false,
                            msg: (res_2 === null || res_2 === void 0 ? void 0 : res_2.status) ? res_2.data.message : res_2.msg || 'Unable to delete plea'
                        };
                        if (res_2.status) {
                            pleaList.value = pleaList.value.filter(function (plea) { return plea._id !== pleaID; });
                            setTimeout(function () {
                                done();
                            }, 500);
                        }
                    }, 1000);
                    return [3 /*break*/, 5];
                case 3:
                    error_2 = _a.sent();
                    feed.value = {
                        show: true,
                        status: false,
                        msg: error_2.message || 'Unable to delete plea'
                    };
                    return [3 /*break*/, 5];
                case 4:
                    setTimeout(function () {
                        serverRequest.value = false;
                        setTimeout(function () { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        feed.value = { show: false, status: null, msg: null };
                                        return [4 /*yield*/, fetchServer('users')];
                                    case 1:
                                        _a.sent();
                                        return [4 /*yield*/, fetchServer('courses')];
                                    case 2:
                                        _a.sent();
                                        return [4 /*yield*/, fetchServer('units')];
                                    case 3:
                                        _a.sent();
                                        return [4 /*yield*/, fetchServer('schedules')];
                                    case 4:
                                        _a.sent();
                                        return [4 /*yield*/, fetchServer('pleas', false)];
                                    case 5:
                                        _a.sent();
                                        return [4 /*yield*/, nextTick()];
                                    case 6:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); }, 2000);
                    }, 2000);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    });
};
var getTitle = function (code, type) {
    var _a, _b, _c, _d;
    if (type === 'unit') {
        return ((_c = (_b = (_a = units.value) === null || _a === void 0 ? void 0 : _a.find(function (u) { return u.unitCode.toLowerCase() === code.toLowerCase(); })) === null || _b === void 0 ? void 0 : _b.unitTitle.toUpperCase()) !== null && _c !== void 0 ? _c : code);
    }
    if (type === 'course') {
        return (((_d = course.value) === null || _d === void 0 ? void 0 : _d.courseCode.toLowerCase()) === code.toLowerCase()
            ? course.value.courseTitle.toUpperCase()
            : code);
    }
    return code;
};
watch(pleaTable, function (el) {
    if (el) {
        $(el).DataTable();
    }
});
var done = function () {
    form.value = {
        regNo: null,
        courseCode: '',
        unitCode: '',
        scheduledDate: null,
        scheduledTime: null,
        reason: '',
        pleaFile: null
    };
    activeTab.value = 'view';
};
watch(activeTab, function (newTab) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!(newTab === 'view')) return [3 /*break*/, 6];
                return [4 /*yield*/, fetchServer('users')];
            case 1:
                _a.sent();
                return [4 /*yield*/, fetchServer('courses')];
            case 2:
                _a.sent();
                return [4 /*yield*/, fetchServer('units')];
            case 3:
                _a.sent();
                return [4 /*yield*/, fetchServer('schedules')];
            case 4:
                _a.sent();
                return [4 /*yield*/, fetchServer('pleas', false)];
            case 5:
                _a.sent();
                _a.label = 6;
            case 6: return [4 /*yield*/, nextTick()];
            case 7:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
onMounted(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, fetchServer('users')];
            case 1:
                _a.sent();
                return [4 /*yield*/, fetchServer('courses')];
            case 2:
                _a.sent();
                return [4 /*yield*/, fetchServer('units')];
            case 3:
                _a.sent();
                return [4 /*yield*/, fetchServer('schedules')];
            case 4:
                _a.sent();
                return [4 /*yield*/, fetchServer('pleas', false)];
            case 5:
                _a.sent();
                return [4 /*yield*/, nextTick()];
            case 6:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
var __VLS_exposed = { activeTab: activeTab, onFileChange: onFileChange, handleSubmitPlea: handleSubmitPlea, handleDeletePlea: handleDeletePlea, done: done, getTitle: getTitle, formatDate: formatDate, formatTime: formatTime };
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
