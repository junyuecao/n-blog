var settings = require('../settings').db,
	mongoskin = require('mongoskin');
	// Db = require('mongodb').Db,
	// Connection = require('mongodb').Connection,
	// Server = require('mongodb').Server;
	// module.exports = new Db(settings.db,new Server(settings.host,Connection.DEFAULT_PORT,{}));
	// url = settings.host + "/" + settings.db + "?auto_reconnect";

if (process.env.VCAP_SERVICES) {
	var env = JSON.parse(process.env.VCAP_SERVICES);
	var mongo = env['mongodb-1.8'][0]['credentials'];
} else {
	var mongo = {
		"hostname": settings.host,
		"port": settings.port,
		"username": settings.username,
		"password": settings.password,
		"name": "",
		"db": settings.name
	};
}
var generate_mongo_url = function(obj) {
	obj.hostname = (obj.hostname || 'localhost');
	obj.port = (obj.port || 27017);
	obj.db = (obj.db || 'test');
	if (obj.username && obj.password) {
		return "mongodb://" + obj.username + ":" + obj.password + "@" + obj.hostname + ":" + obj.port + "/" + obj.db + '?auto_reconnect';
	} else {
		return "mongodb://" + obj.hostname + ":" + obj.port + "/" + obj.db + '?auto_reconnect';
	}
	console.log(mongourl);
};
var mongourl = generate_mongo_url(mongo);

module.exports = mongoskin.db(mongourl);