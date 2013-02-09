/** Abstract class */
$a.Page = (function(){
//{{{
  var cls = function(){

    this._bodyBox = null;

    this.hasNavigator = false;
  }
  $f.inherit(cls, new $f.Box(), $f.Box);

  cls.POS = [0, 0];
  cls.SIZE = $a.Screen.SIZE.slice();

  function __INITIALIZE(self){
  }

  cls.prototype._setBodyBox = function(){
    this._bodyBox = $f.Box.create();
    this._bodyBox.setSize([
      cls.SIZE[0],
      cls.SIZE[1] - $a.Navigator.SIZE[1]
    ]);
    this.getView().append(this._bodyBox.getView());
  }

  cls.prototype._createTitleView = function(){
    return $('<div>').css({
      position: 'absolute',
      width: this.getWidth(),
      height: 48,
      lineHeight: '48px',
      fontSize: $a.fs(15),
      textAlign: 'center'//,
    });
  }

  cls.prototype.draw = function(){
    $f.Box.prototype.draw.apply(this);
    if (this._bodyBox !== null) {
      this._bodyBox.draw();
    }
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
      .on('mousedown', { self:self }, __ONTOUCHBUTTON)
    ;
  }

  function __ONTOUCHBUTTON(evt){
    var self = evt.data.self;
    $a.screen.changePage($a.stageselectionPage);
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


$a.$pages.StageselectionPage = (function(){
//{{{
  var cls = function(){
    this.hasNavigator = true;

    this._buttonViews = {};
  }
  $f.inherit(cls, new $a.Page(), $a.Page);

  function __INITIALIZE(self){

    self._setBodyBox();

    self._titleView = self._createTitleView()
      .text('- Stage selection -')
      .appendTo(self.getView());

    var buttonTop = 90;
    var buttonSize = [120, 60];
    var borderWidth = 1;
    var spacing = 20;
    var buttonDataList = [
      ['basic', '基本'],
      ['intrigue', '陰謀'],
      ['seaside', '海辺']//,
    ];
    _.each(buttonDataList, function(data, idx){
      var buttonKey = data[0];
      var buttonLabel = data[1];

      var frame = $('<div>').css({
        position: 'absolute',
        top: buttonTop + (buttonSize[1] + spacing) * idx - borderWidth,
        left: (self.getWidth() - buttonSize[0]) / 2,
        width: buttonSize[0],
        height: buttonSize[1],
        border: borderWidth + 'px solid #000',
        cursor: 'pointer'//,
      }).on('mousedown', { self:self, buttonKey:buttonKey }, __ONTOUCHBUTTON);

      var label = $('<div>').css({
        position: 'absolute',
        width: buttonSize[0] / 2,
        height: buttonSize[1],
        lineHeight: buttonSize[1] + 'px',
        fontSize: $a.fs(15),
        textAlign: 'center'//,
      }).text(buttonLabel);

      var scoreHeader = $('<div>').css({
        position: 'absolute',
        left: buttonSize[0] / 2,
        width: buttonSize[0] / 2,
        height: 20,
        lineHeight: '20px',
        fontSize: $a.fs(10),
        textAlign: 'center'//,
      }).text('Score');

      var score = $('<div>');

      frame.append(label).append(scoreHeader).append(score);
      self._bodyBox.getView().append(frame);

      self._buttonViews[buttonKey] = {
        frame: frame,
        label: label,
        scoreHeader: scoreHeader,
        score: score//,
      }
    });
  }

  function __ONTOUCHBUTTON(evt){
    var self = evt.data.self;
    var buttonKey = evt.data.buttonKey;

    if (_.indexOf(['basic'], buttonKey) < 0) {
      alert('Sorry, this is not implement');
      return false;
    }

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
