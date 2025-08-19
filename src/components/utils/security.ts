import CryptoJS from 'crypto-js';

const SECRET_KEY = import.meta.env.VITE_SECRET;

export const encrypt = (data: any): string => {
  if (!SECRET_KEY) {
    throw new Error("KEY REQUIRED");
  }
  const jsonString = JSON.stringify(data);
  return CryptoJS.AES.encrypt(jsonString, SECRET_KEY).toString();
};

export const decrypt = (ciphertext: string): any => {
  if (!SECRET_KEY) {
    throw new Error("KEY REQUIRED");
  }
  const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);
  return JSON.parse(decrypted);
};