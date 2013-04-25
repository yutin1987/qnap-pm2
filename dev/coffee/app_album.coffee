class Album extends Backbone.Model
  count: 0
  initialize: (data) ->
    @list = new PhotoList [], {api: API.PHOTO_LIST + '&a='+data.id, album: yes }

class AlbumList extends Backbone.Collection
  model: Album
  page: 0
  page_count: 100
  watch: null
  data: {}
  initialize: (data = {}) ->
    @data = data
  reload: () ->
    clearTimeout @watch if @watch?
    @page = 0
    @reset()
    @req()
  req: (delay=0) ->
    @data.p = @page + 1
    $.req API.ALBUM_LIST, @data, (res) =>
      list = $('DataList FileItem',res)
      if (list.length)
        $(list).each (i,item) =>
          @add album2data(item)

        @page += 1
        unless list.length < @page_count
          @watch = setTimeout () =>
            @req()
          , 1000
    ,(res, err) =>
      console.log 'error'
      delay += 1 if delay < 5
      @watch = setTimeout () =>
        @req delay
      , delay