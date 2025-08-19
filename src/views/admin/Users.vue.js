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
import { ref, onMounted, watch, getCurrentInstance, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { loadContent } from '@components/utils/unniversal';
import { deleteUser, blockUser, getUsers, updateUser } from '@services/admin/user';
import { Schemas, Validate, getValidationFields, pick, } from "@services/unniversal/validation";
import { rolePayloadFields } from "@services/unniversal/access";
import { getCourses } from "@services/unniversal/course";
var router = useRouter();
var appContext = getCurrentInstance().appContext;
var $ = appContext.config.globalProperties.$;
var users = ref(null);
var serverRequest = ref(true);
var manageServerRequest = ref(true);
var feed = ref({ show: false, status: null, msg: null });
var errors = ref(null);
var errorMsg = ref(null);
var activeTab = ref('users');
var selectedUser = ref(null);
var courseList = ref([]);
var filteredCourses = ref([]);
var showDropdown = ref(false);
var courseTitleInputActive = ref(false);
var usersTable = ref(null);
var fetchTimeout = null;
var fetchUsers = function () { return __awaiter(void 0, void 0, void 0, function () {
    var res, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                serverRequest.value = true;
                errorMsg.value = null;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, 4, 5]);
                return [4 /*yield*/, getUsers()];
            case 2:
                res = _a.sent();
                if (res.status) {
                    users.value = res.data;
                }
                else {
                    errorMsg.value = res.msg || 'Failed to load users.';
                }
                return [3 /*break*/, 5];
            case 3:
                err_1 = _a.sent();
                errorMsg.value = 'Network or server error.';
                return [3 /*break*/, 5];
            case 4:
                setTimeout(function () {
                    serverRequest.value = false;
                }, 500);
                return [7 /*endfinally*/];
            case 5: return [2 /*return*/];
        }
    });
}); };
onMounted(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, fetchUsers()];
            case 1:
                _a.sent();
                return [4 /*yield*/, nextTick()];
            case 2:
                _a.sent();
                $('#usersTable').DataTable();
                return [2 /*return*/];
        }
    });
}); });
watch(users, function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        if (activeTab.value === 'users') {
            if (fetchTimeout)
                clearTimeout(fetchTimeout);
            fetchTimeout = setTimeout(function () {
                serverRequest.value = false;
            }, 500);
        }
        return [2 /*return*/];
    });
}); });
watch(activeTab, function (newTab) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!(newTab === 'users')) return [3 /*break*/, 2];
                fetchUsers();
                return [4 /*yield*/, nextTick()];
            case 1:
                _a.sent();
                return [3 /*break*/, 3];
            case 2:
                serverRequest.value = false;
                _a.label = 3;
            case 3: return [2 /*return*/];
        }
    });
}); });
watch(function () { var _a; return (_a = selectedUser.value) === null || _a === void 0 ? void 0 : _a.courseTitle; }, function (newTitle) {
    if (selectedUser.value && newTitle) {
        selectedUser.value.courseTitle = newTitle.toUpperCase();
    }
}, { immediate: true });
watch(function () { var _a; return (_a = selectedUser.value) === null || _a === void 0 ? void 0 : _a.courseTitle; }, function (val) {
    if (val && courseTitleInputActive.value) {
        showDropdown.value = true;
        filteredCourses.value = courseList.value.filter(function (course) {
            return course.courseTitle.toLowerCase().includes(val.toLowerCase());
        });
    }
    else {
        showDropdown.value = false;
        filteredCourses.value = [];
    }
});
var manageUser = function (user) {
    manageServerRequest.value = false;
    feed.value = { show: false, status: null, msg: null };
    selectedUser.value = __assign({}, user);
    if (selectedUser.value.role !== 'Admin') {
        fetchCourses();
    }
    activeTab.value = 'manage';
};
var handleUpdateUser = function () { return __awaiter(void 0, void 0, void 0, function () {
    var baseValidationData, basePayloadData, dataForValidation, roleSchemas, schema, _a, status_1, error, role, payload, res_1, err_2;
    var _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                feed.value = { show: false, status: null, msg: null };
                _d.label = 1;
            case 1:
                _d.trys.push([1, 4, 5, 6]);
                if (!((_b = selectedUser.value) === null || _b === void 0 ? void 0 : _b.role) || !(((_c = selectedUser.value) === null || _c === void 0 ? void 0 : _c.role) in rolePayloadFields)) {
                    return [2 /*return*/, (errors.value = {
                            role: { msg: "Please select a valid role." },
                        })];
                }
                baseValidationData = {
                    regNo: selectedUser.value.regNo,
                    nationalId: selectedUser.value.nationalId,
                    fullNames: selectedUser.value.fullNames,
                    courseCode: selectedUser.value.courseCode,
                    year: selectedUser.value.year,
                    password: selectedUser.value.password
                };
                basePayloadData = {
                    regNo: baseValidationData.regNo,
                    nationalId: baseValidationData.nationalId,
                    fullNames: baseValidationData.fullNames,
                    courseCode: baseValidationData.courseCode,
                    year: baseValidationData.year,
                    password: baseValidationData.password,
                };
                dataForValidation = getValidationFields(selectedUser.value.role, baseValidationData);
                roleSchemas = {
                    admin: Schemas.register.admin,
                    lecturer: Schemas.register.lecturer,
                    student: Schemas.register.student,
                };
                schema = roleSchemas[selectedUser.value.role.toLowerCase()];
                return [4 /*yield*/, Validate(schema, dataForValidation)];
            case 2:
                _a = _d.sent(), status_1 = _a.status, error = _a.error;
                if (!status_1) {
                    errors.value = error;
                    return [2 /*return*/];
                }
                role = selectedUser.value.role;
                payload = {
                    role: role,
                    data: pick(basePayloadData, rolePayloadFields[role]),
                };
                manageServerRequest.value = true;
                return [4 /*yield*/, updateUser(payload)];
            case 3:
                res_1 = _d.sent();
                setTimeout(function () {
                    manageServerRequest.value = false;
                    feed.value = {
                        show: true,
                        status: res_1.status,
                        msg: res_1.data
                            ? res_1.data.message
                            : res_1.msg || "Update successful.",
                    };
                    if (res_1.status) {
                        setTimeout(function () {
                            done();
                        }, 1500);
                    }
                }, 1000);
                return [3 /*break*/, 6];
            case 4:
                err_2 = _d.sent();
                setTimeout(function () {
                    var _a;
                    manageServerRequest.value = false;
                    feed.value = {
                        show: true,
                        status: false,
                        msg: (_a = err_2.msg) !== null && _a !== void 0 ? _a : "Update failed.",
                    };
                }, 1000);
                return [3 /*break*/, 6];
            case 5:
                setTimeout(function () {
                    errors.value = null;
                    manageServerRequest.value = false;
                    feed.value = { show: false, status: null, msg: null };
                }, 3000);
                return [7 /*endfinally*/];
            case 6: return [2 /*return*/];
        }
    });
}); };
var fetchCourses = function () { return __awaiter(void 0, void 0, void 0, function () {
    var res_2, err_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                manageServerRequest.value = true;
                feed.value = { show: false, status: null, msg: null };
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, 4, 5]);
                return [4 /*yield*/, getCourses()];
            case 2:
                res_2 = _a.sent();
                setTimeout(function () {
                    manageServerRequest.value = false;
                    if (res_2.status) {
                        if (res_2.data.length > 0) {
                            var mapped = res_2.data.map(function (course) { return (__assign(__assign({}, course), { displayTitle: "".concat(course.courseLevel, " in ").concat(course.courseTitle) })); });
                            courseList.value = mapped;
                            filteredCourses.value = mapped;
                        }
                        else {
                            feed.value = {
                                show: true,
                                status: false,
                                msg: "No courses found. Please add courses first.",
                            };
                            setTimeout(function () {
                                feed.value.msg = "Navigating to Courses page.";
                                setTimeout(function () {
                                    router.replace("/admin/courses");
                                }, 1000);
                            }, 1500);
                            return;
                        }
                    }
                    else {
                        feed.value = {
                            show: true,
                            status: res_2.status,
                            msg: res_2.data ? res_2.data.message : res_2.msg || "Failed to load Courses.",
                        };
                    }
                }, 1000);
                return [3 /*break*/, 5];
            case 3:
                err_3 = _a.sent();
                setTimeout(function () {
                    var _a;
                    manageServerRequest.value = false;
                    feed.value = {
                        show: true,
                        status: false,
                        msg: (_a = err_3.msg) !== null && _a !== void 0 ? _a : "Network or server error.",
                    };
                }, 1000);
                return [3 /*break*/, 5];
            case 4:
                setTimeout(function () {
                    errors.value = null;
                    manageServerRequest.value = false;
                    feed.value = { show: false, status: null, msg: null };
                }, 4000);
                return [7 /*endfinally*/];
            case 5: return [2 /*return*/];
        }
    });
}); };
var handleblockUser = function () {
    var args_1 = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args_1[_i] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([], args_1, true), void 0, function (action) {
        var payload, res_3, err_4;
        var _a, _b, _c;
        if (action === void 0) { action = true; }
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    feed.value = { show: false, status: null, msg: null };
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 3, 4, 5]);
                    if (!((_a = selectedUser.value) === null || _a === void 0 ? void 0 : _a.role) || !(((_b = selectedUser.value) === null || _b === void 0 ? void 0 : _b.role) in rolePayloadFields)) {
                        return [2 /*return*/, (errors.value = {
                                role: { msg: "Please select a valid role." },
                            })];
                    }
                    payload = {
                        regNo: (_c = selectedUser.value) === null || _c === void 0 ? void 0 : _c.regNo,
                        action: action
                    };
                    manageServerRequest.value = true;
                    return [4 /*yield*/, blockUser(payload)];
                case 2:
                    res_3 = _d.sent();
                    setTimeout(function () {
                        manageServerRequest.value = false;
                        feed.value = {
                            show: true,
                            status: res_3.status,
                            msg: res_3.data
                                ? res_3.data.message
                                : res_3.msg || "Block successful.",
                        };
                        if (res_3.status) {
                            setTimeout(function () {
                                done();
                            }, 1500);
                        }
                    }, 1000);
                    return [3 /*break*/, 5];
                case 3:
                    err_4 = _d.sent();
                    setTimeout(function () {
                        var _a;
                        manageServerRequest.value = false;
                        feed.value = {
                            show: true,
                            status: false,
                            msg: (_a = err_4.msg) !== null && _a !== void 0 ? _a : "Block failed.",
                        };
                    }, 1000);
                    return [3 /*break*/, 5];
                case 4:
                    setTimeout(function () {
                        errors.value = null;
                        manageServerRequest.value = false;
                        feed.value = { show: false, status: null, msg: null };
                    }, 3000);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    });
};
var handledeleteUser = function () { return __awaiter(void 0, void 0, void 0, function () {
    var payload, res_4, err_5;
    var _a, _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                feed.value = { show: false, status: null, msg: null };
                _d.label = 1;
            case 1:
                _d.trys.push([1, 3, 4, 5]);
                if (!((_a = selectedUser.value) === null || _a === void 0 ? void 0 : _a.role) || !(((_b = selectedUser.value) === null || _b === void 0 ? void 0 : _b.role) in rolePayloadFields)) {
                    return [2 /*return*/, (errors.value = {
                            role: { msg: "Please select a valid role." },
                        })];
                }
                payload = {
                    regNo: (_c = selectedUser.value) === null || _c === void 0 ? void 0 : _c.regNo
                };
                manageServerRequest.value = true;
                return [4 /*yield*/, deleteUser(payload)];
            case 2:
                res_4 = _d.sent();
                setTimeout(function () {
                    manageServerRequest.value = false;
                    feed.value = {
                        show: true,
                        status: res_4.status,
                        msg: res_4.data
                            ? res_4.data.message
                            : res_4.msg || "Delete successful.",
                    };
                    if (res_4.status) {
                        setTimeout(function () {
                            done();
                        }, 1500);
                    }
                }, 1000);
                return [3 /*break*/, 5];
            case 3:
                err_5 = _d.sent();
                setTimeout(function () {
                    var _a;
                    manageServerRequest.value = false;
                    feed.value = {
                        show: true,
                        status: false,
                        msg: (_a = err_5.msg) !== null && _a !== void 0 ? _a : "Delete failed.",
                    };
                }, 1000);
                return [3 /*break*/, 5];
            case 4:
                setTimeout(function () {
                    errors.value = null;
                    manageServerRequest.value = false;
                    feed.value = { show: false, status: null, msg: null };
                }, 3000);
                return [7 /*endfinally*/];
            case 5: return [2 /*return*/];
        }
    });
}); };
var done = function () {
    selectedUser.value = null;
    activeTab.value = 'users';
};
var goToRegister = function () {
    loadContent('/admin/register', router);
};
var selectCourse = function (course) {
    if (selectedUser.value) {
        selectedUser.value.courseCode = course.courseCode;
        selectedUser.value.courseTitle = course.displayTitle;
    }
    showDropdown.value = false;
};
var handleBlur = function () {
    setTimeout(function () {
        showDropdown.value = false;
    }, 200);
};
watch(usersTable, function (el) {
    if (el) {
        $(el).DataTable();
    }
});
var __VLS_exposed = { users: users, manageUser: manageUser, handleUpdateUser: handleUpdateUser, handleblockUser: handleblockUser, handledeleteUser: handledeleteUser, done: done, goToRegister: goToRegister, handleBlur: handleBlur, selectCourse: selectCourse };
defineExpose(__VLS_exposed);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
var __VLS_ctx = {};
var __VLS_components;
var __VLS_directives;
/** @type {__VLS_StyleScopedClasses['content-row']} */ ;
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
