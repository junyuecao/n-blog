var crypto = require('crypto'),
	User = require('../models/user.js');


/**
 *显示登录页面
 */
exports.showSignin = function(req, res) {
	res.render('signin', {
		title: '登录 - 学习轨迹',
		user: req.session.user,
		success: req.flash('success').toString(),
		error: req.flash('error').toString()
	});
};

exports.signin = function(req, res) {
	var md5 = crypto.createHash('md5'),
		password = md5.update(req.body.password).digest('hex');
	User.get(req.body.name, function(err, user) {
		if (!user) {
			req.flash('error', '用户不存在');
			return res.redirect('/signin');
		}

		if (user.password != password) {
			req.flash('error', '密码错误');
			return res.redirect('/signin');
		}

		req.flash('success', '登录成功');
		req.session.user = user;
		res.redirect('/');
	});
};

exports.showSignup = function(req, res) {
	res.render('signup', {
		title: '注册 - 学习轨迹',
		user: req.session.user,
		success: req.flash('success').toString(),
		error: req.flash('error').toString()
	});
};

exports.signup = function(req, res) {
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
		return res.redirect('/signup');
	}
	//校验是否密码相同
	if (password != password_re) {
		req.flash('error', '两次密码输入不一样！');
		return res.redirect('/signup');
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
			return res.redirect('/signup');
		}
		newUser.save(function(err) {
			if (err) {
				req.flash('error', err);
				return res.redirect('/signup');
			}
			req.session.user = newUser;
			req.flash('success', '注册成功');
			res.redirect('/');
		});
	});
};

exports.signout = function(req, res) {
	req.session.user = null;
	req.flash('success', '登出成功');
	res.redirect('/');
};