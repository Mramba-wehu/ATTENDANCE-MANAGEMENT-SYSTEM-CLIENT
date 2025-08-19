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
import * as security from "@components/utils/security";
var API_URL = "/api";
export var getCourses = function () { return __awaiter(void 0, void 0, void 0, function () {
    var response, data, _a, _b, error_1;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 3, , 4]);
                return [4 /*yield*/, fetch("".concat(API_URL, "/courses"))];
            case 1:
                response = _c.sent();
                _b = (_a = security).decrypt;
                return [4 /*yield*/, response.json()];
            case 2:
                data = _b.apply(_a, [_c.sent()]);
                if (!response.ok)
                    throw security.encrypt(data);
                return [2 /*return*/, { status: true, data: data }];
            case 3:
                error_1 = _c.sent();
                console.clear();
                error_1 = security.decrypt(error_1);
                return [2 /*return*/, {
                        status: false,
                        msg: (error_1 === null || error_1 === void 0 ? void 0 : error_1.message) || "Failed to fetch courses",
                        errors: (error_1 === null || error_1 === void 0 ? void 0 : error_1.errors) || null,
                    }];
            case 4: return [2 /*return*/];
        }
    });
}); };
export var getUnits = function () {
    var args_1 = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args_1[_i] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([], args_1, true), void 0, function (courseCode) {
        var response, data, _a, _b, error_2;
        if (courseCode === void 0) { courseCode = null; }
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!courseCode)
                        throw new Error(security.encrypt({ message: 'Course Code required' }));
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch("".concat(API_URL, "/units"), {
                            method: 'Post',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ body: security.encrypt({ courseCode: courseCode }) })
                        })];
                case 2:
                    response = _c.sent();
                    _b = (_a = security).decrypt;
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _b.apply(_a, [_c.sent()]);
                    if (!response.ok)
                        throw security.encrypt(data);
                    return [2 /*return*/, { status: true, data: data }];
                case 4:
                    error_2 = _c.sent();
                    console.clear();
                    error_2 = security.decrypt(error_2);
                    return [2 /*return*/, {
                            status: false,
                            msg: (error_2 === null || error_2 === void 0 ? void 0 : error_2.message) || "Failed to fetch courses",
                            errors: (error_2 === null || error_2 === void 0 ? void 0 : error_2.errors) || null,
                        }];
                case 5: return [2 /*return*/];
            }
        });
    });
};
var fillerWords = ["of", "and", "in", "the", "for", "with", "on", "to"];
var levelPrefixes = {
    Certificate: "CERT",
    Diploma: "DIP",
    Bachelor: "BA",
    Masters: "MA",
    PhD: "PHD",
    Doctorate: "DOC",
};
export var generateCode = function (title, level) {
    var normalizeLevel = function (level) {
        return level.charAt(0).toUpperCase() + level.slice(1).toLowerCase();
    };
    var normalizedLevel = normalizeLevel(level);
    if (!title.trim() || !normalizedLevel || !levelPrefixes[normalizedLevel]) {
        throw new Error("Invalid level or title: ".concat(title, ", ").concat(level));
    }
    var prefix = levelPrefixes[normalizedLevel];
    var initials = title
        .split(" ")
        .filter(function (word) { return word && !fillerWords.includes(word.toLowerCase()); })
        .map(function (word) { return word[0].toUpperCase(); })
        .join("");
    var randomDigits = Math.floor(1000 + Math.random() * 9000);
    return "".concat(prefix).concat(initials).concat(randomDigits);
};
export var register = function (payload) { return __awaiter(void 0, void 0, void 0, function () {
    var response, result, _a, _b, error_3;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 3, , 4]);
                return [4 /*yield*/, fetch("".concat(API_URL, "/courses"), {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ body: security.encrypt(payload) }),
                    })];
            case 1:
                response = _c.sent();
                _b = (_a = security).decrypt;
                return [4 /*yield*/, response.json()];
            case 2:
                result = _b.apply(_a, [_c.sent()]);
                if (!response.ok)
                    throw security.encrypt(result);
                return [2 /*return*/, { status: true, data: result }];
            case 3:
                error_3 = _c.sent();
                console.clear();
                error_3 = security.decrypt(error_3);
                return [2 /*return*/, {
                        status: false,
                        msg: (error_3 === null || error_3 === void 0 ? void 0 : error_3.message) || "Course registration failed.",
                        errors: (error_3 === null || error_3 === void 0 ? void 0 : error_3.errors) || null,
                    }];
            case 4: return [2 /*return*/];
        }
    });
}); };
export var registerUnit = function (payload) { return __awaiter(void 0, void 0, void 0, function () {
    var response, data, _a, _b, error_4;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 3, , 4]);
                return [4 /*yield*/, fetch("".concat(API_URL, "/units/new"), {
                        method: 'Post',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ body: security.encrypt(payload) })
                    })];
            case 1:
                response = _c.sent();
                _b = (_a = security).decrypt;
                return [4 /*yield*/, response.json()];
            case 2:
                data = _b.apply(_a, [_c.sent()]);
                if (!response.ok)
                    throw security.encrypt(data);
                return [2 /*return*/, { status: true, data: data }];
            case 3:
                error_4 = _c.sent();
                console.clear();
                error_4 = security.decrypt(error_4);
                return [2 /*return*/, {
                        status: false,
                        msg: (error_4 === null || error_4 === void 0 ? void 0 : error_4.message) || 'Unit registration failed',
                        errors: (error_4 === null || error_4 === void 0 ? void 0 : error_4.errors) || null,
                    }];
            case 4: return [2 /*return*/];
        }
    });
}); };
export var deleteUnit = function (unitCode) { return __awaiter(void 0, void 0, void 0, function () {
    var response, data, _a, _b, error_5;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 3, , 4]);
                return [4 /*yield*/, fetch("".concat(API_URL, "/units"), {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ body: security.encrypt({ unitCode: unitCode }) })
                    })];
            case 1:
                response = _c.sent();
                _b = (_a = security).decrypt;
                return [4 /*yield*/, response.json()];
            case 2:
                data = _b.apply(_a, [_c.sent()]);
                if (!response.ok)
                    throw security.encrypt(data);
                return [2 /*return*/, { status: true, data: data }];
            case 3:
                error_5 = _c.sent();
                error_5 = security.decrypt(error_5);
                return [2 /*return*/, {
                        status: false,
                        msg: (error_5 === null || error_5 === void 0 ? void 0 : error_5.message) || 'Failed to delete unit',
                        errors: (error_5 === null || error_5 === void 0 ? void 0 : error_5.errors) || null,
                    }];
            case 4: return [2 /*return*/];
        }
    });
}); };
export var updateCourse = function (payload) { return __awaiter(void 0, void 0, void 0, function () {
    var response, result, _a, _b, error_6;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 3, , 4]);
                return [4 /*yield*/, fetch("".concat(API_URL, "/courses"), {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ body: security.encrypt(payload) }),
                    })];
            case 1:
                response = _c.sent();
                _b = (_a = security).decrypt;
                return [4 /*yield*/, response.json()];
            case 2:
                result = _b.apply(_a, [_c.sent()]);
                if (!response.ok)
                    throw security.encrypt(result);
                return [2 /*return*/, { status: true, data: result }];
            case 3:
                error_6 = _c.sent();
                console.clear();
                error_6 = security.decrypt(error_6);
                return [2 /*return*/, {
                        status: false,
                        msg: (error_6 === null || error_6 === void 0 ? void 0 : error_6.message) || "Failed to update course.",
                        errors: (error_6 === null || error_6 === void 0 ? void 0 : error_6.errors) || null,
                    }];
            case 4: return [2 /*return*/];
        }
    });
}); };
export var deleteCourse = function (courseCode) { return __awaiter(void 0, void 0, void 0, function () {
    var response, data, _a, _b, error_7;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 3, , 4]);
                return [4 /*yield*/, fetch("".concat(API_URL, "/courses"), {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ body: security.encrypt({ courseCode: courseCode }) })
                    })];
            case 1:
                response = _c.sent();
                _b = (_a = security).decrypt;
                return [4 /*yield*/, response.json()];
            case 2:
                data = _b.apply(_a, [_c.sent()]);
                if (!response.ok)
                    throw security.encrypt(data);
                return [2 /*return*/, { status: true, data: data }];
            case 3:
                error_7 = _c.sent();
                error_7 = security.decrypt(error_7);
                return [2 /*return*/, {
                        status: false,
                        msg: (error_7 === null || error_7 === void 0 ? void 0 : error_7.message) || 'Failed to delete course',
                        errors: (error_7 === null || error_7 === void 0 ? void 0 : error_7.errors) || null,
                    }];
            case 4: return [2 /*return*/];
        }
    });
}); };
