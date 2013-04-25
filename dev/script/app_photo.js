var Photo, PhotoList, _ref, _ref1,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Photo = (function(_super) {
  __extends(Photo, _super);

  function Photo() {
    _ref = Photo.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  return Photo;

})(Backbone.Model);

PhotoList = (function(_super) {
  __extends(PhotoList, _super);

  function PhotoList() {
    _ref1 = PhotoList.__super__.constructor.apply(this, arguments);
    return _ref1;
  }

  PhotoList.prototype.model = Photo;

  PhotoList.prototype.api = null;

  PhotoList.prototype.album = false;

  PhotoList.prototype.lock = false;

  PhotoList.prototype.page = 0;

  PhotoList.prototype.pageCount = 100;

  PhotoList.prototype.count = 0;

  PhotoList.prototype.initialize = function(models, opt) {
    if ((opt != null ? opt.api : void 0) != null) {
      this.linkTo(opt.api);
    }
    if ((opt != null ? opt.album : void 0) != null) {
      return this.album = true;
    }
  };

  PhotoList.prototype.req = function() {
    var _this = this;

    if (!((this.api != null) && this.lock === false)) {
      return;
    }
    this.lock = true;
    return $.req(this.api, {
      p: this.page + 1,
      s: 'timeline',
      sd: 'desc'
    }, function(res) {
      var list;

      _this.count = parseInt($('photoCount', res).text());
      list = $('DataList FileItem', res);
      if (list.length) {
        $(list).each(function(i, item) {
          return _this.add(photo2data(item));
        });
        _this.page += 1;
        if (!(list.length < _this.pageCount)) {
          return _this.lock = false;
        }
      }
    }, function(res, err) {
      return _this.lock = false;
    });
  };

  PhotoList.prototype.reload = function() {
    this.page = 0;
    this.count = 0;
    this.lock = false;
    this.reset();
    return this.req();
  };

  PhotoList.prototype.linkTo = function(api) {
    return this.api = api;
  };

  return PhotoList;

})(Backbone.Collection);
