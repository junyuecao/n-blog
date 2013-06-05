var utils = require('../libs/utils');
var Post = require('../models/post');

/**
 *显示搜索页面
 */
exports.showResult = function (req, res, next) {
  var key = decodeURIComponent(encodeURI(req.query.key)).trim();

  if (!key) {
      req.flash('error', '请重新搜索');
      return res.redirect('/');
  }
  var query = utils.replaceReg(key);
  var queryObj = {};
  queryObj.searchReg = new RegExp('.*' + query + '|' + query + '.*', 'i');
  queryObj.searchString = query;
  Post.getPostsByQuery(queryObj,function(err,posts){
    if(err){
      req.flash('error','搜索出错');
      return res.redirect('/');
    }
    res.render('index', {
      title: '学习轨迹',
      user: req.session.user,
      action:'search',
      posts: posts,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
};