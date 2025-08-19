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
import * as security from '@components/utils/security';
var API_URL = '/api/qr';
export var secureQR = function (data, status) {
    if (data === void 0) { data = null; }
    if (status === void 0) { status = true; }
    if (!data) {
        throw new Error('Invalid data');
    }
    var qr;
    if (status) {
        qr = security.encrypt(data);
    }
    else {
        qr = security.decrypt(data);
    }
    return qr;
};
export var newQR = function (qr) { return __awaiter(void 0, void 0, void 0, function () {
    var response, data, _a, _b, error_1;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 3, , 4]);
                return [4 /*yield*/, fetch(API_URL, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ body: security.encrypt({ qr: qr }) }),
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
                error_1 = _c.sent();
                // console.clear()
                error_1 = security.decrypt(error_1);
                return [2 /*return*/, {
                        status: false,
                        msg: (error_1 === null || error_1 === void 0 ? void 0 : error_1.message) || 'Failed to store qr',
                        errors: (error_1 === null || error_1 === void 0 ? void 0 : error_1.errors) || null,
                    }];
            case 4: return [2 /*return*/];
        }
    });
}); };
export var validateQR = function () {
    var args_1 = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args_1[_i] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([], args_1, true), void 0, function (qrData, regNo) {
        var raw, response, data, _a, _b, error_2;
        var _c;
        if (qrData === void 0) { qrData = null; }
        if (regNo === void 0) { regNo = null; }
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 3, , 4]);
                    if (!qrData) {
                        throw security.encrypt({ message: 'Invalid QR Code' });
                    }
                    raw = (_c = qrData[0]) === null || _c === void 0 ? void 0 : _c.rawValue;
                    if (!raw) {
                        throw security.encrypt({ message: 'Invalid QR Code' });
                    }
                    if (!regNo) {
                        throw security.encrypt({ message: 'Invalid User' });
                    }
                    return [4 /*yield*/, fetch(API_URL, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ body: security.encrypt({ raw: raw, regNo: regNo }) }),
                        })];
                case 1:
                    response = _d.sent();
                    _b = (_a = security).decrypt;
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _b.apply(_a, [_d.sent()]);
                    if (!response.ok)
                        throw security.encrypt(data);
                    return [2 /*return*/, { status: true, data: data }];
                case 3:
                    error_2 = _d.sent();
                    // console.clear()
                    error_2 = security.decrypt(error_2);
                    return [2 /*return*/, {
                            status: false,
                            msg: (error_2 === null || error_2 === void 0 ? void 0 : error_2.message) || 'Failed to store qr',
                            errors: (error_2 === null || error_2 === void 0 ? void 0 : error_2.errors) || null,
                        }];
                case 4: return [2 /*return*/];
            }
        });
    });
};
