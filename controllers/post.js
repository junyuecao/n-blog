var Post = require('../models/post');
var markdown = require('markdown').markdown;
var Reply = require('../models/reply');
var utils = require('../libs/utils');
/**
 * 显示发表文章界面
 */
exports.showCreate = function(req, res) {
	res.render('edit', {
		action: 'create',
		title: '发表新文章 - 学习轨迹',
		user: req.session.user,
		success: req.flash('success').toString(),
		error: req.flash('error').toString()
	});
};

/**
 * 保存新建的文章
 */
exports.saveCreate = function(req, res) {
	req.assert('title','标题不能为空').notEmpty();
	req.assert('title','标题在100字以内').len(1-200);
	var errors = req.validationErrors();
	if(errors){
		var msg = "";
		errors.forEach(function (error,index){
			msg+=error.msg+" ";
		});
		req.flash('error', msg);
		return res.redirect('back');
	}
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
};

/**
 * 根据ID显示文章和评论
 */
exports.show = function(req, res) {
	var name = req.params.name;
	var postId = req.params.id;
	var oneLevel = [];
	var twoLevel = [];
	Post.getById(req.params.id, function (err, post) {
		if (err) {
			req.flash('error', err);
			return res.redirect('/');
		}
		Reply.getRepliesByPostId(postId, function (err,replies){
			if (err) {
				req.flash('error', err);
				return res.redirect('/');
			}
			replies.forEach(function (reply,index){
				reply.time.friendly = utils.formatDate(reply.time.date,true);
				if(reply.replyId != null){
					twoLevel.push(reply);
				}
				else{
					oneLevel.push(reply);
				}
			});
			oneLevel.forEach(function (reply,index1){
				reply.replies = [];
			});
			twoLevel.forEach(function (reply2,index2){
				oneLevel.forEach(function (reply1,index1){
					if(reply1._id == reply2.replyId){
						reply1.replies.push(reply2);
					}
				})
			});
			post.time.friendly = utils.formatDate(post.time.date,true);
			post.lastEditTime.friendly = utils.formatDate(post.lastEditTime.date,true);
			res.render('article', {
				title: post.title +' - ' + post.name + ' - 学习轨迹',
				post: post,
				replies : oneLevel,
				replyCount: oneLevel.length,
				user: req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});
		
	});
};

/**
 * 显示编辑文章界面
 */
exports.showEdit = function(req, res) {

	Post.getById(req.params.id, function(err, post) {
		if (err) {
			req.flash('error', err);
			return res.redirect('/');
		}
		res.render('edit', {
			action: 'edit',
			title: '[编辑] ' + post.title +' - ' + post.name + ' - 学习轨迹',
			post: post,
			user: req.session.user,
			goBackUrl:'/article/' + req.session.user.name + '/' + req.params.id,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
};

/**
 * 保存编辑的文章
 */
exports.saveEdit = function(req, res) {

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
};


/**
 * 删除文章
 */
exports.remove = function(req, res) {

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
};