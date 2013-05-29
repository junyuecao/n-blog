var Post = require('../models/post');
var markdown = require('markdown').markdown;
var Reply = require('../models/reply');

/**
 * 添加评论
 */
exports.saveCreate = function (req,res){
  req.assert('content','回复不能为空').notEmpty();
  var errors = req.validationErrors();
  if(errors){
    var msg = "";
    errors.forEach(function (error,index){
      msg+=error.msg+" ";
    });
    req.flash('error', msg);
    return res.redirect('back');
  }
  var currentUser = req.session.user;
  var reply = new Reply({
    content: req.body.content,
    postId : req.params.postId,
    name : currentUser.name,
    replyId : (req.params.replyId) ? req.params.replyId : null
  }); 
  
  reply.save(function(err) {
    if (err) {
      req.flash('error', err);
      return res.redirect('/article/'+currentUser.name + '/' + req.params.postId);
    }
    req.flash('success', '发表成功');
    res.redirect('/article/'+currentUser.name + '/' + req.params.postId);
  });
};

/**
 * 删除评论
 */
exports.remove = function(req, res) {

  var currentUser = req.session.user;
  Reply.remove(req.params.replyId, function(err, count) {
    if (err) {
      req.flash('error', err);
      return res.redirect('/');
    }
    if(count){
      req.flash('error','删除失败');
      return res.redirect('/');
    }
    req.flash('success','删除成功');
    res.redirect('back');
  });
};