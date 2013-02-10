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

  cls.prototype.getBodyBox = function(){
    return this._bodyBox;
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

    self._titleView = $('<div>')
      .css({
        position: 'absolute',
        top: 100,
        width: '100%',
        height: 32,
        lineHeight: '32px',
        fontSize: $a.fs(18),
        textAlign: 'center'//,
      })
      .text('- Hitorion -')
      .appendTo(self.getView())
    ;

    self._descView = $('<div>')
      .css({
        position: 'absolute',
        top: 160,
        width: '100%',
        height: 32,
        lineHeight: '16px',
        fontSize: $a.fs(12),
        textAlign: 'center'//,
      })
      .text('The Dominion there is not an enemy')
      .appendTo(self.getView())
    ;

    self._startView = $('<div>')
      .css({
        position: 'absolute',
        top: 250,
        left: 80,
        width: 160,
        height: 45,
        lineHeight: '45px',
        fontSize: $a.fs(15),
        border: '1px solid #000',
        cursor: 'pointer',
        textAlign: 'center'//,
      })
      .on('mousedown', { self:self }, __ONTOUCHBUTTON)
      .text('Start')
      .appendTo(self.getView())
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

    var buttonTop = 80;
    var buttonSize = [120, 60];
    var borderWidth = 1;
    var spacing = 20;
    var stageDataList = $a.Stage.getDataList().sort(function(a, b){
      return a.order - b.order;
    });
    _.each(stageDataList, function(data, idx){

      var frame = $('<div>').css({
        position: 'absolute',
        top: buttonTop + (buttonSize[1] + spacing) * idx - borderWidth,
        left: (self.getWidth() - buttonSize[0]) / 2,
        width: buttonSize[0],
        height: buttonSize[1],
        border: borderWidth + 'px solid #000',
        cursor: 'pointer'//,
      }).on('mousedown', { self:self, stageClassName:data.className }, __ONTOUCHBUTTON);

      var label = $('<div>').css({
        position: 'absolute',
        width: buttonSize[0] / 2,
        height: buttonSize[1],
        lineHeight: buttonSize[1] + 'px',
        fontSize: $a.fs(15),
        textAlign: 'center'//,
      }).text(data.label);

      var scoreHeader = $('<div>').css({
        position: 'absolute',
        left: buttonSize[0] / 2,
        width: buttonSize[0] / 2,
        height: 20,
        lineHeight: '20px',
        fontSize: $a.fs(10),
        textAlign: 'center'//,
      }).text('Score');

      var score = $('<div>').css({
        position: 'absolute',
        top: 20,
        left: buttonSize[0] / 2,
        width: buttonSize[0] / 2,
        height: 40,
        lineHeight: '40px',
        fontSize: $a.fs(18),
        textAlign: 'center'//,
      });

      frame.append(label).append(scoreHeader).append(score);
      self._bodyBox.getView().append(frame);

      self._buttonViews[data.className] = {
        frame: frame,
        label: label,
        scoreHeader: scoreHeader,
        score: score//,
      }
    });

    self._ruleView = $('<div>')
      .css({
        position: 'absolute',
        bottom: 5,
        width: '100%',
        height: 24,
        lineHeight: '12px',
        fontSize: $a.fs(10),
        color: '#666',
        textAlign: 'center'
      })
      .html('3ゲーム行い、それらの勝利点の合計がスコアになります<br />各ゲームは 12/14/16 ターン経過で終了')
      .appendTo(self.getBodyBox().getView())
    ;
  }

  cls.prototype.draw = function(){
    var self = this;
    $a.Page.prototype.draw.apply(this);

    _.each($a.Stage.getData(), function(data, className){
      self._buttonViews[className].score.text(data.score);
    });
  }

  function __ONTOUCHBUTTON(evt){
    var self = evt.data.self;
    var stageClassName = evt.data.stageClassName;

    if (_.indexOf(['BasicStage'], stageClassName) < 0) {
      alert('Sorry, this is not implement');
      return false;
    }

    $a.stage = $a.$stages[stageClassName].create();
    $a.screen.changePage($a.gamePage);
    $a.stage.run();

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
