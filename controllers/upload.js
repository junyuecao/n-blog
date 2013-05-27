var fs = require('fs.extra');
var path = require('path');
var ndir = require('ndir');
var config = require('../settings');

exports.uploadImage = function (req, res, next) {
  if (!req.session || !req.session.user) {
    res.send({ status: 'forbidden' });
    return;
  }
  var file = req.files && req.files.userfile;
  if (!file) {
    res.send({ status: 'failed', message: 'no file' });
    return;
  }
  var uid = req.session.user._id;
  var userDir = path.join(config.upload_dir, uid);
  ndir.mkdir(userDir, function (err) {
    if (err) {
      return next(err);
    }
    var filename = Date.now() + '_' + file.name;
    var savepath = path.resolve(path.join(userDir, filename));
    if (savepath.indexOf(path.resolve(userDir)) !== 0) {
      return res.send({status: 'forbidden'});
    }
    fs.move(file.path, savepath, function (err) {
      if (err) {
        return next(err);
      }
      var url = '/user_data/images/' + uid + '/' + encodeURIComponent(filename);
      res.send({ status: 'success', url: url });
    });
  });
};
