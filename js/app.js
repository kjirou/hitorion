/**
 * Hitorion
 *
 * @dependency Underscore.js v1.4.4 <http://underscorejs.org/>
 *             jQuery v1.9.1 <http://jquery.com/>
 */
// $ = jQuery, _ = Underscore.js
// $e = Environments, $c = Consts, $a = Application,
// $f = Functions, $d = Debug print
var $e, $c, $a; // $, _, $f, $d are already existed


$e = {
//{{{
    debug: true,
    mediaUrl: '.',
    sfSize: [320, 416]//,
//}}}
};


$c = {
//{{{
  VERSION: '0.0.1',
  CSS_PREFIX: 'htr-'
//}}}
};


$a = {
//{{{
  player: undefined,
  game: undefined,
  kingdomCards: undefined,
  deckCards: undefined,
  talonCards: undefined,
  trashCards: undefined,
  handCards: undefined,
  screen: undefined,
  mainBox: undefined,
  handBox: undefined,
  kingdomBox: undefined,
  othercardsBox: undefined,
  deckCardsBox: undefined,
  talonCardsBox: undefined,
  trashCardsBox: undefined,
  statusBox: undefined,
  pagechangerBox: undefined,

  $cards: {},

  fs: function(px){
    return px;
  }//,
//}}}
};


$a.Player = (function(){
//{{{
  var cls = function(){
  }

  function __INITIALIZE(self){
  }

  cls.create = function(){
    var obj = new this();
    __INITIALIZE(obj);
    return obj;
  }

  return cls;
//}}}
}());


$a.Game = (function(){
//{{{
  var cls = function(){

    this._necessaryVictoryPoints = 25;

    this._turn = 0;
    this._maxTurn = 12;
    /** 'action' || 'buy' */
    this._currentPhaseType = 'action';

    this._actionCount = undefined;
    this._buyCount = undefined;
    this._coinCorrection = undefined;
  }

  function __INITIALIZE(self){
    self._resetStatuses();
  }

  cls.prototype.run = function(){
    var self = this;
    var process = function(){

      self._turn += 1;
      $a.statusBox.draw();

      $.when(self._runTurn()).done(function(){

        if (self.summaryVictoryPoints() >= self._necessaryVictoryPoints) {
          // Victory
          alert('You won!');
          return;
        }

        if (self.getTurn() < self.getMaxTurn()) {
          setTimeout(process, 1);
        } else {
          // Defeat
          alert('You lost..');
          return;
        }

      });
    }
    setTimeout(process, 1);
  }

  cls.prototype._runTurn = function(){
    var self = this;
    var d = $.Deferred();
    $.Deferred().resolve().then(function(){
      self._currentPhaseType = 'action';
      $a.statusBox.draw();
      return self._runActionPhase();
    }).then(function(){
      $d('Ended action phase');
      self._currentPhaseType = 'buy';
      $a.statusBox.draw();
      return self._runBuyPhase();
    }).then(function(){
      $d('Ended buy phase');
      self._resetStatuses();
      $a.handCards.reset();
      $a.statusBox.draw();
      $a.handBox.draw();
      $a.othercardsBox.draw();
      d.resolve();
    });
    return d;
  }

  cls.prototype._runActionPhase = function(){
    var self = this;
    var phaseEnd = $.Deferred();

    var process = function(){
      $.when(
        self._runWaitingActionSelection()
      ).done(function(isDoneAction){

        if (isDoneAction) {
          $a.game.modifyActionCount(-1);
        } else {
          $a.game.setActionCount(0);
        }
        $a.statusBox.draw();

        if ($a.game.getActionCount() > 0) {
          setTimeout(process, 1);
        } else {
          phaseEnd.resolve();
        }

      });
    }
    setTimeout(process, 1);

    return phaseEnd;
  }

  cls.prototype._runWaitingActionSelection = function(){

    var d = $.Deferred();

    var signal = $.Deferred();
    $f.waitChoice($a.handCards.getData(), signal);

    // TODO: カードしか選択できないので、
    //       全て行動カードの場合にキャンセル不可
    $.when(signal).done(function(card){

      if (card.isActable()) {

        $a.handCards.throwCard(card);
        $a.statusBox.draw();
        $a.hand.draw();

        $.when(card.act()).done(function(){
          d.resolve(true);
        });

      } else {
        d.resolve(false);
      }
    });

    return d;
  }

  cls.prototype._runBuyPhase = function(){
    var self = this;
    var phaseEnd = $.Deferred();

    var process = function(){
      $.when(
        self._runWaitingBuySelection()
      ).done(function(isDone){

        if (isDone) {
          $a.game.modifyBuyCount(-1);
        } else {
          $a.game.setBuyCount(0);
        }
        $a.statusBox.draw();

        if ($a.game.getBuyCount() > 0) {
          setTimeout(process, 1);
        } else {
          phaseEnd.resolve();
        }

      });
    }
    setTimeout(process, 1);

    return phaseEnd;
  }

  cls.prototype._runWaitingBuySelection = function(){

    var d = $.Deferred();
    var signal = $.Deferred();
    $f.waitChoice($a.kingdomCards.getData(), signal);

    // TODO: 現在購入不可なものを選択するとキャンセルというUIになっている
    $.when(signal).done(function(card){

      if (card.isBuyable()) {
        $a.game.modifyCoinCorrection(-card.getCost());
        $a.talonCards.addNewCard(card.className, { stack:true });
        $a.statusBox.draw();
        d.resolve(true);
      } else {
        d.resolve(false);
      }
    });

    return d;
  }

  cls.prototype.getTurn = function(){ return this._turn; }
  cls.prototype.getMaxTurn = function(){ return this._maxTurn; }

  cls.prototype.getCurrentPhaseType = function(){ return this._currentPhaseType }

  cls.prototype._mergePlayersCardData = function(){
    var cards = [];
    cards = cards.concat($a.deckCards.getData())
    cards = cards.concat($a.talonCards.getData())
    cards = cards.concat($a.handCards.getData())
    return cards;
  }

  cls.prototype.getTotalCardCount = function(){
    return this._mergePlayersCardData().length;
  }

  cls.prototype.summaryVictoryPoints = function(){
    return _.reduce(this._mergePlayersCardData(), function(memo, card){
      return memo + card.getVictoryPoints();
    }, 0);
  }
  cls.prototype.getNecessaryVictoryPoints = function(){ return this._necessaryVictoryPoints; }

  cls.prototype._resetStatuses = function(){
    this._actionCount = 1;
    this._buyCount = 1;
    this._coinCorrection = 0;
  }

  cls.prototype.getActionCount = function(){ return this._actionCount; }
  cls.prototype.setActionCount = function(value){ this._actionCount = value; }
  cls.prototype.modifyActionCount = function(value){ this._actionCount += value; }

  cls.prototype.getBuyCount = function(){ return this._buyCount; }
  cls.prototype.setBuyCount = function(value){ this._buyCount = value; }
  cls.prototype.modifyBuyCount = function(value){ this._buyCount += value; }

  cls.prototype.getCoin = function(){
    return this.summaryCoin() + this._coinCorrection;
  }
  cls.prototype.summaryCoin = function(){
    return _.reduce($a.handCards.getData(), function(memo, card){
      return memo + card.getCoin();
    }, 0);
  }
  cls.prototype.modifyCoinCorrection = function(value){ this._coinCorrection += value; }

  cls.create = function(){
    var obj = new this();
    __INITIALIZE(obj);
    return obj;
  }

  return cls;
//}}}
}());


$a.Cards = (function(){
//{{{
  var cls = function(){
    this._cards = [];
  }

  function __INITIALIZE(self){
  }

  cls.prototype.getData = function(){
    return this._cards;
  }

  cls.prototype.addNewCard = function(cardClassName, options){
    var opts = _.extend({
      stack: false
    }, options || {});

    var card = $a.$cards[cardClassName].create();
    if (opts.stack) {
      this._cards.unshift(card);
    } else {
      this._cards.push(card);
    }
  }

  cls.prototype.add = function(card){
    this._cards.push(card);
  }

  cls.prototype.stack = function(card){
    this._cards.unshift(card);
  }

  cls.prototype.pop = function(){
    return this._cards.pop();
  }

  cls.prototype.remove = function(card){
    var idx = _.indexOf(this._cards, card);
    if (idx < 0) {
      throw Error('Cards.remove: Invalid situation');
    }
    this._cards.splice(idx, 1);
  }

  cls.prototype.shuffle = function(){
    this._cards = _.shuffle(this._cards);
  }

  cls.prototype.count = function(){
    return this._cards.length;
  }

  cls.prototype.dealTo = function(cards, count){
    var self = this;
    _.times(count, function(){
      var card = self.pop();
      cards.add(card);
    });
  }

  cls.prototype.dumpTo = function(cards){
    var self = this;
    var copiedCards = this._cards.slice(); // For index change by removing
    _.each(copiedCards, function(card){
      self.remove(card);
      cards.stack(card);
    });
  }

  cls.create = function(){
    var obj = new this();
    __INITIALIZE(obj);
    return obj;
  }

  return cls;
//}}}
}());


$a.KingdomCards = (function(){
//{{{
  var cls = function(){}
  $f.inherit(cls, new $a.Cards(), $a.Cards);

  cls.__FIXED_CARDS = [
    'Coin1Card', 'Coin2Card', 'Coin3Card',
    'Victorypoints1Card', 'Victorypoints3Card', 'Victorypoints6Card'//,
  ];

  cls.prototype._choice = function(){
    var choices = cls.__FIXED_CARDS.slice();
    return choices;
  }

  cls.prototype.reset = function(){
    var self = this;
    _.each(this._choice(), function(cardClassName){
      self.addNewCard(cardClassName);
    });
  }

  return cls;
//}}}
}());


$a.DeckCards = (function(){
//{{{
  var cls = function(){}
  $f.inherit(cls, new $a.Cards(), $a.Cards);

  cls.__DEFAULT_CARDS = [
    'Coin1Card', 'Coin1Card', 'Coin1Card', 'Coin1Card', 'Coin1Card', 'Coin1Card', 'Coin1Card',
    'Victorypoints1Card', 'Victorypoints1Card', 'Victorypoints1Card'//,
  ];

  cls.prototype.reset = function(){
    var self = this;
    _.each(cls.__DEFAULT_CARDS, function(cardClassName){
      self.addNewCard(cardClassName);
    });
    this.shuffle();
  }

  return cls;
//}}}
}());


$a.HandCards = (function(){
//{{{
  var cls = function(){}
  $f.inherit(cls, new $a.Cards(), $a.Cards);

  cls.prototype.pullCards = function(cardCount){
    if ($a.deckCards.count() < cardCount) {
      $a.talonCards.shuffle();
      $a.talonCards.dealTo($a.deckCards, $a.talonCards.count());
    }
    $a.deckCards.dealTo(this, cardCount);
  }

  cls.prototype.throwCard = function(card){
    this.remove(card);
    $a.talonCards.stack(card);
  }

  cls.prototype.reset = function(){
    this.dumpTo($a.talonCards);
    this.pullCards(5);
  }

  return cls;
//}}}
}());


$a.Screen = (function(){
//{{{
  var cls = function(){
  }
  $f.inherit(cls, new $f.Sprite(), $f.Sprite);

  cls.ZINDEXES = {
  }

  cls.POS = [0, 0];
  cls.SIZE = $e.sfSize.slice(); // Must sync to CSS

  function __INITIALIZE(self){
  }

  cls.create = function(){
    var obj = $f.Sprite.create.apply(this);
    __INITIALIZE(obj);
    return obj;
  }

  return cls;
//}}}
}());


$a.Card = (function(){
//{{{
  var cls = function(){
    /** Array of 'victory', 'treasure', 'action', 'reaction', 'attack'.
      Currently used 'victory' or 'treasure' or 'action', and always only one. */
    this._cardTypes = undefined;

    this._title = undefined;
    this._description = null;
    this._cost = 0;
    this._victoryPoints = 0;
    this._card = 0;
    this._actionCount = 0;
    this._buyCount = 0;
    this._coinCorrection = 0;
    this._coin = 0;

    this.className = undefined;
  }
  $f.inherit(cls, new $f.Sprite(), $f.Sprite);
  $f.mixin(cls, new $f.SignalableMixin());

  cls.POS = [0, 0];
  cls.SIZE = [60, 60];

  function __INITIALIZE(self){

    self.className = $f.getMyName($a.$cards, self.__myClass__);

    self._view
      .addClass($c.CSS_PREFIX + 'card')
      .css({ cursor:'pointer' })
      .on('mousedown', {self:self}, __ONMOUSEDOWN);

    self._titleView = $('<div />').css({
      width: cls.SIZE[0],
      height: 40,
      fontSize: $a.fs(10),
      lineHeight: '40px',
      textAlign: 'center'//,
    }).appendTo(self._view);

    self._costView = $('<div />').css({
      width: cls.SIZE[0],
      height: 20,
      fontSize: $a.fs(10),
      lineHeight: '20px',
      textAlign: 'center'//,
    }).appendTo(self._view);
  }

  cls.prototype.draw = function(){
    $f.Sprite.prototype.draw.apply(this);

    var bgColor;
    if (this.getCardType() === 'victory') {
      bgColor = '#76bc75';
    } else if (this.getCardType() === 'treasure') {
      bgColor = '#f9ca58';
    } else if (this.getCardType() === 'action') {
      bgColor = '#839c9d';
    }

    this._titleView.text(this._title);

    this._costView.text(this._cost + ' cost');

    this._view.css({
      backgroundColor: bgColor
    });
  }

  /**
   * null = It is not actable.
   * func = Custom action.
   *        It must return resolved deferred, if it include async process.
   */
  cls.prototype._act = null;

  cls.prototype.act = function(){
    return this._act() || $.Deferred().resolve();
  }

  cls.prototype.isActable = function(){
    return this._act !== null;
  }

  cls.prototype._actBuffing = function(){

    $a.game.modifyActionCount(this._actionCount);
    $a.game.modifyBuyCount(this._buyCount);
    $a.game.modifyCoinCorrection(this._coinCorrection);
    if (this._card > 0) {
      $a.handCardsd.pullCards(this._card);
    }

    $a.statusBox.draw();
    $a.handBox.draw();
  }

  cls.prototype.getCardType = function(){
    // Card types are currently always only one
    return this._cardTypes[0];
  }

  cls.prototype.getCost = function(){ return this._cost; }
  cls.prototype.getVictoryPoints = function(){ return this._victoryPoints; }
  cls.prototype.getCoin = function(){ return this._coin; }

  cls.prototype.isBuyable = function(){
    return this._cost <= $a.game.getCoin();
  }

  function __ONMOUSEDOWN(evt){
    var self = evt.data.self;
    self.triggerSignal();
    return false;
  }

  cls.create = function(){
    var obj = $f.Sprite.create.apply(this);
    __INITIALIZE(obj);
    return obj;
  };

  return cls;
//}}}
}());


$a.MainBox = (function(){
//{{{
  var cls = function(){
    this._pages = {
      hand: undefined,
      kingdom: undefined,
      othercards: undefined//,
    };
    this._currentPageKey = 'hand';
  }
  $f.inherit(cls, new $f.Box(), $f.Box);

  cls.POS = [48, 0];
  cls.SIZE = [320, 320];

  function __INITIALIZE(self){
    self._view.css({
      backgroundColor: '#FFF'
    });
  }

  cls.prototype.draw = function(){
    $f.Box.prototype.draw.apply(this);
    this._drawChangePage();
  }

  cls.prototype.setPage = function(pageKey, box){
    this._pages[pageKey] = box;
  }

  cls.prototype.changePage = function(pageKey){
    this._currentPageKey = pageKey;
    this._drawChangePage();
  }

  cls.prototype._drawChangePage = function(){
    var self = this;
    _.each(this._pages, function(v, k){
      if (self._currentPageKey === k) {
        v.getView().show();
      } else {
        v.getView().hide();
      }
    });
  }

  cls.prototype.getCurrentPageKey = function(){
    return this._currentPageKey;
  }

  cls.create = function(){
    var obj = $f.Box.create.apply(this, arguments);
    __INITIALIZE(obj);
    return obj;
  }

  return cls;
//}}}
}());


$a.HandBox = (function(){
//{{{
  var cls = function(){
  }
  $f.inherit(cls, new $f.Box(), $f.Box);

  cls.POS = [4, 4];
  cls.SIZE = [312, 312]; // 60 * 5 + 3 * 4

  function __INITIALIZE(self){
  }

  cls.prototype.draw = function(){
    var self = this;
    $f.Box.prototype.draw.apply(this);

    // FIXME:
    // 一度手札に入って描画されたカードは、手札から無くなった後も
    // 非表示でこの要素内に存在し、また手札に入ったら表示している。
    //
    // 本来はカードデータと同期させて、全削除と再描画を行うのが良いが
    // 今回は card をオブジェクトとして使い回す設計であるため、
    // card._view.remove をしてしまうと、jQueryのイベントが消えてしまう。
    // そのために、この様な処理にした。
    //
    // 別解としては:
    // a)捨て札や廃棄札用の隠し要素を作り、そこへappendToする
    //   appendToならイベントは消えない
    //   ..これが一番良さそう
    // b)カードをオブジェクトで持たず、クラス名で持つ
    //   ..何かわかり難くなりそうでNG
    // c)イベントまで含めてカードの再描画処理をする
    //   ..これが一番綺麗そうだが、_view再描画は基底クラスに入っているため
    //     _viewではなくその中に一要素を作ってそれを書き直すことになる
    this._view.find('.' + $c.CSS_PREFIX + 'card').each(function(i, e){
      $(e).hide();
    });

    var coords = $f.squaring([60, 60], cls.SIZE, 3);
    _.each($a.handCards.getData(), function(card, idx){
      card.setPos(coords[idx]);
      card.draw();
      card.getView().show();
      self.getView().append(card.getView());
    });
  }

  cls.create = function(){
    var obj = $f.Box.create.apply(this, arguments);
    __INITIALIZE(obj);
    return obj;
  }

  return cls;
//}}}
}());


$a.KingdomBox = (function(){
//{{{
  var cls = function(){
  }
  $f.inherit(cls, new $f.Box(), $f.Box);

  cls.POS = $a.HandBox.POS.slice();
  cls.SIZE = $a.HandBox.SIZE.slice();

  function __INITIALIZE(self){
  }

  cls.prototype.draw = function(){
    var self = this;
    $f.Box.prototype.draw.apply(this);

    var coords = $f.squaring([60, 60], cls.SIZE, 3);
    _.each($a.kingdomCards.getData(), function(card, idx){
      card.setPos(coords[idx]);
      card.draw();
      card.getView().show();
      self.getView().append(card.getView());
    });
  }

  cls.create = function(){
    var obj = $f.Box.create.apply(this, arguments);
    __INITIALIZE(obj);
    return obj;
  }

  return cls;
//}}}
}());


$a.OthercardsBox = (function(){
//{{{
  var cls = function(){
  }
  $f.inherit(cls, new $f.Box(), $f.Box);

  cls.POS = $a.HandBox.POS.slice();
  cls.SIZE = $a.HandBox.SIZE.slice();

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


/** Abstract */
$a.CardsBox = (function(){
//{{{
  var cls = function(){
    this._titleView = undefined;
    this._counterView = undefined;
    this._cardContainerView = undefined;
  }
  $f.inherit(cls, new $f.Box(), $f.Box);

  cls.POS = [0, 0];
  cls.SIZE = [120, 60];
  cls.FRAME_BORDER_WIDTH = 1;

  function __INITIALIZE(self){
    self._view.css({
      border: cls.FRAME_BORDER_WIDTH + 'px solid #AAA'//,
    });
    self._titleView = $('<div />')
      .css({
        position: 'absolute',
        width: 60,
        height: 30,
        lineHeight: '30px',
        fontSize: $a.fs(15),
        textAlign: 'center'//,
      })
      .appendTo(self._view)
    ;
    self._counterView = $('<div />')
      .css({
        position: 'absolute',
        top: 30,
        width: 60,
        height: 30,
        lineHeight: '30px',
        fontSize: $a.fs(15),
        textAlign: 'center'//,
      })
      .appendTo(self._view)
    ;
    self._cardContainerView = $('<div />')
      .css({
        position: 'absolute',
        left: 60,
        width: 60,
        height: 60//,
      })
      .appendTo(self._view)
    ;
  }

  cls.create = function(){
    var obj = $f.Box.create.apply(this, arguments);
    __INITIALIZE(obj);
    return obj;
  }

  return cls;
//}}}
}());


$a.DeckCardsBox = (function(){
//{{{
  var cls = function(){}
  $f.inherit(cls, new $a.CardsBox(), $a.CardsBox);

  cls.POS = [
    50 - cls.FRAME_BORDER_WIDTH,
    100 - cls.FRAME_BORDER_WIDTH
  ];
  cls.SIZE = [120, 60];

  cls.prototype.draw = function(){
    var self = this;
    $a.CardsBox.prototype.draw.apply(this);

    this._titleView.text('山札');
    this._counterView.text($a.deckCards.count());

    // TODO: Display card object
  }

  return cls;
//}}}
}());


$a.TalonCardsBox = (function(){
//{{{
  var cls = function(){}
  $f.inherit(cls, new $a.CardsBox(), $a.CardsBox);

  cls.POS = [
    130 - cls.FRAME_BORDER_WIDTH,
    100 - cls.FRAME_BORDER_WIDTH
  ];
  cls.SIZE = [120, 60];

  cls.prototype.draw = function(){
    var self = this;
    $a.CardsBox.prototype.draw.apply(this);

    this._titleView.text('捨札');
    this._counterView.text($a.talonCards.count());

    // TODO: Display card object
  }

  return cls;
//}}}
}());


$a.TrashCardsBox = (function(){
//{{{
  var cls = function(){}
  $f.inherit(cls, new $a.CardsBox(), $a.CardsBox);

  cls.POS = [
    210 - cls.FRAME_BORDER_WIDTH,
    100 - cls.FRAME_BORDER_WIDTH
  ];
  cls.SIZE = [120, 60];

  cls.prototype.draw = function(){
    var self = this;
    $a.CardsBox.prototype.draw.apply(this);

    this._titleView.text('廃棄');
    this._counterView.text($a.trashCards.count());

    // TODO: Display card object
  }

  return cls;
//}}}
}());


$a.StatusBox = (function(){
//{{{
  var cls = function(){
    this._stateViews = {};
  }
  $f.inherit(cls, new $f.Box(), $f.Box);

  cls.POS = [0, 0];
  cls.SIZE = [$a.Screen.SIZE[0], 48];

  function __INITIALIZE(self){
    self._view.css({
      backgroundColor: '#EEE'
    });

    var stateDataList = [
      ['turn', 'Turn'],
      ['victorypoints', 'VP'],
      ['action', 'Action'],
      ['buy', 'Buy'],
      ['coin', 'Coin']//,
    ];
    _.each(stateDataList, function(data, idx){
      var stateKey = data[0];
      var headerLabel = data[1];
      var view = self._createStateView();
      view.css({
        top: 4,
        left: 6 + (60 + 3) * idx//,
      });
      view._stateHeaderView.text(headerLabel);
      self._view.append(view);
      self._stateViews[stateKey] = view;
    });
  }

  cls.prototype._createStateView = function(){
    var width = 60;
    var frame = $('<div />')
      .css({
        position: 'absolute',
        width: width,
        height: 40,
        textAlign: 'center'//,
      });
    var header = $('<div />')
      .css({
        position: 'absolute',
        width: width,
        height: 12,
        lineHeight: '12px',
        fontSize: $a.fs(10)//,
      });
    var body = $('<div />')
      .css({
        position: 'absolute',
        top: 12,
        width: width,
        height: 28,
        lineHeight: '28px',
        fontSize: $a.fs(15)//,
      });

    // FIXME: Add properties to jQuery object
    frame._stateHeaderView = header;
    frame._stateBodyView = body;

    return frame.append(header).append(body);
  }

  cls.prototype.draw = function(){
    $f.Box.prototype.draw.apply(this);

    this._stateViews.turn._stateBodyView.text(
      $a.game.getTurn() + '/' + $a.game.getMaxTurn()
    );
    this._stateViews.victorypoints._stateBodyView.text(
      $a.game.summaryVictoryPoints() + '/'  + $a.game.getNecessaryVictoryPoints()
    );
    this._stateViews.action._stateBodyView.text(
      $a.game.getActionCount()
    );
    this._stateViews.buy._stateBodyView.text(
      $a.game.getBuyCount()
    );
    this._stateViews.coin._stateBodyView.text(
      $a.game.getCoin()
    );
  }

  cls.create = function(){
    var obj = $f.Box.create.apply(this, arguments);
    __INITIALIZE(obj);
    return obj;
  };

  return cls;
//}}}
}());


$a.PagechangerBox = (function(){
//{{{
  var cls = function(){
    this._buttonViews = {};
  }
  $f.inherit(cls, new $f.Box(), $f.Box);

  cls.POS = [368, 0];  // 48 + 320
  cls.SIZE = [$a.Screen.SIZE[0], 48];

  function __INITIALIZE(self){

    // All buttonKeys equal MainBox._pages keys,
    //   but it is out of specification.
    var buttonDataList = [
      ['hand', '手札'],
      ['kingdom', '購入'],
      ['othercards', '山札/捨札']//,
    ];
    _.each(buttonDataList, function(data, idx){
      var buttonKey = data[0];
      var buttonLabel = data[1];
      var view = self._createButtonView()
        .css({
          top: 4,
          left: 4 + (100 + 6) * idx//,
        })
        .on('mousedown', {self:self, buttonKey:buttonKey}, __ONBUTTONTOUCH)
        .text(buttonLabel)
        .appendTo(self._view);
      self._buttonViews[buttonKey] = view;
    });

  }

  cls.prototype._createButtonView = function(){
    return $('<div />')
      .css({
        position: 'absolute',
        width: 100,
        height: 40,
        lineHeight: '40px',
        fontSize: $a.fs(15),
        backgroundColor: '#AAA',
        cursor: 'pointer',
        textAlign: 'center'//,
      });
  }

  cls.prototype.draw = function(){
    var self = this;
    $f.Box.prototype.draw.apply(this);

    _.each(self._buttonViews, function(buttonView, buttonKey){
      if (
        buttonKey === 'hand' && $a.mainBox.getCurrentPageKey() === 'hand' ||
        buttonKey === 'kingdom' && $a.mainBox.getCurrentPageKey() === 'kingdom' ||
        buttonKey === 'othercards' && $a.mainBox.getCurrentPageKey() === 'othercards'
      ) {
        buttonView.css({ color:'#FF9900' });
      } else {
        buttonView.css({ color:'#FFF' });
      }
    });
  }

  function __ONBUTTONTOUCH(evt){
    var self = evt.data.self;
    var buttonKey = evt.data.buttonKey;

    if (buttonKey === 'hand') {
      $a.mainBox.changePage('hand');
    } else if (buttonKey === 'kingdom') {
      $a.mainBox.changePage('kingdom');
    } else if (buttonKey === 'othercards') {
      $a.mainBox.changePage('othercards');
    }
    self.draw();

    return false;
  }

  cls.create = function(){
    var obj = $f.Box.create.apply(this, arguments);
    __INITIALIZE(obj);
    return obj;
  }

  return cls;
//}}}
}());


$a.init = function(){
//{{{

  $a.player = $a.Player.create();
  $a.game = $a.Game.create();


  $a.kingdomCards = $a.KingdomCards.create();
  $a.kingdomCards.reset();

  $a.deckCards = $a.DeckCards.create();
  $a.deckCards.reset();

  $a.talonCards = $a.Cards.create();

  $a.trashCards = $a.Cards.create();

  $a.handCards = $a.HandCards.create();
  $a.handCards.reset();


  $a.screen = $a.Screen.create();
  $('#game_container').append($a.screen.getView());

  $a.mainBox = $a.MainBox.create();
  $a.screen.getView().append($a.mainBox.getView());

  $a.handBox = $a.HandBox.create();
  $a.mainBox.setPage('hand', $a.handBox);
  $a.mainBox.getView().append($a.handBox.getView());

  $a.kingdomBox = $a.KingdomBox.create();
  $a.mainBox.setPage('kingdom', $a.kingdomBox);
  $a.mainBox.getView().append($a.kingdomBox.getView());

  $a.othercardsBox = $a.OthercardsBox.create();
  $a.mainBox.setPage('othercards', $a.othercardsBox);
  $a.mainBox.getView().append($a.othercardsBox.getView());

  $a.deckCardsBox = $a.DeckCardsBox.create();
  $a.othercardsBox.getView().append($a.deckCardsBox.getView());

  $a.talonCardsBox = $a.TalonCardsBox.create();
  $a.othercardsBox.getView().append($a.talonCardsBox.getView());

  $a.trashCardsBox = $a.TrashCardsBox.create();
  $a.othercardsBox.getView().append($a.trashCardsBox.getView());

  $a.pagechangerBox = $a.PagechangerBox.create();
  $a.screen.getView().append($a.pagechangerBox.getView());

  $a.statusBox = $a.StatusBox.create();
  $a.screen.getView().append($a.statusBox.getView());

  $a.handBox.draw();
  $a.kingdomBox.draw();
  $a.othercardsBox.draw();
  $a.deckCardsBox.draw();
  $a.talonCardsBox.draw();
  $a.trashCardsBox.draw();
  $a.mainBox.draw();
  $a.pagechangerBox.draw();
  $a.statusBox.draw();
  $a.screen.draw();


  $a.game.run();

//}}}
}
