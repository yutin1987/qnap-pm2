$ ->
  el_body = $ 'body'
  el_navbar = $ '#navbar'
  el_viewport = $ '#viewport'
  el_menu = $ '#menu'
  el_login = $ '#login'
  el_mask = $ '#mask'
  el_loading = $ '#loading'

  el_line = $ '.line', el_viewport
  el_album = $ '.album', el_viewport
  el_private = $ '.private', el_viewport
  el_photo = $ '.photo', el_viewport
  el_full = $ '.full', el_viewport

  click_event = if document.documentElement.hasOwnProperty('ontouchstart') then 'touchend' else 'click'

  $.focus = null
  $.full =
    index: 0
    album: null

  usr_temp = null

  $.conf = 
    line: {}
    photo: {}

  cache =
    album: []
    private: []

  status =
    init: 'status-init'
    login: 'status-login'
    viewport: 'status-viewport'
    menu: 'status-menu'
    overview: 'status-overview'
    about: 'status-about'

  $.line = new PhotoList [], {api: API.LINE}
  $.album = new AlbumList
  $.private = new AlbumList({h: 1})
  $.search = new PhotoList
  $.user = new User

  win_width = $(window).width()
  if win_width <= 1024
    mode = 1
  else
    mode = 0

  photo2dom = (photo) ->
    src = PATH+API.THUMB+'?f='+photo.get('id')+'&s='+mode
    thumb = '<div class="thumb" style="background-image: url('+src+')" />'
    img = '<div class="img"><img src="'+src+'" /></div>'
    size = '<div class="size">'+photo.get('width')+'x'+photo.get('height')+'</div>'
    time = '<div class="time">'+new Date(photo.get('time')).toFormat('yyyy-MM-dd')+'</div>'

    return '<div class="item type-'+photo.get('type')+'">' + thumb + img + size + time + '</div>'

  album2dom = (album) ->
    src = PATH+API.THUMB+'?f='+album.get('id')+'&s='+mode
    thumb = '<div class="thumb" style="background-image: url('+src+')" />'
    img = '<div class="img"><img src="'+src+'" /></div>'
    title = '<div class="title">'+album.get('title')+'</div>'
    time = '<div class="time">'+new Date(album.get('time')).toFormat('yyyy-MM-dd')+'</div>'
    length = '<div class="length">'+album.list.length+'</div>'
    personal = '<div class="personal" />'

    return '<div class="item">' + thumb + img + title + time + length + personal + '</div>'

  ###
  Sync
  ###
  sync = () ->
    $.focus?.req()
    setTimeout sync, SYNC_INTERVAL

  sync()

  ###
  Display
  ###

  $.album.on 'add', (m) ->
    item = $ album2dom m
    item.data 'key', m.id
    cache.album.push $('<div class="wrap" />').append(item)

  $.album.on 'reset', () ->
    cache.album = []
    el_album.empty()

  $.private.on 'add', (m) ->
    item = $ album2dom m
    item.data 'key', m.id
    cache.private.push $('<div class="wrap" />').append(item)

  $.private.on 'reset', () ->
    cache.private = []
    el_private.empty()

  ###
  Init
  ###

  $('#version').text VERSION

  $('#username').val $.user.get('usr') || ''
  $('#password').val $.user.get('pwd') || ''

  $('.remember', el_login).addClass('checked') if $.user.get('usr')

  reinit = () ->
    $.conf.line =
      index: 0
      page: 1
      temp_v: null
      temp_h: null
    $.conf.album =
      index: 0
      page: 1
    $.conf.photo =
      index: 0
      page: 1
    
    $.line.reload()
    $('.wrap', el_line).remove()

    $.album.reload()
    $.private.reload()

    $.focus = $.line

  $.req API.USER,
    a: 'login'
  , (res, code) =>
    if code is 1
      el_body.removeClass status.init
      el_body.removeClass status.login
      el_body.addClass status.viewport
      reinit()
    else
      el_body.removeClass status.init
      el_body.addClass status.login
  , (res) ->
      el_body.removeClass status.init
      el_body.addClass status.login

  ###
  Login
  ###
  login_action = (usr, pwd, remember) ->
    el_body.addClass status.init
    $.user.login usr, pwd, (res, err) ->
      el_body.removeClass status.init
      el_login.removeClass 'login-error'
      switch err.code
        when 0
          $.user.set({usr: '', pwd: ''})
          el_login.addClass 'login-error'
        when 1
          el_body.removeClass status.login
          el_body.addClass status.viewport
          $.user.set({usr: usr, pwd: pwd}) if remember
          unless usr_temp? and usr_temp is usr
            reinit()
        when -1
          el_body.addClass status.init
          login_action usr, pwd

  $('#login-submit', el_login).on click_event, () ->
    usr = $('#username').val()
    pwd = $('#password').val()
    remember = $('.remember', el_login).hasClass('checked')
    login_action usr, pwd, remember

  $('#login .remember').on click_event, () ->
    $(@).toggleClass('checked')
  

  ###
  Menu
  ###
  $('.goto-line, .goto-album, .goto-private, .goto-logout, .goto-about', el_menu).on 'click', () ->
    el_body.removeClass status.menu
    el_body.removeClass status.about
    $.focus = null

  $('#menu-toggle').on 'touchstart', (e) ->
    e.preventDefault()
    $(@).addClass 'hover'
  $('#menu-toggle').on click_event, (e) ->
    e.preventDefault()
    $(@).removeClass 'hover'
    el_body.toggleClass status.menu

  $('.goto-line', el_menu).on 'click', () ->
    $.focus = $.line
    el_viewport.attr 'class', 'show-line'
  $('.goto-album', el_menu).on 'click', () ->
    el_viewport.attr 'class', 'show-album'
  $('.goto-private', el_menu).on 'click', () ->
    el_viewport.attr 'class', 'show-private'
  $('.goto-logout', el_menu).on 'click', () ->
    $.user.logout()
    el_body.addClass status.login
  $('.goto-about', el_menu).on 'click', () ->
    el_body.addClass status.about

  $('#mask').on 'click', (e) ->
    el_body.removeClass status.about
    el_body.removeClass status.menu

  ###
  Document Elem
  ###

  ###
  Display Full
  ###
  show_full = (id) ->
    el_body.addClass status.overview
    el_viewport.addClass 'show-full'
    $('.item', el_full).remove()

    item = $ '<div class="item">
                <div class="thumb" style="background-image: url('+PATH+API.THUMB+'?f='+id+'&s='+mode+')"></div>
                <div class="original" style="background-image: url('+PATH+API.PHOTO+'?f='+id+')"></div>
                <img class="listen thumb-listen" src="'+PATH+API.THUMB+'?f='+id+'&s='+mode+'" />
                <img class="listen original-listen" src="'+PATH+API.PHOTO+'?f='+id+'" />
            </div>'

    $('.thumb-listen', item).on 'load', () ->
      $(@).parent().addClass 'thumb-loaded'

    $('.original-listen', item).on 'load', () ->
      $(@).parent().addClass 'original-loaded'

    el_full.append item

    window.scrollTo 0, 1

  $('.prev, .next', el_full).on 'touchstart', (e) ->
    e.preventDefault()
    $(@).addClass 'hover'

  $('.prev, .next', el_full).on click_event, (e) ->
    e.preventDefault()
    $(@).removeClass 'hover'
    return unless $.full.album?

    if $(@).hasClass 'prev'
      return unless $.full.index > 1
      $.full.index--
    else if $(@).hasClass 'next'
      return unless $.full.index < $.full.album.length - 1
      $.full.index++
    else return

    show_full($.full.album.at($.full.index).id)

  # $('#viewport .full').hammer({swipe: off}).on 'dragend' , (e) ->
  #   return unless $.full.album?
    
  #   switch e.direction
  #     when Hammer.LEFT
  #       return unless $.full.index < $.full.album.length - 1
  #       $.full.index++
  #     when Hammer.RIGHT
  #       return unless $.full.index > 1
  #       $.full.index--
  #     else
  #       return

  #   show_full($.full.album.at($.full.index).id)

  # line
  el_line.on 'click', '.item', () ->
    key = $(@).data 'key'
    photo = $.line.get key
    $.full.index = $.line.indexOf photo
    $.full.album = $.line
    show_full photo.id

  $('.prev, .next', el_line).on 'touchstart', (e) ->
    e.preventDefault()
    $(@).addClass 'hover'
    
  $('.prev, .next', el_line).on click_event, (e) ->
    e.preventDefault()
    $(@).removeClass 'hover'
    if $(@).hasClass 'prev'
      return unless $.conf.line.page > 1
      $.conf.line.page--
    else if $(@).hasClass 'next'
      return unless $.conf.line.page < Math.ceil($.line.length / PAGE_COUNT)
      $.conf.line.page++
    else return

    $(el_navbar).addClass 'loading'
    $(el_loading).text 'Page '+$.conf.line.page+' / '+Math.ceil($.line.length / PAGE_COUNT)
    setTimeout () ->
      $(el_navbar).removeClass 'loading'
    , SYNC_INTERVAL * 3

    $('.wrap', el_line).remove()
    $.conf.line.index = ($.conf.line.page - 1) * PAGE_COUNT

  # $('#viewport').hammer({swipe: off}).on 'dragend' , (e) ->
  #   return unless el_viewport.attr('class') is 'show-line'

  #   switch e.direction
  #     when Hammer.LEFT
  #       return unless $.conf.line.page < Math.ceil($.line.length / PAGE_COUNT)
  #       $.conf.line.page++
  #     when Hammer.RIGHT
  #       return unless $.conf.line.page > 1
  #       $.conf.line.page--
  #     else
  #       return

  #   $(el_navbar).addClass 'loading'
  #   $(el_loading).text 'Page '+$.conf.line.page+' / '+Math.ceil($.line.length / PAGE_COUNT)
  #   setTimeout () ->
  #     $(el_navbar).removeClass 'loading'
  #   , SYNC_INTERVAL * 3

  #   $('.wrap', el_line).remove()
  #   $.conf.line.index = ($.conf.line.page - 1) * PAGE_COUNT

  # Album
  el_album.on 'click', ".item", () ->
    key = $(@).data 'key'
    $.conf.photo.index = 0
    $.conf.photo.page = 1
    $.focus = $.album.get(key).list
    $('.wrap', el_photo).remove()
    el_viewport.addClass 'show-photo'

  # Private
  el_private.on 'click', ".item", () ->
    key = $(@).data 'key'
    $.conf.photo.index = 0
    $.conf.photo.page = 1
    $.focus = $.private.get(key).list
    $('.wrap', el_photo).remove()
    el_viewport.addClass 'show-photo'

  # Photo
  $('.back', el_photo).on 'touchstart', (e) ->
    e.preventDefault()
    $(@).addClass 'hover'

  $('.back', el_photo).on click_event, (e) ->
    e.preventDefault()
    $(@).removeClass 'hover'
    $.focus = null
    el_viewport.removeClass 'show-photo'

  $('.prev, .next', el_photo).on 'touchstart', (e) ->
    e.preventDefault()
    $(@).addClass 'hover'
    
  $('.prev, .next', el_photo).on click_event, (e) ->
    e.preventDefault()
    $(@).removeClass 'hover'
    return unless $.focus?.album?

    if $(@).hasClass 'prev'
      return unless $.conf.photo.page > 1
      $.conf.photo.page--
    else if $(@).hasClass 'next'
      return unless $.conf.photo.page < Math.ceil($.focus.length / PAGE_COUNT)
      $.conf.photo.page++
    else return

    $(el_navbar).addClass 'loading'
    $(el_loading).text 'Page '+$.conf.photo.page+' / '+Math.ceil($.focus.length / PAGE_COUNT)
    setTimeout () ->
      $(el_navbar).removeClass 'loading'
    , SYNC_INTERVAL * 3

    $('.wrap', el_photo).remove()
    $.conf.photo.index = ($.conf.photo.page - 1) * PAGE_COUNT

  # $(el_photo).hammer({swipe: off}).on 'dragend' , (e) ->
  #   return unless $.focus?.album?

  #   switch e.direction
  #     when Hammer.LEFT
  #       return unless $.conf.photo.page < Math.ceil($.focus.length / PAGE_COUNT)
  #       $.conf.line.page++
  #     when Hammer.RIGHT
  #       return unless $.conf.photo.page > 1
  #       $.conf.line.page--
  #     else
  #       return

  #   $(el_navbar).addClass 'loading'
  #   $(el_loading).text 'Page '+$.conf.photo.page+' / '+Math.ceil($.focus.length / PAGE_COUNT)
  #   setTimeout () ->
  #     $(el_navbar).removeClass 'loading'
  #   , SYNC_INTERVAL * 3

  #   $('.wrap', el_photo).remove()
  #   $.conf.photo.index = ($.conf.photo.page - 1) * PAGE_COUNT

  el_photo.on 'click', '.item', () ->
    return unless $.focus?
    key = $(@).data 'key'

    photo = $.focus.get key
    $.full.index = $.focus.indexOf photo
    $.full.album = $.focus
    show_full photo.id

  # Full
  $('.back', el_full).on 'touchstart', (e) ->
    e.preventDefault()
    $(@).addClass 'hover'

  $('.back', el_full).on click_event, (e) ->
    e.preventDefault()
    $(@).removeClass 'hover'
    el_viewport.removeClass 'show-full'
    el_body.removeClass status.overview

  ###
  Monitor
  ###
  monitor = ->
    ###
    Print Cache
    ###
    if cache.private.length > 0
      el_private.append cache.private
      cache.private = []

    if cache.album.length > 0
      el_album.append cache.album
      cache.album = []

    if window.scrollY < 1
      window.scrollTo 0, 1

    line_display = []
    line_limit = if $.line.length < $.conf.line.page * PAGE_COUNT then $.line.length else $.conf.line.page * PAGE_COUNT
    while $.conf.line.index < line_limit
      photo = $.line.at $.conf.line.index++
      item = $ photo2dom photo

      width = parseInt photo.get('width')
      height = parseInt photo.get('height')
      ratio = width / height

      $('.img img', item).on 'load', () ->
        $(@).parent().parent().addClass 'loaded'

      if ratio > 1.33
        item.addClass 'lo-horizontal'
        if $.conf.line.temp_h?
          $.conf.line.temp_h.append item
          $.conf.line.temp_h = null
        else
          $.conf.line.temp_h = $('<div class="wrap" />').append(item)
          line_display.push $.conf.line.temp_h
      else if ratio > 0.75
        item.addClass 'lo-filled'
        line_display.push $('<div class="wrap" />').append(item)
      else
        item.addClass 'lo-vertical'
        if $.conf.line.temp_v?
          $.conf.line.temp_v.append item
          $.conf.line.temp_v = null
        else
          $.conf.line.temp_v = $('<div class="wrap" />').append(item)
          line_display.push $.conf.line.temp_v

      item.data 'key', photo.id

      #break if $.conf.line.index % 10 is 0
    el_line.append line_display

    if $.focus?.album is yes
      album = $.focus
      photo_display = []
      photo_limit = if album.length < $.conf.photo.page * PAGE_COUNT then album.length else $.conf.photo.page * PAGE_COUNT
      while $.conf.photo.index < photo_limit
        photo = album.at $.conf.photo.index++
        item = $ photo2dom photo
        item.data 'key', photo.id
        photo_display.push $('<div class="wrap" />').append(item)
        break if $.conf.photo.index % 10 is 0
      el_photo.append photo_display
    setTimeout monitor, SYNC_INTERVAL * 1.2
  monitor()