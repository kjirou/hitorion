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
  CSS_PREFIX: 'dvl-'
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
      $a.statusbar.draw();

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
      $a.statusbar.draw();
      return self._runActionPhase();
    }).then(function(){
      $d('Ended action phase');
      self._currentPhaseType = 'buy';
      $a.statusbar.draw();
      return self._runBuyPhase();
    }).then(function(){
      $d('Ended buy phase');
      self._resetStatuses();
      $a.hand.reset();
      $a.statusbar.draw();
      $a.hand.draw();
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
        $a.statusbar.draw();

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

    var signaler = $.Deferred();
    _.each($a.hand.getCards().getData(), function(card){
      card.setSignaler(signaler);
    });

    // TODO: カードしか選択できないので、
    //       全て行動カードの場合にキャンセル不可
    $.when(signaler).done(function(card){

      if (card.isActable()) {

        $a.hand.throwCard(card);
        $a.statusbar.draw();
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
        $a.statusbar.draw();

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
    var signaler = $.Deferred();
    $a.field.waitChoice(signaler);

    // TODO: 現在購入不可なものを選択するとキャンセルというUIになっている
    $.when(signaler).done(function(card){

      if (card.isBuyable()) {
        $a.game.modifyCoinCorrection(-card.getCost());
        $a.talonCards.addNewCard(card.className, { stack:true });
        $a.statusbar.draw();
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
    cards = cards.concat($a.handCards.getCards().getData())
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
    return _.reduce($a.hand.getCards().getData(), function(memo, card){
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
    self._view.css({
      backgroundColor: '#EEE'
    });
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

    // For signaling mousedown event to outside
    // Deferred object || null
    this._signaler = null;
  }
  $f.inherit(cls, new $f.Sprite(), $f.Sprite);

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

  cls.prototype.setSignaler = function(deferredObject){
    this._signaler = deferredObject;
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
      $a.hand.pullCards(this._card);
    }

    $a.statusbar.draw();
    $a.hand.draw();
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
    if (self._signaler !== null && self._signaler.state() === 'pending') {
      self._signaler.resolve(self);
    }
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

  cls.POS = $a.HandBox.SIZE.slice();
  cls.SIZE = $a.HandBox.SIZE.slice();

  function __INITIALIZE(self){
  }

  cls.prototype.draw = function(){
    var self = this;
    $f.Box.prototype.draw.apply(this);
  }

  cls.create = function(){
    var obj = $f.Box.create.apply(this, arguments);
    __INITIALIZE(obj);
    return obj;
  }

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


//$a.Statusbar = (function(){
////{{{
//  var cls = function(){
//  }
//  $f.inherit(cls, new $f.Sprite(), $f.Sprite);
//
//  cls.POS = [0, 0];
//  cls.SIZE = [$a.Screen.SIZE[0], 32];
//
//  function __INITIALIZE(self){
//    self._view.css({
//      lineHeight: cls.SIZE[1] + 'px',
//      fontSize: $a.fontSize(14),
//      backgroundColor: '#FFF'
//    });
//  }
//
//  cls.prototype.draw = function(){
//    $f.Sprite.prototype.draw.apply(this);
//
//    var t = '';
//    t += $f.format('期間: {0}/{1}', $a.game.getTurn(), $a.game.getMaxTurn());
//    t += $f.format(', 進捗: {0}/{1}', $a.game.summaryScore(), $a.game.getNecessaryScore());
//    t += $f.format(', 行動回数: {0}', $a.game.getActionCount());
//    t += $f.format(', 開発回数: {0}', $a.game.getBuyCount());
//    t += $f.format(', 開発力: {0}', $a.game.getCoin());
//    t += $f.format(', 山札: {0}/{1}', $a.deck.count(), $a.game.getTotalCardCount());
//    var phaseText = ($a.game.getCurrentPhaseType() === 'action')? '行動': '開発';
//    t += $f.format(', フェーズ: {0}', phaseText);
//    this._view.text(t);
//  }
//
//  cls.create = function(){
//    var obj = $f.Sprite.create.apply(this);
//    __INITIALIZE(obj);
//    return obj;
//  };
//
//  return cls;
////}}}
//}());


//$a.Field = (function(){
////{{{
//  var cls = function(){
//    this._cards = $a.Cards.create();
//  }
//  $f.inherit(cls, new $f.Sprite(), $f.Sprite);
//
//  cls.POS = [32, 0];
//  cls.SIZE = [$a.Screen.SIZE[0], 268];
//
//  cls.__SALES_CARDS = [
//    'Score1Card',
//    'Score3Card',
//    'Score6Card',
//    'Coin1Card',
//    'Coin2Card',
//    'Coin3Card',
//    'TechnicalbookCard',
//    //'ReorganizationCard',
//    'ObjectorientedCard',
//    'HealthcontrolCard',
//    'LogicalthinkingCard',
//    'ModularizationCard',
//    'ScalabilityCard',
//    'Senseofresponsibility',
//    'ContinuousintegrationCard'//,
//  ]
//
//  function __INITIALIZE(self){
//
//    self._cards = $a.Cards.create();
//    _.each(cls.__SALES_CARDS, function(cardClassName){
//      self._cards.addNewCard(cardClassName);
//    });
//
//    var coords = $f.squaring($a.Card.SIZE, cls.SIZE, 10);
//    _.each(self._cards.getData(), function(card, idx){
//      card.setPos([
//        coords[idx][0] + 20,
//        coords[idx][1] + 20
//      ]);
//      card.draw();
//      self.getView().append(card.getView());
//    });
//  }
//
//  cls.prototype.getCards = function(){
//    return this._cards;
//  }
//
//  // FIXME: Must standarize to Hand
//  cls.prototype.waitChoice = function(signaler){
//    _.each(this._cards.getData(), function(card){
//      card.setSignaler(signaler);
//    });
//  }
//
//  //cls.prototype.waitChoices = function(signaler){
//  //}
//
//  cls.create = function(){
//    var obj = $f.Sprite.create.apply(this);
//    __INITIALIZE(obj);
//    return obj;
//  };
//
//  return cls;
////}}}
//}());


//$a.Hand = (function(){
////{{{
//  var cls = function(){
//    this._cards = $a.Cards.create();
//  }
//  $f.inherit(cls, new $f.Sprite(), $f.Sprite);
//
//  cls.POS = [330, 20];
//  cls.SIZE = [710, 250];
//
//  function __INITIALIZE(self){
//    self._view.css({
//      backgroundColor: '#e0ffff'
//    });
//  }
//
//  cls.prototype.draw = function(){
//    var self = this;
//    $f.Sprite.prototype.draw.apply(this);
//
//    // FIXME:
//    // 一度手札に入って描画されたカードは、手札から無くなった後も
//    // 非表示でこの要素内に存在し、また手札に入ったら表示している。
//    //
//    // 本来はカードデータと同期させて、全削除と再描画を行うのが良いが
//    // 今回は card をオブジェクトとして使い回す設計であるため、
//    // card._view.remove をしてしまうと、jQueryのイベントが消えてしまう。
//    // そのために、この様な処理にした。
//    //
//    // 別解としては:
//    // a)捨て札や廃棄札用の隠し要素を作り、そこへappendToする
//    //   appendToならイベントは消えない
//    //   ..これが一番良さそう
//    // b)カードをオブジェクトで持たず、クラス名で持つ
//    //   ..何かわかり難くなりそうでNG
//    // c)イベントまで含めてカードの再描画処理をする
//    //   ..これが一番綺麗そうだが、_view再描画は基底クラスに入っているため
//    //     _viewではなくその中に一要素を作ってそれを書き直すことになる
//    this._view.find('.' + $c.CSS_PREFIX + 'card').each(function(i, e){
//      $(e).hide();
//    });
//
//    var coords = $f.squaring($a.Card.SIZE, cls.SIZE, 10);
//    _.each(this._cards.getData(), function(card, idx){
//      card.setPos(coords[idx]);
//      card.draw();
//      card.getView().show();
//      self.getView().append(card.getView());
//    });
//  }
//
//  cls.prototype.getCards = function(){
//    return this._cards;
//  }
//
//  cls.prototype.throwCard = function(card){
//    this._cards.remove(card);
//    $a.talon.stack(card);
//  }
//
//  cls.create = function(){
//    var obj = $f.Sprite.create.apply(this);
//    __INITIALIZE(obj);
//    return obj;
//  };
//
//  return cls;
////}}}
//}());


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

  $a.pagechangerBox = $a.PagechangerBox.create();
  $a.screen.getView().append($a.pagechangerBox.getView());

  $a.handBox.draw();
  $a.kingdomBox.draw();
  $a.othercardsBox.draw();
  $a.mainBox.draw();
  $a.pagechangerBox.draw();
  $a.screen.draw();

//  $a.game.run();

//}}}
}
