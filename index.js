'use strict';
const http = require('http');

var GeoIP = function (options) {
	this.ip = options.ip;
	this.format = options.format || 'JSON';
	this.requestUrl = `http://api.eurekapi.com/iplocation/v1.8/locateip?key=${ options.apikey }&ip=${ this.ip }&format=${ this.format }`;
	this.logger = (typeof options.logger === 'object' && options.logger.warn) ? options.logger.warn : console.log;
	this.timeout = options.timeout || 3000;
	return this;
};

GeoIP.prototype.getLocation = function (cb) {
	let data = '';
	let req = http.get(this.requestUrl, res => {
		res.on('data', chunk => {
			data += chunk;
		});
		res.on('error', err => {
			cb(err);
		});
		res.on('end', () => {
			try {
				data = JSON.parse(data);
			}
			catch (e) {
				this.logger('IP geolocation response is not in json format', e);
			}
			cb(null, data);
		});
	}).on('error', (e) => {
		cb(e);
	});
	setTimeout(() => {
		cb(new Error('An IP geolocation request timeout occured'));
		req.abort();
	}, this.timeout);
};

GeoIP.prototype.getLocationAsync = function () {
	return new Promise((resolve, reject) => {
		GeoIP.prototype.getLocation.call(this, (err, data) => {
			if (err) {
				reject(err);
			}
			else {
				resolve(data);
			}
		});
	});
};

GeoIP.prototype.setIP = function (ip) {
	this.ip = (typeof ip === 'string') ? ip : this.ip;
	return this;
};

module.exports = GeoIP;