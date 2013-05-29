var User = require('../models/user');
var Post = require('../models/post');

exports.index = function(req, res) {
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
				name:user.name,
				posts: posts,
				user: req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});
	});
};

