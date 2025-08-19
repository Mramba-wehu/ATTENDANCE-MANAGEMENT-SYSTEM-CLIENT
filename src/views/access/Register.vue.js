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
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import { loadContent } from "@components/utils/unniversal";
import { Schemas, Validate, getValidationFields, pick, } from "@services/unniversal/validation";
import { register, rolePayloadFields } from "@services/unniversal/access";
import { getCourses } from "@services/unniversal/course";
var router = useRouter();
var selectedRole = ref("");
var serverRequest = ref(false);
var feed = ref({ show: false, status: null, msg: null });
var errors = ref(null);
var courseList = ref([]);
var filteredCourses = ref([]);
var showDropdown = ref(false);
var form = ref({
    regNo: "",
    password: "",
    nationalId: "",
    fullNames: "",
    courseCode: "",
    displayTitle: "",
    year: ""
});
var fetchCourses = function () { return __awaiter(void 0, void 0, void 0, function () {
    var res_1, err_1;
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
                res_1 = _a.sent();
                setTimeout(function () {
                    serverRequest.value = false;
                    if (res_1.status) {
                        if (res_1.data.length > 0) {
                            var mapped = res_1.data.map(function (course) { return (__assign(__assign({}, course), { displayTitle: "".concat(course.courseTitle) })); });
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
                            status: res_1.status,
                            msg: res_1.data ? res_1.data.message : res_1.msg || "Failed to load Courses.",
                        };
                    }
                }, 1000);
                return [3 /*break*/, 5];
            case 3:
                err_1 = _a.sent();
                setTimeout(function () {
                    var _a;
                    serverRequest.value = false;
                    feed.value = {
                        show: true,
                        status: false,
                        msg: (_a = err_1.msg) !== null && _a !== void 0 ? _a : "Network or server error.",
                    };
                }, 1000);
                return [3 /*break*/, 5];
            case 4:
                setTimeout(function () {
                    errors.value = null;
                    serverRequest.value = false;
                    feed.value = { show: false, status: null, msg: null };
                }, 4000);
                return [7 /*endfinally*/];
            case 5: return [2 /*return*/];
        }
    });
}); };
var submitForm = function () { return __awaiter(void 0, void 0, void 0, function () {
    var baseValidationData, basePayloadData, dataForValidation, roleSchemas, schema, _a, status_1, error, role, payload, res_2, err_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, 4, 5]);
                if (!selectedRole.value || !(selectedRole.value in rolePayloadFields)) {
                    return [2 /*return*/, (errors.value = {
                            role: { msg: "Please select a valid role." },
                        })];
                }
                feed.value = { show: false, status: null, msg: null };
                baseValidationData = {
                    regNo: form.value.regNo,
                    nationalId: form.value.nationalId,
                    fullNames: form.value.fullNames,
                    courseCode: form.value.courseCode,
                    year: form.value.year,
                    password: form.value.password
                };
                basePayloadData = {
                    regNo: baseValidationData.regNo,
                    nationalId: baseValidationData.nationalId,
                    fullNames: baseValidationData.fullNames,
                    courseCode: baseValidationData.courseCode,
                    year: baseValidationData.year,
                    password: baseValidationData.password
                };
                dataForValidation = getValidationFields(selectedRole.value, baseValidationData);
                roleSchemas = {
                    admin: Schemas.register.admin,
                    lecturer: Schemas.register.lecturer,
                    student: Schemas.register.student,
                };
                schema = roleSchemas[selectedRole.value.toLowerCase()];
                return [4 /*yield*/, Validate(schema, dataForValidation)];
            case 1:
                _a = _b.sent(), status_1 = _a.status, error = _a.error;
                if (!status_1) {
                    errors.value = error;
                    return [2 /*return*/];
                }
                role = selectedRole.value;
                payload = {
                    role: role,
                    data: pick(basePayloadData, rolePayloadFields[role]),
                };
                serverRequest.value = true;
                return [4 /*yield*/, register(payload)];
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
                            goBack();
                        }, 1000);
                    }
                }, 1000);
                return [3 /*break*/, 5];
            case 3:
                err_2 = _b.sent();
                setTimeout(function () {
                    var _a;
                    serverRequest.value = false;
                    feed.value = {
                        show: true,
                        status: false,
                        msg: (_a = err_2.msg) !== null && _a !== void 0 ? _a : "Registration failed.",
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
var selectCourse = function (course) {
    form.value.courseCode = course.courseCode;
    form.value.displayTitle = course.displayTitle;
    showDropdown.value = false;
};
var handleBlur = function () {
    setTimeout(function () {
        showDropdown.value = false;
    }, 200);
};
var goBack = function () { return loadContent("/admin/dashboard", router); };
watch(function () { return form.value.displayTitle; }, function (val) {
    showDropdown.value = true;
    filteredCourses.value = courseList.value.filter(function (course) {
        return course.courseTitle.toLowerCase().includes(val.toLowerCase());
    });
});
watch(selectedRole, function (role) {
    if (role === 'Student' || role === 'Lecturer') {
        fetchCourses();
    }
});
var __VLS_exposed = { submitForm: submitForm, handleBlur: handleBlur, selectCourse: selectCourse };
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
