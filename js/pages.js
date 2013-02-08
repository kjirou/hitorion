/** Abstract class */
$a.Page = (function(){
//{{{
  var cls = function(){
  }
  $f.inherit(cls, new $f.Box(), $f.Box);

  cls.POS = [0, 0];
  cls.SIZE = $a.Screen.SIZE.slice();

  function __INITIALIZE(self){
  }

  cls.create = function(){
    var obj = $f.Box.create.apply(this, arguments);
    __INITIALIZE(obj);
    return obj;
  }

  return cls;
//}}}
}());


$a.$pages.TopPage = (function(){
//{{{
  var cls = function(){
  }
  $f.inherit(cls, new $a.Page(), $a.Page);

  function __INITIALIZE(self){

    self._titleView = $('<div />')
      .css({
        position: 'absolute',
        top: 180,
        width: '100%',
        height: 32,
        lineHeight: '32px',
        fontSize: $a.fs(15),
        textAlign: 'center'//,
      })
      .text('- Hitorion -')
      .appendTo(self._view)
    ;

    self._view
      .css({
        backgroundColor: '#EEE',
        cursor: 'pointer'//,
      })
      .on('mousedown', { self:self }, __ONTOUCHSTART)
    ;
  }

  function __ONTOUCHSTART(evt){
    var self = evt.data.self;
    $a.screen.changePage($a.gamePage);
    return false;
  }

  cls.create = function(){
    var obj = $a.Page.create.apply(this, arguments);
    __INITIALIZE(obj);
    return obj;
  }

  return cls;
//}}}
}());


$a.$pages.GamePage = (function(){
//{{{
  var cls = function(){
  }
  $f.inherit(cls, new $a.Page(), $a.Page);

  function __INITIALIZE(self){
  }

  cls.create = function(){
    var obj = $a.Page.create.apply(this, arguments);
    __INITIALIZE(obj);
    return obj;
  }

  return cls;
//}}}
}());
