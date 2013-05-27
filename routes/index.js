/*
 * / ：首页
 * /login ：用户登录
 * /reg ：用户注册
 * /post ：发表文章
 * /logout ：登出
 */

var crypto = require('crypto'),
	User = require('../models/user.js'),
	Post = require('../models/post.js'),
	util = require('util');


module.exports = function(app) {
	app.get('/', function(req, res) {
		Post.getAll(null, function(err, posts) {
			if (err) {
				posts = [];
			}
			res.render('index', {
				title: '学习轨迹',
				user: req.session.user,
				posts: posts,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});
	});

	app.get('/login', checkNotLogin);
	app.get('/login', function(req, res) {
		res.render('login', {
			title: '登录 - 学习轨迹',
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});

	app.post('/login', checkNotLogin);
	app.post('/login', function(req, res) {
		var md5 = crypto.createHash('md5'),
			password = md5.update(req.body.password).digest('hex');
		User.get(req.body.name, function(err, user) {
			if (!user) {
				req.flash('error', '用户不存在');
				return res.redirect('/login');
			}

			if (user.password != password) {
				req.flash('error', '密码错误');
				return res.redirect('/login');
			}

			req.flash('success', '登录成功');
			req.session.user = user;
			res.redirect('/');
		});
	});

	app.get('/reg', checkNotLogin);
	app.get('/reg', function(req, res) {
		res.render('reg', {
			title: '注册 - 学习轨迹',
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});

	app.post('/reg', checkNotLogin);
	app.post('/reg', function(req, res) {
		var name = req.body.name,
			password = req.body.password,
			password_re = req.body['password-repeat'];
		req.assert('name','用户名不能为空').notEmpty();
		req.assert('email', 'Email错误').isEmail();
		req.assert('password', '密码必须是6-20位').len(6, 20);

		var errors = req.validationErrors();
		if(errors){
			var msg = "";
			errors.forEach(function (error,index){
				msg+=error.msg+" ";
			});
			req.flash('error', msg);
			return res.redirect('/reg');
		}
		//校验是否密码相同
		if (password != password_re) {
			req.flash('error', '两次密码输入不一样！');
			return res.redirect('/reg');
		}

		//生成密码散列
		var md5 = crypto.createHash('md5'),
			password = md5.update(req.body.password).digest('hex');
		var newUser = new User({
			name: req.body.name,
			password: password,
			email: req.body.email
		});

		User.get(newUser.name, function(err, user) {
			if (user) {
				err = '用户已存在！';
			}
			if (err) {
				req.flash('error', err);
				return res.redirect('/reg');
			}
			newUser.save(function(err) {
				if (err) {
					req.flash('error', err);
					return res.redirect('/reg');
				}
				req.session.user = newUser;
				req.flash('success', '注册成功');
				res.redirect('/');
			});
		});
	});

	app.get('/post', function(req, res) {
		res.render('post', {
			title: '发表新文章 - 学习轨迹',
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});

	app.post('/post', function(req, res) {
		var currentUser = req.session.user,
			post = new Post(currentUser.name, req.body.title, req.body.post);
		post.save(function(err) {
			if (err) {
				req.flash('error', err);
				return res.redirect('/');
			}
			req.flash('success', '发表成功');
			res.redirect('/');
		});
	});

	app.get('/logout', function(req, res) {
		req.session.user = null;
		req.flash('success', '登出成功');
		res.redirect('/');
	});

	app.get('/:name', function(req, res) {
		User.get(req.params.name, function(err, user) {
			if (!user) {
				req.flash('error', '用户不存在');
				return res.redirect('/');
			}
			Post.getAll(user.name, function(err, posts) {
				if (err) {
					req.flash('error', err);
					return res.redirect('/');
				}
				res.render('user', {
					title: user.name +'的文章 - 学习轨迹',
					posts: posts,
					user: req.session.user,
					success: req.flash('success').toString(),
					error: req.flash('error').toString()
				});
			});
		});
	});

	app.get('/article/:name/:id', function(req, res) {
		Post.getById(req.params.id, function (err, post) {
			if (err) {
				req.flash('error', err);
				return res.redirect('/');
			}
			res.render('article', {
				title: post.title +' - ' + post.name + ' - 学习轨迹',
				post: post,
				user: req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});
	});

	app.get('/article/:name/:id/edit', checkUserRight);
	app.get('/article/:name/:id/edit', function(req, res) {

		Post.getById(req.params.id, function(err, post) {
			if (err) {
				req.flash('error', err);
				return res.redirect('/');
			}
			res.render('edit', {
				title: '[编辑] ' + post.title +' - ' + post.name + ' - 学习轨迹',
				post: post,
				user: req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});
	});
	app.post('/article/:name/:id/edit', checkUserRight);
	app.post('/article/:name/:id/edit', function(req, res) {

		var currentUser = req.session.user,
			post = new Post(currentUser.name, req.body.title, req.body.post);
		Post.update(req.params.id, post, function(err, post) {
			if (err) {
				req.flash('error', err);
				return res.redirect('/');
			}
			req.flash('success','更新成功');
			res.redirect('/article/'+req.params.name+'/'+req.params.id);
		});
	});
	app.get('/article/:name/:id/delete', checkUserRight);
	app.get('/article/:name/:id/delete', function(req, res) {

		var currentUser = req.session.user;
		Post.remove(req.params.id, function(err, count) {
			if (err) {
				req.flash('error', err);
				return res.redirect('/');
			}
			if(count){
				req.flash('error','删除失败');
				return res.redirect('/');
			}
			req.flash('success','删除成功');
			res.redirect('/');
		});
	});

};


function checkNotLogin(req, res, next) {
	//检查是否未登录,如果已登录就返回
	if (req.session.user) {
		req.flash('error', '已登录');
		return res.redirect('/');
	}

	next();
}

function checkLogin(req, res, next) {
	//检查是否已登录,如果已登录就跳到登录界面
	if (!req.session.user) {
		req.flash('error', '未登录');
		return res.redirect('/login');
	}

	next();
}

function checkUserRight(req,res,next){
	//检查用户权限
	if(req.params.name!=req.session.user.name){
		req.flash('error','没有权限!');
		return res.redirect('/'+req.params.name+'/'+req.params.day+'/'+req.params.title);
	}
	next();
}