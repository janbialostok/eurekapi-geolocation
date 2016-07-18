'use strict';
const http = require('http');

var GeoIP = class GeoIP {
	constructor (options) {
		let apikey = options.apikey;
		this.ip = options.ip;
		this.format = (typeof options.format === 'string' && options.format.length) ? options.format.toUpperCase() : 'JSON';
		this.setRequestUrl = function () {
			this.requestUrl = `http://api.apigurus.com/iplocation/v1.8/locateip?key=${ apikey }&ip=${ this.ip }&format=${ this.format }`;
		};
		this.logger = (typeof options.logger === 'object' && options.logger.warn) ? options.logger.warn : console.log;
		this.timeout = options.timeout || 3000;
		this.setRequestUrl();
		return this;
	}
	getLocation (cb) {
		let data = '';
		let timeout;
		let done = (error, data) => {
			if (timeout) clearTimeout(timeout);
			cb(error, data);
		};
		let req = http.get(this.requestUrl, res => {
			res.on('data', chunk => {
				data += chunk;
			});
			res.on('error', done);
			res.on('end', () => {
				try {
					data = JSON.parse(data);
				}
				catch (e) {
					this.logger('IP geolocation response is not in json format', e);
				}
				done(null, data);
			});
		})
			.on('error', done)
			.on('abort', () => done(new Error('An IP geolocation request timeout occured')));
		timeout = setTimeout(req.abort.bind(req), this.timeout);
	}
	getLocationAsync () {
		return new Promise((resolve, reject) => {
			this.getLocation.call(this, (err, data) => {
				if (err) {
					reject(err);
				}
				else {
					resolve(data);
				}
			});
		});
	}
	setIP (ip) {
		this.ip = (typeof ip === 'string') ? ip : this.ip;
		this.setRequestUrl();
		return this;
	}
};

module.exports = GeoIP;