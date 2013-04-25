class User extends Backbone.Model
  defaults:
    admin: no
    sid: null
    usr: null
    pwd: null
  initialize: () ->
    @set
      usr: $.cookies.get 'pmusr'
      pwd: $.cookies.get 'pmpwd'

    option = 
      expiresAt: new Date new Date().getTime() + 30 * 24 * 60 * 60 * 1000
    
    @on 'change', () ->
      for key, val of @changed
        switch key
          when 'usr'
            $.cookies.set 'pmusr', val, option
          when 'pwd'
            $.cookies.set 'pmpwd', val, option
    
  login: (usr, pwd, back) ->
    $.req API.USER,
      a: 'login'
      u: usr
      p: Base64.encode pwd
    , (res, status) =>
      console.log res
      console.log status
      console.log $('is_admin', res).text()
      set_data =
        admin: if $('is_admin', res).text() then yes else no
        sid: res.sid
      @set set_data
      if status is 1
        back? set_data, {code: 1}
      else
        back? set_data, {code: 0, msg: 'failed'}
    , (res) ->
        back? {}, {code: -1, msg: 'offline'}
  logout: () ->
    @set
      usr: ''
      pwd: ''
    $.req API.USER,
      a: 'logout'
    , (res,status) =>
      set_data =
        admin: no
        sid: null
      @.set set_data
      if status is 1
        back? {code: 1}
      else
        back? {code: 0, msg: 'failed'}
    , (res) ->
        back? {code: -1, msg: 'offline'}