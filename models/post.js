var mongodb = require('./db');
var markdown = require('node-markdown').Markdown;
var	ObjectID = require('mongodb').ObjectID;
var utils = require('../libs/utils');
var posts = mongodb.collection('posts');

var Post = function(name,title,post){
	this.name = name;
	this.title = title;
	this.post = post;
};

module.exports = Post;

Post.prototype.save = function(callback){
	var time = utils.getTime();
	var lastEditTime = time;

	var post = {
		name : this.name,
		title : this.title,
		time: time,
		lastEditTime : lastEditTime,
		post : this.post
	};
	posts.insert(post,{
			safe: true
		},function (err,post){
		callback(err,post);
	});
};

Post.update = function(id,newPost,callback){
	var date = new Date();
	var lastEditTime = {
		date : date,
		year : date.getFullYear(),
		month : date.getFullYear() + "-" + (date.getMonth()+1),
		day : date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate(),
		minute : date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes()
	};
	posts.updateById(id,{
		$set:{
			title:newPost.title,
			post:newPost.post,
			lastEditTime:lastEditTime
		}
	},function (err,doc){
		if(err){
			callback(err,null);
		}
		callback(null,doc);
	});
};

Post.getAll = function(name,callback){
	var query = {};
	if(name){
		query.name = name;
	}
	posts.find(query).sort({time:-1}).toArray(function (err,docs){
		if(err){
			callback(err,null);
		}
		//解析 markdown 为 html
		docs.forEach(function(doc){
			doc.time.friendly = utils.formatDate(doc.time.date,true);
			doc.originPost = doc.post;
			doc.post = markdown(doc.post,true);
		});
		callback(null,docs);//成功！以数组形式返回查询的结果
	});
};

Post.getById = function(id,callback){
	posts.findById(id,function (err,doc){
		if(err){
			return callback(err,null);
		}
		//解析 markdown 为 html
		doc.originPost = doc.post;
		// doc.post = safeConverter.makeHtml(doc.post);
		doc.post = markdown(doc.post,true);

		callback(null,doc);
	});
}

Post.remove = function(id,callback){
	posts.removeById(id,function (err,count){
		if(err){
			callback(err,null);
		}
		callback(null,count);
	});
};