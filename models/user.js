var mongodb = require('./db');
var users = mongodb.collection('users');

function User(user){
	this.name = user.name;
	this.password = user.password;
	this.email = user.email;
}

module.exports = User;

User.prototype.save = function(callback) {
	//要存入数据库的用户文档
	var user = {
		name: this.name,
		password : this.password,
		email : this.email
	};
	users.insert(user,{safe:true},function (err,user){
		callback(err,user);
	});
};

User.get = function(name,callback) {
	//通过用户名获取
	users.findOne({name:name},function (err,doc){
		if(doc){
			var user = new User(doc);
			user._id = doc._id.toString();
			callback(err,user);
		}else{
			callback(err,null);
		}
	});
};