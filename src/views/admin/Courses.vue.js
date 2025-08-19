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
import { ref, onMounted, watch, getCurrentInstance, nextTick } from 'vue';
import { Schemas, Validate } from '@services/unniversal/validation';
import { getUnits, getCourses, generateCode, register, registerUnit, deleteUnit, updateCourse, deleteCourse } from '@services/unniversal/course';
var appContext = getCurrentInstance().appContext;
var $ = appContext.config.globalProperties.$;
var activeTab = ref('courses');
var serverRequest = ref(false);
var feed = ref({ show: false, status: null, msg: null });
var errors = ref(null);
var courseUnits = ref([]);
var courses = ref([]);
var debounceTimeout = null;
var selectedCourseLevel = ref("");
var coursesTable = ref(null);
var unitsTable = ref(null);
var fetchUnits = function () { return __awaiter(void 0, void 0, void 0, function () {
    var res, err_1;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                serverRequest.value = true;
                feed.value = { show: false, status: null, msg: null };
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, 4, 5]);
                return [4 /*yield*/, getUnits((_a = selectedCourse.value) === null || _a === void 0 ? void 0 : _a.courseCode)];
            case 2:
                res = _b.sent();
                serverRequest.value = false;
                if (res.status) {
                    if (res.data.length > 0) {
                        courseUnits.value = res.data;
                    }
                }
                else {
                    feed.value = {
                        show: true,
                        status: res.status,
                        msg: res.data ? res.data.message : res.msg || "Failed to load Units.",
                    };
                }
                return [3 /*break*/, 5];
            case 3:
                err_1 = _b.sent();
                setTimeout(function () {
                    var _a;
                    serverRequest.value = false;
                    feed.value = {
                        show: true,
                        status: false,
                        msg: (_a = err_1.msg) !== null && _a !== void 0 ? _a : "Network or server error.",
                    };
                }, 500);
                return [3 /*break*/, 5];
            case 4:
                setTimeout(function () {
                    errors.value = null;
                    serverRequest.value = false;
                    feed.value = { show: false, status: null, msg: null };
                }, 500);
                return [7 /*endfinally*/];
            case 5: return [2 /*return*/];
        }
    });
}); };
var fetchCourses = function () { return __awaiter(void 0, void 0, void 0, function () {
    var res, err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                serverRequest.value = true;
                feed.value = { show: false, status: null, msg: null };
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, 4, 5]);
                return [4 /*yield*/, getCourses()];
            case 2:
                res = _a.sent();
                serverRequest.value = false;
                if (res.status) {
                    if (res.data.length > 0) {
                        courses.value = res.data;
                    }
                    else {
                        feed.value = {
                            show: true,
                            status: false,
                            msg: "No courses found. Please add courses first.",
                        };
                        return [2 /*return*/];
                    }
                }
                else {
                    feed.value = {
                        show: true,
                        status: res.status,
                        msg: res.data ? res.data.message : res.msg || "Failed to load Courses.",
                    };
                }
                return [3 /*break*/, 5];
            case 3:
                err_2 = _a.sent();
                setTimeout(function () {
                    var _a;
                    serverRequest.value = false;
                    feed.value = {
                        show: true,
                        status: false,
                        msg: (_a = err_2.msg) !== null && _a !== void 0 ? _a : "Network or server error.",
                    };
                }, 500);
                return [3 /*break*/, 5];
            case 4:
                setTimeout(function () {
                    errors.value = null;
                    serverRequest.value = false;
                    feed.value = { show: false, status: null, msg: null };
                }, 500);
                return [7 /*endfinally*/];
            case 5: return [2 /*return*/];
        }
    });
}); };
onMounted(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, fetchCourses()];
            case 1:
                _a.sent();
                return [4 /*yield*/, nextTick()];
            case 2:
                _a.sent();
                $('#coursesTable').DataTable();
                return [2 /*return*/];
        }
    });
}); });
watch(activeTab, function (newTab) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                courseUnits.value = [];
                if (!(newTab === 'courses')) return [3 /*break*/, 3];
                return [4 /*yield*/, fetchCourses()];
            case 1:
                _a.sent();
                return [4 /*yield*/, nextTick()];
            case 2:
                _a.sent();
                $('#coursesTable').DataTable();
                return [3 /*break*/, 7];
            case 3:
                if (!(newTab === 'units')) return [3 /*break*/, 6];
                return [4 /*yield*/, fetchUnits()];
            case 4:
                _a.sent();
                return [4 /*yield*/, nextTick()];
            case 5:
                _a.sent();
                $('#unitsTable').DataTable();
                return [3 /*break*/, 7];
            case 6:
                serverRequest.value = false;
                _a.label = 7;
            case 7: return [2 /*return*/];
        }
    });
}); });
var selectedCourse = ref(null);
var newCourse = ref({
    courseCode: '',
    courseTitle: '',
    courseLevel: ''
});
var newUnit = ref({
    unitCode: '',
    unitTitle: '',
    unitYear: 1
});
watch(function () { var _a; return (_a = newCourse.value) === null || _a === void 0 ? void 0 : _a.courseTitle; }, function (newVal) {
    if (debounceTimeout)
        clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(function () {
        var title = newVal === null || newVal === void 0 ? void 0 : newVal.trim();
        if (title && newCourse.value) {
            newCourse.value.courseCode = generateCode(title, selectedCourseLevel.value.toLowerCase());
        }
    }, 500);
});
watch(function () { return newUnit.value.unitTitle; }, function (newVal) {
    if (debounceTimeout)
        clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(function () {
        var _a, _b;
        if (newVal.trim() && ((_a = selectedCourse.value) === null || _a === void 0 ? void 0 : _a.courseLevel)) {
            newUnit.value.unitCode = generateCode(newUnit.value.unitTitle, (_b = selectedCourse.value) === null || _b === void 0 ? void 0 : _b.courseLevel.toLocaleLowerCase());
        }
    }, 500);
});
watch(function () { var _a; return (_a = selectedCourse.value) === null || _a === void 0 ? void 0 : _a.courseTitle; }, function (newVal) {
    if (debounceTimeout)
        clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(function () {
        var title = newVal === null || newVal === void 0 ? void 0 : newVal.trim();
        if (title && selectedCourse.value) {
            if (selectedCourse.value.courseLevel && !selectedCourse.value.courseCode) {
                selectedCourse.value.courseCode = generateCode(title, selectedCourse.value.courseLevel.toLowerCase());
            }
        }
    }, 500);
});
var manageCourse = function (course) {
    selectedCourse.value = __assign({}, course);
    activeTab.value = 'manage';
};
var viewUnits = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        activeTab.value = 'units';
        return [2 /*return*/];
    });
}); };
var handleregisterCourse = function () { return __awaiter(void 0, void 0, void 0, function () {
    var schema, course_data, _a, status_1, error, res_1, err_3;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, 4, 5]);
                if (!selectedCourseLevel.value) {
                    return [2 /*return*/, (errors.value = {
                            courseLevel: { msg: "Please select a valid course level." },
                        })];
                }
                feed.value = { show: false, status: null, msg: null };
                schema = Schemas.register.course;
                course_data = {
                    courseCode: newCourse.value.courseCode,
                    courseTitle: newCourse.value.courseTitle,
                    courseLevel: selectedCourseLevel.value,
                };
                return [4 /*yield*/, Validate(schema, course_data)];
            case 1:
                _a = _b.sent(), status_1 = _a.status, error = _a.error;
                if (!status_1) {
                    errors.value = error;
                    return [2 /*return*/];
                }
                serverRequest.value = true;
                return [4 /*yield*/, register(course_data)];
            case 2:
                res_1 = _b.sent();
                setTimeout(function () {
                    serverRequest.value = false;
                    feed.value = {
                        show: true,
                        status: res_1.status,
                        msg: res_1.data
                            ? res_1.data.message
                            : res_1.msg || "Registration successful.",
                    };
                    if (res_1.status) {
                        setTimeout(function () {
                            done();
                        }, 1000);
                    }
                }, 1000);
                return [3 /*break*/, 5];
            case 3:
                err_3 = _b.sent();
                setTimeout(function () {
                    var _a;
                    serverRequest.value = false;
                    feed.value = {
                        show: true,
                        status: false,
                        msg: (_a = err_3.msg) !== null && _a !== void 0 ? _a : "Registration failed.",
                    };
                }, 1000);
                return [3 /*break*/, 5];
            case 4:
                setTimeout(function () {
                    errors.value = null;
                    serverRequest.value = false;
                    feed.value = { show: false, status: null, msg: null };
                }, 3000);
                return [7 /*endfinally*/];
            case 5: return [2 /*return*/];
        }
    });
}); };
var handleregisterUnit = function () { return __awaiter(void 0, void 0, void 0, function () {
    var schema, unit_data, _a, status_2, error, res_2, err_4;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, 4, 5]);
                if (!selectedCourse.value) {
                    return [2 /*return*/, (alert("Please select a valid course level."))];
                }
                feed.value = { show: false, status: null, msg: null };
                schema = Schemas.register.unit;
                unit_data = {
                    unitCode: newUnit.value.unitCode,
                    unitTitle: newUnit.value.unitTitle,
                    courseCode: selectedCourse.value.courseCode,
                    unitYear: Number(newUnit.value.unitYear)
                };
                return [4 /*yield*/, Validate(schema, unit_data)];
            case 1:
                _a = _b.sent(), status_2 = _a.status, error = _a.error;
                if (!status_2) {
                    errors.value = error;
                    return [2 /*return*/];
                }
                serverRequest.value = true;
                return [4 /*yield*/, registerUnit(unit_data)];
            case 2:
                res_2 = _b.sent();
                setTimeout(function () {
                    serverRequest.value = false;
                    feed.value = {
                        show: true,
                        status: res_2.status,
                        msg: res_2.data
                            ? res_2.data.message
                            : res_2.msg || "Registration successful.",
                    };
                    if (res_2.status) {
                        setTimeout(function () {
                            done();
                        }, 1000);
                    }
                }, 1000);
                return [3 /*break*/, 5];
            case 3:
                err_4 = _b.sent();
                setTimeout(function () {
                    var _a;
                    serverRequest.value = false;
                    feed.value = {
                        show: true,
                        status: false,
                        msg: (_a = err_4.msg) !== null && _a !== void 0 ? _a : "Registration failed.",
                    };
                }, 1000);
                return [3 /*break*/, 5];
            case 4:
                setTimeout(function () {
                    errors.value = null;
                    serverRequest.value = false;
                    feed.value = { show: false, status: null, msg: null };
                }, 3000);
                return [7 /*endfinally*/];
            case 5: return [2 /*return*/];
        }
    });
}); };
var handledeleteUnit = function (unitCode) { return __awaiter(void 0, void 0, void 0, function () {
    var res_3, err_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, 3, 4]);
                if (!selectedCourse.value) {
                    return [2 /*return*/, (alert("Please select a valid course level."))];
                }
                if (!unitCode) {
                    throw new Error('Unit Code required');
                }
                feed.value = { show: false, status: null, msg: null };
                serverRequest.value = true;
                return [4 /*yield*/, deleteUnit(unitCode)];
            case 1:
                res_3 = _a.sent();
                setTimeout(function () {
                    serverRequest.value = false;
                    feed.value = {
                        show: true,
                        status: res_3.status,
                        msg: res_3.data
                            ? res_3.data.message
                            : res_3.msg || "Delete successful.",
                    };
                    if (res_3.status) {
                        courseUnits.value = courseUnits.value.filter(function (unit) { return unit.unitCode !== unitCode; });
                        setTimeout(function () {
                            done();
                        }, 1000);
                    }
                }, 1000);
                return [3 /*break*/, 4];
            case 2:
                err_5 = _a.sent();
                setTimeout(function () {
                    var _a;
                    serverRequest.value = false;
                    feed.value = {
                        show: true,
                        status: false,
                        msg: (_a = err_5.msg) !== null && _a !== void 0 ? _a : "Delete failed.",
                    };
                }, 1000);
                return [3 /*break*/, 4];
            case 3:
                setTimeout(function () {
                    errors.value = null;
                    serverRequest.value = false;
                    feed.value = { show: false, status: null, msg: null };
                }, 3000);
                return [7 /*endfinally*/];
            case 4: return [2 /*return*/];
        }
    });
}); };
var handleUpdateCourse = function () { return __awaiter(void 0, void 0, void 0, function () {
    var schema, course_data, _a, status_3, error, res_4, err_6;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, 4, 5]);
                if (!selectedCourse.value) {
                    return [2 /*return*/, (alert("Please select a valid course."))];
                }
                feed.value = { show: false, status: null, msg: null };
                schema = Schemas.register.course;
                course_data = {
                    courseCode: selectedCourse.value.courseCode,
                    courseTitle: selectedCourse.value.courseTitle,
                    courseLevel: selectedCourse.value.courseLevel,
                };
                return [4 /*yield*/, Validate(schema, course_data)];
            case 1:
                _a = _b.sent(), status_3 = _a.status, error = _a.error;
                if (!status_3) {
                    errors.value = error;
                    return [2 /*return*/];
                }
                serverRequest.value = true;
                return [4 /*yield*/, updateCourse(course_data)];
            case 2:
                res_4 = _b.sent();
                setTimeout(function () {
                    serverRequest.value = false;
                    feed.value = {
                        show: true,
                        status: res_4.status,
                        msg: res_4.data
                            ? res_4.data.message
                            : res_4.msg || "Update successful.",
                    };
                    if (res_4.status) {
                        setTimeout(function () {
                            done();
                        }, 1000);
                    }
                }, 1000);
                return [3 /*break*/, 5];
            case 3:
                err_6 = _b.sent();
                setTimeout(function () {
                    var _a;
                    serverRequest.value = false;
                    feed.value = {
                        show: true,
                        status: false,
                        msg: (_a = err_6.msg) !== null && _a !== void 0 ? _a : "Update failed.",
                    };
                }, 1000);
                return [3 /*break*/, 5];
            case 4:
                setTimeout(function () {
                    errors.value = null;
                    serverRequest.value = false;
                    feed.value = { show: false, status: null, msg: null };
                }, 3000);
                return [7 /*endfinally*/];
            case 5: return [2 /*return*/];
        }
    });
}); };
var handleDeleteCourse = function (courseCode) { return __awaiter(void 0, void 0, void 0, function () {
    var res_5, err_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, 3, 4]);
                if (!courseCode) {
                    return [2 /*return*/, (alert("Please select a valid course."))];
                }
                if (!courseCode) {
                    throw new Error('Couse Code required');
                }
                feed.value = { show: false, status: null, msg: null };
                serverRequest.value = true;
                return [4 /*yield*/, deleteCourse(courseCode)];
            case 1:
                res_5 = _a.sent();
                setTimeout(function () {
                    serverRequest.value = false;
                    feed.value = {
                        show: true,
                        status: res_5.status,
                        msg: res_5.data
                            ? res_5.data.message
                            : res_5.msg || "Delete successful.",
                    };
                    if (res_5.status) {
                        courses.value = courses.value.filter(function (course) { return course.courseCode !== courseCode; });
                        setTimeout(function () {
                            done();
                        }, 1000);
                    }
                }, 1000);
                return [3 /*break*/, 4];
            case 2:
                err_7 = _a.sent();
                setTimeout(function () {
                    var _a;
                    serverRequest.value = false;
                    feed.value = {
                        show: true,
                        status: false,
                        msg: (_a = err_7.msg) !== null && _a !== void 0 ? _a : "Delete failed.",
                    };
                }, 1000);
                return [3 /*break*/, 4];
            case 3:
                setTimeout(function () {
                    errors.value = null;
                    serverRequest.value = false;
                    feed.value = { show: false, status: null, msg: null };
                }, 3000);
                return [7 /*endfinally*/];
            case 4: return [2 /*return*/];
        }
    });
}); };
var done = function () {
    selectedCourse.value = null;
    activeTab.value = 'courses';
};
watch(coursesTable, function (el) {
    if (el) {
        $(el).DataTable();
    }
});
watch(unitsTable, function (el) {
    if (el) {
        $(el).DataTable();
    }
});
var __VLS_exposed = { manageCourse: manageCourse, viewUnits: viewUnits, handledeleteUnit: handledeleteUnit, handleregisterUnit: handleregisterUnit, handleregisterCourse: handleregisterCourse, handleUpdateCourse: handleUpdateCourse, handleDeleteCourse: handleDeleteCourse, done: done };
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
