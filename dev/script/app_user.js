var User, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

User = (function(_super) {
  __extends(User, _super);

  function User() {
    _ref = User.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  User.prototype.defaults = {
    admin: false,
    sid: null,
    usr: null,
    pwd: null
  };

  User.prototype.initialize = function() {
    var option;

    this.set({
      usr: $.cookies.get('pmusr'),
      pwd: $.cookies.get('pmpwd')
    });
    option = {
      expiresAt: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000)
    };
    return this.on('change', function() {
      var key, val, _ref1, _results;

      _ref1 = this.changed;
      _results = [];
      for (key in _ref1) {
        val = _ref1[key];
        switch (key) {
          case 'usr':
            _results.push($.cookies.set('pmusr', val, option));
            break;
          case 'pwd':
            _results.push($.cookies.set('pmpwd', val, option));
            break;
          default:
            _results.push(void 0);
        }
      }
      return _results;
    });
  };

  User.prototype.login = function(usr, pwd, back) {
    var _this = this;

    return $.req(API.USER, {
      a: 'login',
      u: usr,
      p: Base64.encode(pwd)
    }, function(res, status) {
      var set_data;

      console.log(res);
      console.log(status);
      console.log($('is_admin', res).text());
      set_data = {
        admin: $('is_admin', res).text() ? true : false,
        sid: res.sid
      };
      _this.set(set_data);
      if (status === 1) {
        return typeof back === "function" ? back(set_data, {
          code: 1
        }) : void 0;
      } else {
        return typeof back === "function" ? back(set_data, {
          code: 0,
          msg: 'failed'
        }) : void 0;
      }
    }, function(res) {
      return typeof back === "function" ? back({}, {
        code: -1,
        msg: 'offline'
      }) : void 0;
    });
  };

  User.prototype.logout = function() {
    var _this = this;

    this.set({
      usr: '',
      pwd: ''
    });
    return $.req(API.USER, {
      a: 'logout'
    }, function(res, status) {
      var set_data;

      set_data = {
        admin: false,
        sid: null
      };
      _this.set(set_data);
      if (status === 1) {
        return typeof back === "function" ? back({
          code: 1
        }) : void 0;
      } else {
        return typeof back === "function" ? back({
          code: 0,
          msg: 'failed'
        }) : void 0;
      }
    }, function(res) {
      return typeof back === "function" ? back({
        code: -1,
        msg: 'offline'
      }) : void 0;
    });
  };

  return User;

})(Backbone.Model);
