exports.getTime = function () {
  var date = new Date();

  var time = {
    date: date,
    year: date.getFullYear(),
    month: date.getFullYear() + "-" + (date.getMonth() + 1),
    day: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
    minute: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes()
  };
  return time;
};

exports.formatDate = function (date, friendly) {
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  var hour = date.getHours();
  var minute = date.getMinutes();
  var second = date.getSeconds();

  if (friendly) {
    var now = new Date();
    var mseconds = -(date.getTime() - now.getTime());
    var time_std = [ 1000, 60 * 1000, 60 * 60 * 1000, 24 * 60 * 60 * 1000 ];
    if (mseconds < time_std[3]) {
      if (mseconds > 0 && mseconds < time_std[1]) {
        return Math.floor(mseconds / time_std[0]).toString() + ' 秒前';
      }
      if (mseconds > time_std[1] && mseconds < time_std[2]) {
        return Math.floor(mseconds / time_std[1]).toString() + ' 分钟前';
      }
      if (mseconds > time_std[2]) {
        return Math.floor(mseconds / time_std[2]).toString() + ' 小时前';
      }
    }
  }

  //month = ((month < 10) ? '0' : '') + month;
  //day = ((day < 10) ? '0' : '') + day;
  hour = ((hour < 10) ? '0' : '') + hour;
  minute = ((minute < 10) ? '0' : '') + minute;
  second = ((second < 10) ? '0' : '') + second;

  var thisYear = new Date().getFullYear();
  year = (thisYear === year) ? '' : (year + '-');
  return year + month + '-' + day + ' ' + hour + ':' + minute;
};

exports.replaceReg = function (str) {
  var self = this;
  var qstr = this.chr2Unicode(str);
  var reglist = ['.', '$', '^', '{', '[', '(', '|', ')', '*', '+', '?', '\\', '}', ']'];
  reglist.forEach(function (r, index) {
    reglist[index] = self.chr2Unicode(r);
  });
  var reg = new RegExp(reglist.join('|'), 'g');
  qstr = qstr.replace(reg, function (text) {
    return '5C00' + text;
  });
  return this.unicode2Chr(qstr);
};

exports.unicode2Chr = function (str) {
  if ('' !== str) {
    var st, t, i;
    st = '';
    for (i = 1; i <= str.length / 4; i++) {
      t = str.slice(4 * i - 4, 4 * i - 2);
      t = str.slice(4 * i - 2, 4 * i).concat(t);
      st = st.concat('%u').concat(t);
    }
    st = unescape(st);
    return (st);
  }
  else return ('');
};
//字符转换为unicode
exports.chr2Unicode = function (str) {
  if ('' !== str) {
    var st, t, i;
    st = '';
    for (i = 1; i <= str.length; i++) {
      t = str.charCodeAt(i - 1).toString(16);
      if (t.length < 4) {
        while (t.length < 4) {
          t = '0'.concat(t);
        }
      }
      t = t.slice(2, 4).concat(t.slice(0, 2));
      st = st.concat(t);
    }
    return (st.toUpperCase());
  }
  else {
    return ('');
  }
};

