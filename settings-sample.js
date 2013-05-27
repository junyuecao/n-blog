var path = require('path');

module.exports = {
	cookieSecret: 'myblog',
	db: {
		name: 'blog',
		host: 'localhost',
		port: 27017,
		username:"",
		password:""
	},
	env:"dep",
	// env:"development",
	upload_dir:path.join(__dirname, 'public', 'user_data', 'images')
};