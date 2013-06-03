var Post = require('../models/post');

exports.index = function(req,res){
	Post.getAll(null, function(err, posts) {
			if (err || posts == null) {
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
};