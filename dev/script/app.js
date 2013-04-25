$(function() {
  var album2dom, cache, click_event, el_album, el_body, el_full, el_line, el_loading, el_login, el_mask, el_menu, el_navbar, el_photo, el_private, el_viewport, login_action, mode, monitor, photo2dom, reinit, show_full, status, sync, usr_temp, win_width,
    _this = this;

  el_body = $('body');
  el_navbar = $('#navbar');
  el_viewport = $('#viewport');
  el_menu = $('#menu');
  el_login = $('#login');
  el_mask = $('#mask');
  el_loading = $('#loading');
  el_line = $('.line', el_viewport);
  el_album = $('.album', el_viewport);
  el_private = $('.private', el_viewport);
  el_photo = $('.photo', el_viewport);
  el_full = $('.full', el_viewport);
  click_event = document.documentElement.hasOwnProperty('ontouchstart') ? 'touchend' : 'click';
  $.focus = null;
  $.full = {
    index: 0,
    album: null
  };
  usr_temp = null;
  $.conf = {
    line: {},
    photo: {}
  };
  cache = {
    album: [],
    "private": []
  };
  status = {
    init: 'status-init',
    login: 'status-login',
    viewport: 'status-viewport',
    menu: 'status-menu',
    overview: 'status-overview',
    about: 'status-about'
  };
  $.line = new PhotoList([], {
    api: API.LINE
  });
  $.album = new AlbumList;
  $["private"] = new AlbumList({
    h: 1
  });
  $.search = new PhotoList;
  $.user = new User;
  win_width = $(window).width();
  if (win_width <= 1024) {
    mode = 1;
  } else {
    mode = 0;
  }
  photo2dom = function(photo) {
    var img, size, src, thumb, time;

    src = PATH + API.THUMB + '?f=' + photo.get('id') + '&s=' + mode;
    thumb = '<div class="thumb" style="background-image: url(' + src + ')" />';
    img = '<div class="img"><img src="' + src + '" /></div>';
    size = '<div class="size">' + photo.get('width') + 'x' + photo.get('height') + '</div>';
    time = '<div class="time">' + new Date(photo.get('time')).toFormat('yyyy-MM-dd') + '</div>';
    return '<div class="item type-' + photo.get('type') + '">' + thumb + img + size + time + '</div>';
  };
  album2dom = function(album) {
    var img, length, personal, src, thumb, time, title;

    src = PATH + API.THUMB + '?f=' + album.get('id') + '&s=' + mode;
    thumb = '<div class="thumb" style="background-image: url(' + src + ')" />';
    img = '<div class="img"><img src="' + src + '" /></div>';
    title = '<div class="title">' + album.get('title') + '</div>';
    time = '<div class="time">' + new Date(album.get('time')).toFormat('yyyy-MM-dd') + '</div>';
    length = '<div class="length">' + album.list.length + '</div>';
    personal = '<div class="personal" />';
    return '<div class="item">' + thumb + img + title + time + length + personal + '</div>';
  };
  /*
  Sync
  */

  sync = function() {
    var _ref;

    if ((_ref = $.focus) != null) {
      _ref.req();
    }
    return setTimeout(sync, SYNC_INTERVAL);
  };
  sync();
  /*
  Display
  */

  $.album.on('add', function(m) {
    var item;

    item = $(album2dom(m));
    item.data('key', m.id);
    return cache.album.push($('<div class="wrap" />').append(item));
  });
  $.album.on('reset', function() {
    cache.album = [];
    return el_album.empty();
  });
  $["private"].on('add', function(m) {
    var item;

    item = $(album2dom(m));
    item.data('key', m.id);
    return cache["private"].push($('<div class="wrap" />').append(item));
  });
  $["private"].on('reset', function() {
    cache["private"] = [];
    return el_private.empty();
  });
  /*
  Init
  */

  $('#version').text(VERSION);
  $('#username').val($.user.get('usr') || '');
  $('#password').val($.user.get('pwd') || '');
  if ($.user.get('usr')) {
    $('.remember', el_login).addClass('checked');
  }
  reinit = function() {
    $.conf.line = {
      index: 0,
      page: 1,
      temp_v: null,
      temp_h: null
    };
    $.conf.album = {
      index: 0,
      page: 1
    };
    $.conf.photo = {
      index: 0,
      page: 1
    };
    $.line.reload();
    $('.wrap', el_line).remove();
    $.album.reload();
    $["private"].reload();
    return $.focus = $.line;
  };
  $.req(API.USER, {
    a: 'login'
  }, function(res, code) {
    if (code === 1) {
      el_body.removeClass(status.init);
      el_body.removeClass(status.login);
      el_body.addClass(status.viewport);
      return reinit();
    } else {
      el_body.removeClass(status.init);
      return el_body.addClass(status.login);
    }
  }, function(res) {
    el_body.removeClass(status.init);
    return el_body.addClass(status.login);
  });
  /*
  Login
  */

  login_action = function(usr, pwd, remember) {
    el_body.addClass(status.init);
    return $.user.login(usr, pwd, function(res, err) {
      el_body.removeClass(status.init);
      el_login.removeClass('login-error');
      switch (err.code) {
        case 0:
          $.user.set({
            usr: '',
            pwd: ''
          });
          return el_login.addClass('login-error');
        case 1:
          el_body.removeClass(status.login);
          el_body.addClass(status.viewport);
          if (remember) {
            $.user.set({
              usr: usr,
              pwd: pwd
            });
          }
          if (!((usr_temp != null) && usr_temp === usr)) {
            return reinit();
          }
          break;
        case -1:
          el_body.addClass(status.init);
          return login_action(usr, pwd);
      }
    });
  };
  $('#login-submit', el_login).on(click_event, function() {
    var pwd, remember, usr;

    usr = $('#username').val();
    pwd = $('#password').val();
    remember = $('.remember', el_login).hasClass('checked');
    return login_action(usr, pwd, remember);
  });
  $('#login .remember').on(click_event, function() {
    return $(this).toggleClass('checked');
  });
  /*
  Menu
  */

  $('.goto-line, .goto-album, .goto-private, .goto-logout, .goto-about', el_menu).on('click', function() {
    el_body.removeClass(status.menu);
    el_body.removeClass(status.about);
    return $.focus = null;
  });
  $('#menu-toggle').on('touchstart', function(e) {
    e.preventDefault();
    return $(this).addClass('hover');
  });
  $('#menu-toggle').on(click_event, function(e) {
    e.preventDefault();
    $(this).removeClass('hover');
    return el_body.toggleClass(status.menu);
  });
  $('.goto-line', el_menu).on('click', function() {
    $.focus = $.line;
    return el_viewport.attr('class', 'show-line');
  });
  $('.goto-album', el_menu).on('click', function() {
    return el_viewport.attr('class', 'show-album');
  });
  $('.goto-private', el_menu).on('click', function() {
    return el_viewport.attr('class', 'show-private');
  });
  $('.goto-logout', el_menu).on('click', function() {
    $.user.logout();
    return el_body.addClass(status.login);
  });
  $('.goto-about', el_menu).on('click', function() {
    return el_body.addClass(status.about);
  });
  $('#mask').on('click', function(e) {
    el_body.removeClass(status.about);
    return el_body.removeClass(status.menu);
  });
  /*
  Document Elem
  */

  /*
  Display Full
  */

  show_full = function(id) {
    var item;

    el_body.addClass(status.overview);
    el_viewport.addClass('show-full');
    $('.item', el_full).remove();
    item = $('<div class="item">\
                <div class="thumb" style="background-image: url(' + PATH + API.THUMB + '?f=' + id + '&s=' + mode + ')"></div>\
                <div class="original" style="background-image: url(' + PATH + API.PHOTO + '?f=' + id + ')"></div>\
                <img class="listen thumb-listen" src="' + PATH + API.THUMB + '?f=' + id + '&s=' + mode + '" />\
                <img class="listen original-listen" src="' + PATH + API.PHOTO + '?f=' + id + '" />\
            </div>');
    $('.thumb-listen', item).on('load', function() {
      return $(this).parent().addClass('thumb-loaded');
    });
    $('.original-listen', item).on('load', function() {
      return $(this).parent().addClass('original-loaded');
    });
    el_full.append(item);
    return window.scrollTo(0, 1);
  };
  $('.prev, .next', el_full).on('touchstart', function(e) {
    e.preventDefault();
    return $(this).addClass('hover');
  });
  $('.prev, .next', el_full).on(click_event, function(e) {
    e.preventDefault();
    $(this).removeClass('hover');
    if ($.full.album == null) {
      return;
    }
    if ($(this).hasClass('prev')) {
      if (!($.full.index > 1)) {
        return;
      }
      $.full.index--;
    } else if ($(this).hasClass('next')) {
      if (!($.full.index < $.full.album.length - 1)) {
        return;
      }
      $.full.index++;
    } else {
      return;
    }
    return show_full($.full.album.at($.full.index).id);
  });
  el_line.on('click', '.item', function() {
    var key, photo;

    key = $(this).data('key');
    photo = $.line.get(key);
    $.full.index = $.line.indexOf(photo);
    $.full.album = $.line;
    return show_full(photo.id);
  });
  $('.prev, .next', el_line).on('touchstart', function(e) {
    e.preventDefault();
    return $(this).addClass('hover');
  });
  $('.prev, .next', el_line).on(click_event, function(e) {
    e.preventDefault();
    $(this).removeClass('hover');
    if ($(this).hasClass('prev')) {
      if (!($.conf.line.page > 1)) {
        return;
      }
      $.conf.line.page--;
    } else if ($(this).hasClass('next')) {
      if (!($.conf.line.page < Math.ceil($.line.length / PAGE_COUNT))) {
        return;
      }
      $.conf.line.page++;
    } else {
      return;
    }
    $(el_navbar).addClass('loading');
    $(el_loading).text('Page ' + $.conf.line.page + ' / ' + Math.ceil($.line.length / PAGE_COUNT));
    setTimeout(function() {
      return $(el_navbar).removeClass('loading');
    }, SYNC_INTERVAL * 3);
    $('.wrap', el_line).remove();
    return $.conf.line.index = ($.conf.line.page - 1) * PAGE_COUNT;
  });
  el_album.on('click', ".item", function() {
    var key;

    key = $(this).data('key');
    $.conf.photo.index = 0;
    $.conf.photo.page = 1;
    $.focus = $.album.get(key).list;
    $('.wrap', el_photo).remove();
    return el_viewport.addClass('show-photo');
  });
  el_private.on('click', ".item", function() {
    var key;

    key = $(this).data('key');
    $.conf.photo.index = 0;
    $.conf.photo.page = 1;
    $.focus = $["private"].get(key).list;
    $('.wrap', el_photo).remove();
    return el_viewport.addClass('show-photo');
  });
  $('.back', el_photo).on('touchstart', function(e) {
    e.preventDefault();
    return $(this).addClass('hover');
  });
  $('.back', el_photo).on(click_event, function(e) {
    e.preventDefault();
    $(this).removeClass('hover');
    $.focus = null;
    return el_viewport.removeClass('show-photo');
  });
  $('.prev, .next', el_photo).on('touchstart', function(e) {
    e.preventDefault();
    return $(this).addClass('hover');
  });
  $('.prev, .next', el_photo).on(click_event, function(e) {
    var _ref;

    e.preventDefault();
    $(this).removeClass('hover');
    if (((_ref = $.focus) != null ? _ref.album : void 0) == null) {
      return;
    }
    if ($(this).hasClass('prev')) {
      if (!($.conf.photo.page > 1)) {
        return;
      }
      $.conf.photo.page--;
    } else if ($(this).hasClass('next')) {
      if (!($.conf.photo.page < Math.ceil($.focus.length / PAGE_COUNT))) {
        return;
      }
      $.conf.photo.page++;
    } else {
      return;
    }
    $(el_navbar).addClass('loading');
    $(el_loading).text('Page ' + $.conf.photo.page + ' / ' + Math.ceil($.focus.length / PAGE_COUNT));
    setTimeout(function() {
      return $(el_navbar).removeClass('loading');
    }, SYNC_INTERVAL * 3);
    $('.wrap', el_photo).remove();
    return $.conf.photo.index = ($.conf.photo.page - 1) * PAGE_COUNT;
  });
  el_photo.on('click', '.item', function() {
    var key, photo;

    if ($.focus == null) {
      return;
    }
    key = $(this).data('key');
    photo = $.focus.get(key);
    $.full.index = $.focus.indexOf(photo);
    $.full.album = $.focus;
    return show_full(photo.id);
  });
  $('.back', el_full).on('touchstart', function(e) {
    e.preventDefault();
    return $(this).addClass('hover');
  });
  $('.back', el_full).on(click_event, function(e) {
    e.preventDefault();
    $(this).removeClass('hover');
    el_viewport.removeClass('show-full');
    return el_body.removeClass(status.overview);
  });
  /*
  Monitor
  */

  monitor = function() {
    /*
    Print Cache
    */

    var album, height, item, line_display, line_limit, photo, photo_display, photo_limit, ratio, width, _ref;

    if (cache["private"].length > 0) {
      el_private.append(cache["private"]);
      cache["private"] = [];
    }
    if (cache.album.length > 0) {
      el_album.append(cache.album);
      cache.album = [];
    }
    if (window.scrollY < 1) {
      window.scrollTo(0, 1);
    }
    line_display = [];
    line_limit = $.line.length < $.conf.line.page * PAGE_COUNT ? $.line.length : $.conf.line.page * PAGE_COUNT;
    while ($.conf.line.index < line_limit) {
      photo = $.line.at($.conf.line.index++);
      item = $(photo2dom(photo));
      width = parseInt(photo.get('width'));
      height = parseInt(photo.get('height'));
      ratio = width / height;
      $('.img img', item).on('load', function() {
        return $(this).parent().parent().addClass('loaded');
      });
      if (ratio > 1.33) {
        item.addClass('lo-horizontal');
        if ($.conf.line.temp_h != null) {
          $.conf.line.temp_h.append(item);
          $.conf.line.temp_h = null;
        } else {
          $.conf.line.temp_h = $('<div class="wrap" />').append(item);
          line_display.push($.conf.line.temp_h);
        }
      } else if (ratio > 0.75) {
        item.addClass('lo-filled');
        line_display.push($('<div class="wrap" />').append(item));
      } else {
        item.addClass('lo-vertical');
        if ($.conf.line.temp_v != null) {
          $.conf.line.temp_v.append(item);
          $.conf.line.temp_v = null;
        } else {
          $.conf.line.temp_v = $('<div class="wrap" />').append(item);
          line_display.push($.conf.line.temp_v);
        }
      }
      item.data('key', photo.id);
    }
    el_line.append(line_display);
    if (((_ref = $.focus) != null ? _ref.album : void 0) === true) {
      album = $.focus;
      photo_display = [];
      photo_limit = album.length < $.conf.photo.page * PAGE_COUNT ? album.length : $.conf.photo.page * PAGE_COUNT;
      while ($.conf.photo.index < photo_limit) {
        photo = album.at($.conf.photo.index++);
        item = $(photo2dom(photo));
        item.data('key', photo.id);
        photo_display.push($('<div class="wrap" />').append(item));
        if ($.conf.photo.index % 10 === 0) {
          break;
        }
      }
      el_photo.append(photo_display);
    }
    return setTimeout(monitor, SYNC_INTERVAL * 1.2);
  };
  return monitor();
});
