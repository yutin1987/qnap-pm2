/*
calculate the angle between two points
@param   object  pos1 { x: int, y: int }
@param   object  pos2 { x: int, y: int }
*/
Math.angle = function(pos1, pos2) {
  return Math.atan2(pos2.y - pos1.y, pos2.x - pos1.x) * 180 / Math.PI;
};

/*
calculate the distance between two points
@param   object  pos1 { x: int, y: int }
@param   object  pos2 { x: int, y: int }
*/


Math.distance = function(pos1, pos2) {
  var x, y;

  x = pos2.x - pos1.x;
  y = pos2.y - pos1.y;
  return Math.sqrt((x * x) + (y * y));
};

Math.course = function(pos1, pos2) {
  var angle, distance;

  distance = Math.distance(pos1, pos2);
  angle = Math.ceil(Math.angle(pos1, pos2) / 30);
  return {
    up: distance > 70 && (angle === (-3) || angle === (-4)) ? true : false,
    down: distance > 70 && (angle === 3 || angle === 4) ? true : false,
    left: distance > 70 && (angle === 6 || angle === (-6)) ? true : false,
    right: distance > 70 && (angle === 1 || angle === (-1)) ? true : false
  };
};

$.touch = function(e) {
  var center, t, touch, touchs, _i, _len;

  e = e.originalEvent.changedTouches || e.originalEvent.touches;
  touchs = [];
  center = {
    x: 0,
    y: 0
  };
  for (_i = 0, _len = e.length; _i < _len; _i++) {
    touch = e[_i];
    t = {
      x: touch.pageX,
      y: touch.pageY
    };
    touchs.push(t);
    center.x += t.x;
    center.y += t.y;
  }
  center.x /= e.length || 1;
  center.y /= e.length || 1;
  return {
    touchs: touchs,
    center: center,
    length: touchs.length
  };
};
