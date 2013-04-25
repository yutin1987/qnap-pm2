###
calculate the angle between two points
@param   object  pos1 { x: int, y: int }
@param   object  pos2 { x: int, y: int }
###

Math.angle = (pos1, pos2) ->
  Math.atan2(pos2.y - pos1.y, pos2.x - pos1.x) * 180 / Math.PI

###
calculate the distance between two points
@param   object  pos1 { x: int, y: int }
@param   object  pos2 { x: int, y: int }
###
Math.distance = (pos1, pos2) ->
  x = pos2.x - pos1.x
  y = pos2.y - pos1.y
  Math.sqrt((x * x) + (y * y))

Math.course = (pos1, pos2) ->
  distance = Math.distance pos1, pos2
  angle = Math.ceil(Math.angle(pos1, pos2) / 30)
  return {
    up: if distance > 70 and angle in [-3,-4] then yes else no
    down: if distance > 70 and angle in [3,4] then yes else no
    left: if distance > 70 and angle in [6,-6] then yes else no
    right: if distance > 70 and angle in [1,-1] then yes else no
  }

$.touch = (e) ->
  e = e.originalEvent.changedTouches || e.originalEvent.touches
  touchs = []
  center =
    x: 0
    y: 0

  for touch in e
    t =
      x : touch.pageX
      y : touch.pageY
    touchs.push t
    center.x += t.x
    center.y += t.y

  center.x /= e.length || 1
  center.y /= e.length || 1

  return { touchs: touchs, center: center, length: touchs.length}