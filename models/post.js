var mongodb = require('./db'),
	markdown = require('markdown').markdown;
	ObjectID = require('mongodb').ObjectID;

var Post = function(name,title,post){
	this.name = name;
	this.title = title;
	this.post = post;
};

module.exports = Post;

Post.prototype.save = function(callback){
	var date = new Date();

	var time = {
		date : date,
		year : date.getFullYear(),
		month : date.getFullYear() + "-" + (date.getMonth()+1),
		day : date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate(),
		minute : date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes()
	};
	var lastEditTime = time;

	var post = {
		name : this.name,
		title : this.title,
		time: time,
		lastEditTime : lastEditTime,
		post : this.post
	};

	mongodb.open(function (err,db){
		if(err){
			return callback(err);
		}
		db.collection('posts',function (err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			collection.insert(post,{
					safe: true
				},function (err,post){
				mongodb.close();
				callback(err,post);
			});
		});
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
	mongodb.open(function(err,db){
		if(err){
			return callback(err);
		}
		db.collection('posts',function (err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			var query = {
				"_id":ObjectID(id)};

			collection.update(query,
				{
					$set:{
						title:newPost.title,
						post:newPost.post,
						lastEditTime:lastEditTime
					}
				},function (err,doc){
					mongodb.close();
					if(err){
						callback(err,null);
					}
					callback(null,doc);
				}
			);
		});
	});
};

Post.getAll = function(name,callback){
	mongodb.open(function(err,db){
		if(err){
			return callback(err);
		}
		db.collection('posts',function (err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			var query = {};
			if(name){
				query.name = name;
			}
			collection.find(query).sort({time:-1}).toArray(function (err,docs){
				mongodb.close();
				if(err){
					callback(err,null);
				}
				//解析 markdown 为 html
				docs.forEach(function(doc){
					doc.originPost = doc.post;
					doc.post = markdown.toHTML(doc.post);
				});
				callback(null,docs);//成功！以数组形式返回查询的结果
			});
		});
	});
};

Post.getOne = function (name,day,title,callback){
	mongodb.open(function(err,db){
		if(err){
			return callback(err);
		}
		db.collection('posts',function (err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			var query = {"name":name,"time.day":day,"title":title};

			collection.findOne(query,function (err,doc){
				mongodb.close();
				if(err){
					return callback(err,null);
				}
				//解析 markdown 为 html
				doc.originPost = doc.post;
				doc.post = markdown.toHTML(doc.post);
				callback(null,doc);
			});
		});
	});
};

Post.getById = function(id,callback){
	mongodb.open(function(err,db){
		if(err){
			return callback(err);
		}
		db.collection('posts',function (err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			var query = {_id:ObjectID(id)};

			collection.findOne(query,function (err,doc){
				mongodb.close();
				if(err){
					return callback(err,null);
				}
				if(doc === null){
					return callback(err,null);
				}
				//解析 markdown 为 html
				doc.originPost = doc.post;
				doc.post = markdown.toHTML(doc.post);
				callback(null,doc);
			});
		});
	});
}

Post.remove = function(id,callback){
	mongodb.open(function(err,db){
		if(err){
			return callback(err);
		}
		db.collection('posts',function (err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			var query = {"_id":ObjectID(id)};

			collection.remove(query,
				function (err,count){
					mongodb.close();
					if(err){
						callback(err,null);
					}
					callback(null,count);
				}
			);
		});
	});
};