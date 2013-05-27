/**
 *检查是否为未登录状态
 */
exports.checkNotLogin = function (req, res, next) {
	//检查是否未登录,如果已登录就返回
	if (req.session.user) {
		req.flash('error', '已登录');
		return res.redirect('/');
	}

	next();
};

/**
 *检查是否为已登录状态
 */
exports.checkLogin = function (req, res, next) {
	//检查是否已登录,如果已登录就跳到登录界面
	if (!req.session.user) {
		req.flash('error', '未登录');
		return res.redirect('/signin');
	}

	next();
};

/**
 *检查是否为用户的文章
 */
exports.checkUserRight = function (req,res,next){
	//检查用户权限
	if(req.params.name!=req.session.user.name){
		req.flash('error','没有权限!');
		return res.redirect('/'+req.params.name);
	}
	next();
};