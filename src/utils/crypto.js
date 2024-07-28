var CryptoJS = require("crypto-js");
const secretKey = "3d2as3da11czx1d2asewqgq2r1";

export const endCode = (text)=>{
    var ciphertext = CryptoJS.AES.encrypt(text, secretKey).toString();
    return ciphertext;
}

export const deCode = (text)=>{
    // Decrypt
    var bytes  = CryptoJS.AES.decrypt(text, secretKey);
    var decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    return decryptedData;
}