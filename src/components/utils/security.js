import CryptoJS from 'crypto-js';
var SECRET_KEY = import.meta.env.VITE_SECRET;
export var encrypt = function (data) {
    if (!SECRET_KEY) {
        throw new Error("KEY REQUIRED");
    }
    var jsonString = JSON.stringify(data);
    return CryptoJS.AES.encrypt(jsonString, SECRET_KEY).toString();
};
export var decrypt = function (ciphertext) {
    if (!SECRET_KEY) {
        throw new Error("KEY REQUIRED");
    }
    var bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    var decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decrypted);
};
