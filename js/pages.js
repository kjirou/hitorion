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
