class Photo extends Backbone.Model

class PhotoList extends Backbone.Collection
  model: Photo
  api: null
  album: no
  lock: no
  page: 0
  pageCount: 100
  count: 0
  initialize: (models, opt) ->
    @linkTo(opt.api) if opt?.api?
    @album = yes if opt?.album?
#  comparator: (item) ->
#    return item.get('time')
  req: () ->
    return unless @api? and @lock is no
    @lock = yes
    $.req @api, {p: @page + 1, s:'timeline', sd:'desc'}, (res) =>
      @count = parseInt($('photoCount',res).text())
      list = $('DataList FileItem',res)
      if list.length
        $(list).each (i,item) =>
          @add photo2data item
        @page += 1
        @lock = no unless list.length < @pageCount
    ,(res, err) =>
      @lock = no
  reload: () ->
    @page = 0
    @count = 0
    @lock = no
    @reset()
    @req()
  linkTo: (api) ->
    @api = api