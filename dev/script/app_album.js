var Album, AlbumList, _ref, _ref1,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Album = (function(_super) {
  __extends(Album, _super);

  function Album() {
    _ref = Album.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  Album.prototype.count = 0;

  Album.prototype.initialize = function(data) {
    return this.list = new PhotoList([], {
      api: API.PHOTO_LIST + '&a=' + data.id,
      album: true
    });
  };

  return Album;

})(Backbone.Model);

AlbumList = (function(_super) {
  __extends(AlbumList, _super);

  function AlbumList() {
    _ref1 = AlbumList.__super__.constructor.apply(this, arguments);
    return _ref1;
  }

  AlbumList.prototype.model = Album;

  AlbumList.prototype.page = 0;

  AlbumList.prototype.page_count = 100;

  AlbumList.prototype.watch = null;

  AlbumList.prototype.data = {};

  AlbumList.prototype.initialize = function(data) {
    if (data == null) {
      data = {};
    }
    return this.data = data;
  };

  AlbumList.prototype.reload = function() {
    if (this.watch != null) {
      clearTimeout(this.watch);
    }
    this.page = 0;
    this.reset();
    return this.req();
  };

  AlbumList.prototype.req = function(delay) {
    var _this = this;

    if (delay == null) {
      delay = 0;
    }
    this.data.p = this.page + 1;
    return $.req(API.ALBUM_LIST, this.data, function(res) {
      var list;

      list = $('DataList FileItem', res);
      if (list.length) {
        $(list).each(function(i, item) {
          return _this.add(album2data(item));
        });
        _this.page += 1;
        if (!(list.length < _this.page_count)) {
          return _this.watch = setTimeout(function() {
            return _this.req();
          }, 1000);
        }
      }
    }, function(res, err) {
      console.log('error');
      if (delay < 5) {
        delay += 1;
      }
      return _this.watch = setTimeout(function() {
        return _this.req(delay);
      }, delay);
    });
  };

  return AlbumList;

})(Backbone.Collection);
