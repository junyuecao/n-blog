/*
 * / ：首页
 * /login ：用户登录
 * /reg ：用户注册
 * /post ：发表文章
 * /logout ：登出
 */
var site = require('../controllers/site');
var auth = require('../controllers/auth');
var sign = require('../controllers/sign');
var post = require('../controllers/post');
var user = require('../controllers/user');
var upload = require('../controllers/upload');
var reply = require('../controllers/reply');

var	User = require('../models/user.js');
var Post = require('../models/post.js');
var util = require('util');



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

	app.post('/reply/:postId', auth.checkLogin, reply.saveCreate);
	app.post('/reply/:postId/:replyId', auth.checkLogin, reply.saveCreate);
	app.get('/reply/:postId/:replyId/delete', auth.checkDeleteReplyRight, reply.remove);

	app.post('/upload/image', upload.uploadImage);

    // 其他 路由 404 ...
    app.get('*', function(req, res){
        res.statusCode = 404;
        res.render('404.ejs', {
            title: '找不到页面',
            user: req.session.user
        });
    });


};

