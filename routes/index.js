/*
 * / ：首页
 * /login ：用户登录
 * /reg ：用户注册
 * /post ：发表文章
 * /logout ：登出
 */
var site = require('../controllers/site'),
	auth = require('../controllers/auth'),
	sign = require('../controllers/sign'),
	post = require('../controllers/post'),
	user = require('../controllers/user'),
	upload = require('../controllers/upload');

var	User = require('../models/user.js'),
	Post = require('../models/post.js'),
	util = require('util');


module.exports = function(app) {
	app.get('/', site.index);

	app.get('/signin', auth.checkNotLogin, sign.showSignin);
	app.post('/signin', auth.checkNotLogin, sign.signin);
	app.get('/signup', auth.checkNotLogin, sign.showSignup);
	app.post('/signup', auth.checkNotLogin, sign.signup);
	app.get('/signout', auth.checkLogin, sign.signout);

	app.get('/user/:name', user.index);

	app.get('/post', auth.checkLogin, post.showCreate);
	app.post('/post', auth.checkLogin, post.saveCreate);
	app.get('/article/:name/:id', post.show);
	app.get('/article/:name/:id/edit', auth.checkUserRight, post.showEdit);
	app.post('/article/:name/:id/edit', auth.checkUserRight, post.saveEdit);

	app.get('/article/:name/:id/delete', auth.checkUserRight, post.remove);

	app.post('/upload/image', upload.uploadImage);

};

