import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { async } from 'q';

@Injectable()

export class EncrDecrService {
	constructor() { }

	//The set method is use for encrypt the value.
	set = async (keys, value) => {
		var key = CryptoJS.enc.Utf8.parse(keys);
		var iv = CryptoJS.enc.Utf8.parse(keys);
		return new Promise((resolve, reject) => {
			var encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(value.toString()), key,
				{
					keySize: 128 / 8,
					iv: iv,
					mode: CryptoJS.mode.CFB,
					padding: CryptoJS.pad.Pkcs7
				});
			if (encrypted) {
				resolve(encrypted.toString());
			} else {
				resolve(encrypted)
			}
		});
	}

	//The get method is use for decrypt the value.
	get = async (keys, value) => {
		var key = CryptoJS.enc.Utf8.parse(keys);
		var iv = CryptoJS.enc.Utf8.parse(keys);
		return new Promise((resolve, reject) => {
			var decrypted = CryptoJS.AES.decrypt(value, key, {
				keySize: 128 / 8,
				iv: iv,
				mode: CryptoJS.mode.CFB,
				padding: CryptoJS.pad.Pkcs7
			});
			if (decrypted) {
				resolve(decrypted.toString(CryptoJS.enc.Utf8));
			} else {
				resolve(decrypted)
			}
		});
	}
}