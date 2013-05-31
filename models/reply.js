var mongodb = require('./db');
var markdown = require('node-markdown').Markdown;
var ObjectID = require('mongodb').ObjectID;
var utils = require('../libs/utils');

var Reply = function (reply){
  this.content = reply.content,
  this.postId = reply.postId,
  this.name = reply.name,
  this.replyId = reply.replyId
}

module.exports = Reply;

Reply.prototype.save = function(callback){
  var time = utils.getTime();
  var reply = {
    content: this.content,
    postId : this.postId,
    name : this.name,
    replyId : this.replyId,
    time : time
  }

  mongodb.open(function (err,db){
    if(err){
      return callback(err);
    }
    db.collection('replies',function (err,collection){
      if(err){
        mongodb.close();
        return callback(err);
      }
      collection.insert(reply,{
          safe: true
        },function (err,reply){
        mongodb.close();
        callback(err,reply);
      });
    });
  });
};

Reply.getById = function (id, callback){
  mongodb.open(function(err,db){
    if(err){
      return callback(err);
    }
    db.collection('replies',function (err,collection){
      if(err){
        mongodb.close();
        return callback(err);
      }try{
        var query = {_id:ObjectID(id)};
      }catch(err){
        return callback(err);
      }
      

      collection.findOne(query,function (err,doc){
        mongodb.close();
        if(err){
          return callback(err,null);
        }
        if(doc === null){
          return callback(err,null);
        }
        console.log(doc);
        //解析 markdown 为 html
        doc.originContent = doc.content;
        // doc.post = safeConverter.makeHtml(doc.post);
        doc.content = markdown(doc.content,true);

        callback(null,doc);
      });
    });
  });
};

Reply.getRepliesByPostId = function (postId,callback){
    mongodb.open(function(err,db){
    if(err){
      return callback(err);
    }
    db.collection('replies',function (err,collection){
      if(err){
        mongodb.close();
        return callback(err);
      }

      var query = {'postId':postId};

      collection.find(query).sort({time:1}).toArray(function (err,replies){
        mongodb.close();
        if(err){
          return callback(err,null);
        }
        if(replies === null){
          return callback(err,null);
        }
       
        replies.forEach(function(reply){
          reply.originContent = reply.content;
          reply.content = markdown(reply.content,true);
        });
        

        callback(null,replies);
      });
    });
  });
};


Reply.remove = function(id,callback){
  mongodb.open(function(err,db){
    if(err){
      return callback(err);
    }
    db.collection('replies',function (err,collection){
      if(err){
        mongodb.close();
        return callback(err);
      }
      try{
        var query = {"_id":ObjectID(id)};
      }catch(err){
        return callback(err);
      }
      


      collection.remove(query,
        function (err,count){
          
          if(err){
            callback(err,null);
          }

          //删除二级评论
          var query2 = {"replyId":id};
          collection.remove(query2,
            function (err,count){
              mongodb.close();
              if(err){
                callback(err,null);
              }
                callback(null,count);
            }
          );

        }
      );

      
    });
  });
};



