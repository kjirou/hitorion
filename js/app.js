/**
 * Hitorion
 *
 * @dependency Underscore.js v1.4.4 <http://underscorejs.org/>
 *             jQuery v1.9.1 <http://jquery.com/>
 */
// $ = jQuery, _ = Underscore.js
// $e = Environments, $c = Consts, $a = Application,
// $f = Functions, $d = Debug print
var $c, $a; // $, _, $f, $d, $e are already existed


$c = {
//{{{
  VERSION: '0.0.1',
  CSS_PREFIX: 'htr-',
  SF_SIZE: [320, 416]//,
//}}}
};


$a = {
//{{{
  player: undefined,
  game: null,
  stage: null,
  topPage: undefined,
  stageselectionPage: undefined,
  gamePage: undefined,
  kingdomCards: null,
  deckCards: null,
  talonCards: null,
  trashCards: null,
  handCards: null,
  screen: undefined,
  pages: [],
  navigator: undefined,
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
  $pages: {},
  $stages: {},

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
    $a.Stage.initializeData(self._getStorage('stage') || {});
  }

  cls.prototype._getStorage = function(itemKey){
    var item = localStorage.getItem(itemKey);
    if (item === null) return null;
    return JSON.parse(item);
  }

  cls.prototype._saveStorage = function(itemKey, rawObject){
    localStorage.setItem(itemKey, JSON.stringify(rawObject))
  }

  cls.prototype.saveStageData = function(){
    var cleanedData = {};
    _.each($a.Stage.getData(), function(data, className){
      cleanedData[className] = $a.Stage.mergeMyData({}, data);
    });
    this._saveStorage('stage', cleanedData);
  }

  cls.prototype.getUsername = function(){
    return this._getStorage('username') || 'Unknown';
  }

  cls.prototype.saveUsername = function(username){
    return this._saveStorage('username', username);
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

    this._turn = 0;
    this._maxTurn = undefined;
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
    var d = $.Deferred();
    var process = function(){

      self._turn += 1;
      $a.statusBox.draw();

      $.when(self._runTurn()).done(function(){

        if (self.getTurn() < self.getMaxTurn()) {
          setTimeout(process, 1);
        } else {
          d.resolve();
          return;
        }

      });
    }

    var roundNumber = $a.stage.getCurrentRound().roundNumber;
    $a.screen.runShowingRound(roundNumber, this._maxTurn).then(function(){
      setTimeout(process, 1);
    });

    return d;
  }

  cls.prototype._runTurn = function(){
    var self = this;
    var d = $.Deferred();
    $.Deferred().resolve().then(function(){
      self._currentPhaseType = 'action';
      $a.statusBox.draw();
      $a.mainBox.changePage('hand');
      $a.pagechangerBox.draw();
      return self._runActionPhase();
    }).then(function(){
      $d('Ended action phase');
      self._currentPhaseType = 'buy';
      $a.statusBox.draw();
      $a.mainBox.changePage('kingdom');
      $a.pagechangerBox.draw();
      return self._runBuyPhase();
    }).then(function(){
      $d('Ended buy phase');
      self._resetStatuses();
      $a.handCards.reset();
      $a.statusBox.draw();
      $a.handBox.draw();
      $a.deckCardsBox.draw();
      $a.talonCardsBox.draw();
      $a.pagechangerBox.draw();
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
      ).done(function(doneType){

        if (doneType === 'phaseend') {
          phaseEnd.resolve();
          return;
        } else if (doneType === 'acted') {
          $a.game.modifyActionCount(-1);
        }
        $a.statusBox.draw();
        setTimeout(process, 1);

      });
    }
    setTimeout(process, 1);

    return phaseEnd;
  }

  cls.prototype._runWaitingActionSelection = function(){

    var d = $.Deferred();

    var signal = $.Deferred();
    var signalables = [$a.mainBox];
    if ($a.game.getActionCount() > 0) {// Can't choice
      signalables = signalables.concat($a.handCards.getData());
    }
    $f.waitChoice(signalables, signal);

    $.when(signal).done(function(signaler){

      // Is touched statusBox
      if (signaler instanceof $a.Card === false) {
        d.resolve('phaseend');
      // Is touched card
      } else {
        // Is actable card
        if (signaler.isActable()) {
          $a.handCards.throwCard(signaler);
          $a.statusBox.draw();
          $a.handBox.draw();
          $a.talonCardsBox.draw();
          $a.pagechangerBox.draw();
          $.when(signaler.act()).done(function(){
            d.resolve('acted');
          });
        // Is not actable card
        } else {
          d.resolve('notacted');
        }
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
      ).done(function(doneType){

        if (doneType === 'phaseend') {
          phaseEnd.resolve();
          return;
        } else if (doneType === 'buy') {
          $a.game.modifyBuyCount(-1);
          $a.talonCardsBox.draw();
        }
        $a.statusBox.draw();
        setTimeout(process, 1);

      });
    }
    setTimeout(process, 1);

    return phaseEnd;
  }

  cls.prototype._runWaitingBuySelection = function(){

    var d = $.Deferred();
    var signal = $.Deferred();
    var signalables = [$a.mainBox];
    if ($a.game.getBuyCount() > 0) {// Can't choice
      signalables = signalables.concat($a.kingdomCards.getData());
    }
    $f.waitChoice(signalables, signal);

    $.when(signal).done(function(signaler){

      // Is touched statusBox
      if (signaler instanceof $a.Card === false) {
        d.resolve('phaseend');
      // Is touched card
      } else {
        // Is buyable card
        if (signaler.isBuyable()) {
          $a.game.modifyCoinCorrection(-signaler.getCost());
          $a.talonCards.addNewCard(signaler.className, { stack:true });
          $a.statusBox.draw();
          $a.pagechangerBox.draw();
          d.resolve('buy');
        // Is not buyable card
        } else {
          d.resolve('notbuy');
        }
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

  cls.create = function(maxTrun){
    var obj = new this();
    obj._maxTurn = maxTrun;
    __INITIALIZE(obj);
    return obj;
  }

  return cls;
//}}}
}());


$a.Cards = (function(){
//{{{
  var cls = function(){
    this._cards = undefined;
  }

  function __INITIALIZE(self){
    self._cards = [];
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

  cls.prototype.pushed = function(card){
    this._cards.push(card);
  }

  cls.prototype.stacked = function(card){
    this._cards.unshift(card);
  }

  cls.prototype.pulled = function(){
    return this._cards.shift();
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

  cls.prototype.dealTo = function(toCards, count){
    var self = this;
    _.times(count, function(){
      toCards.pushed(self.pulled());
    });
  }

  cls.prototype.destroyCard = function(card){
    // Can't use by trashCards itself
    this.remove(card);
    $a.trashCards.stacked(card);
  }

  cls.prototype.dumpTo = function(toCards){
    var self = this;
    var copiedCards = this._cards.slice(); // For index change by removing
    _.each(copiedCards, function(card){
      self.remove(card);
      toCards.stacked(card);
    });
  }

  cls.prototype.findDataByCardType = function(cardType){
    return _.filter(this._cards, function(card){
      return card.hasCardType(cardType);
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
  var cls = function(){
    this._choicedCardClassNames = undefined;
  }
  $f.inherit(cls, new $a.Cards(), $a.Cards);

  cls.__FIXED_CARDS = [
    'Coin1Card', 'Coin2Card', 'Coin3Card',
    'Victorypoints1Card', 'Victorypoints3Card', 'Victorypoints6Card'//,
  ];

  cls.prototype.reset = function(){
    var self = this;

    _.each(this._choicedCardClassNames, function(cardClassName){
      self.addNewCard(cardClassName);
    });
    // TODO: Add second-sort by card's english title
    this._cards.sort(function(a, b){
      return a.getCost() - b.getCost();
    });

    var reversed = cls.__FIXED_CARDS.slice().reverse();
    _.each(reversed, function(cardClassName){
      self.addNewCard(cardClassName, { stack:true });
    });
  }

  cls.create = function(choicedCardClassNames){
    var obj = $a.Cards.create.apply(this);
    obj._choicedCardClassNames = choicedCardClassNames;
    return obj;
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
    $a.talonCards.stacked(card);
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
  $f.inherit(cls, new $f.Box(), $f.Box);

  cls.POS = [0, 0];
  cls.SIZE = $c.SF_SIZE.slice(); // Must sync to CSS

  cls.ZINDEXES = {
    COVER: 99999,
    NAVIGATOR: 100
  }

  function __INITIALIZE(self){
    self.getView().css({
      backgroundColor: '#FFF'
    });
  }

  cls.prototype.changePage = function(page){
    // TODO: Add fadeIn/Out version
    var d = $.Deferred();
    _.each($a.pages, function(page){
      page.getView().hide();
    });
    page.getView().show();
    if (page.hasNavigator) {
      $a.navigator.getView().show();
    } else {
      $a.navigator.getView().hide();
    }
    return d.resolve();
  }

  cls.prototype.runShowingRound = function(roundNumber, maxTurn){
    var d = $.Deferred();
    var view = $('<div>')
      .hide()
      .append(
        $('<div>').css({
          position: 'absolute',
          top: (this.getHeight() - 48) / 2,
          width: this.getWidth(),
          height: 48,
          lineHeight: '24px',
          fontSize: $a.fs(18),
          fontWeight: 'bold',
          textAlign: 'center'//,
        }).html($f.format('Round {0}<br />Turn {1}', roundNumber, maxTurn))
      )
      .css({
        position: 'absolute',
        width: this.getWidth(),
        height: this.getHeight(),
        zIndex: cls.ZINDEXES.COVER//,
      })
      .fadeIn(1000, function(){
        setTimeout(function(){
          view.fadeOut(1000, function(){
            view.remove();
            d.resolve();
          })
        }, 500);
      })
      .appendTo(this.getView())
    ;
    return d;
  }

  cls.create = function(){
    var obj = $f.Box.create.apply(this, arguments);
    __INITIALIZE(obj);
    return obj;
  }

  return cls;
//}}}
}());


$a.Navigator = (function(){
//{{{
  var cls = function(){
  }
  $f.inherit(cls, new $f.Box(), $f.Box);

  cls.POS = [368, 0]; // 368 = 416 - 48
  cls.SIZE = [$a.Screen.SIZE[0], 48];

  function __INITIALIZE(self){
    self.setZIndex($a.Screen.ZINDEXES.NAVIGATOR);

    self._helpButtonView = self._createButtonView(154, 'Help')
      .css({
        top: 3,
        left: 3
      })
      .attr({
        target: '_blank',
        href: $e.baseUrl + '/help/'
      })
      .appendTo(self.getView())
    ;

    self._rankingButtonView = self._createButtonView(154, 'Ranking')
      .css({
        top: 3,
        right: 3
      })
      .attr({
        target: '_blank',
        href: $e.baseUrl + '/ranking/'
      })
      .appendTo(self.getView())
    ;
  }

  cls.prototype._createButtonView = function(width, label){
    return $('<a>')
      .css({
        display: 'block',
        position: 'absolute',
        width: width,
        height: 40,
        lineHeight: '40px',
        fontSize: $a.fs(12),
        color: '#000',
        border: '1px solid #000',
        textDecoration: 'none',
        textAlign: 'center'//,
      })
      .attr('href', 'javascript:void(0);')
      .text(label)
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
  $f.mixin(cls, new $f.SignalableMixin());

  cls.POS = [48, 0];
  cls.SIZE = [320, 320];

  cls.ZINDEXES = {
    COMMENT: 100
  };

  function __INITIALIZE(self){

    self._view
      .css({
        backgroundColor: '#FFF'
      })
      .on('mousedown', { self:self }, __ONTOUCH);

    self._commentView = $('<div />')
      .css({
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: 12,
        zIndex: cls.ZINDEXES.COMMENT,
        lineHeight: '12px',
        fontSize: $a.fs(10),
        color: '#666',
        textAlign: 'center'//,
      })
      .text('フェーズ終了は空き部分をタッチ')
      .appendTo(self._view);
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

  function __ONTOUCH(evt){
    var self = evt.data.self;
    self.triggerSignal();
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


/** Abstract class */
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

  cls.STYLES = {
    COLOR: '#000',
    HILIGHT_COLOR: '#FF9900'//,
  };

  function __INITIALIZE(self){
    self._view
      .css({
        backgroundColor: '#EEE',
        cursor: 'pointer'
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
        color: cls.STYLES.COLOR,
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
      $a.game.summaryVictoryPoints()
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

    this._drawHilightPhase();
  }

  cls.prototype._drawHilightPhase = function(){
    var phaseType = $a.game.getCurrentPhaseType();
    if (phaseType === 'action') {
      this._stateViews.action.css({ color: cls.STYLES.HILIGHT_COLOR });
      this._stateViews.buy.css({ color: cls.STYLES.COLOR });
    } else if (phaseType === 'buy') {
      this._stateViews.action.css({ color: cls.STYLES.COLOR });
      this._stateViews.buy.css({ color: cls.STYLES.HILIGHT_COLOR });
    }
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
      ['hand'],
      ['kingdom'],
      ['othercards']//,
    ];
    _.each(buttonDataList, function(data, idx){
      var buttonKey = data[0];
      var view = self._createButtonView()
        .css({
          top: 4,
          left: 4 + (100 + 6) * idx//,
        })
        .on('mousedown', {self:self, buttonKey:buttonKey}, __ONBUTTONTOUCH)
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
        fontSize: $a.fs(12),
        backgroundColor: '#AAA',
        cursor: 'pointer',
        textAlign: 'center'//,
      });
  }

  cls.prototype.draw = function(){
    var self = this;
    $f.Box.prototype.draw.apply(this);

    _.each(self._buttonViews, function(buttonView, buttonKey){
      // Label
      if (buttonKey === 'hand') {
        buttonView.text('手札' + $a.handCards.count());
      } else if (buttonKey === 'kingdom') {
        buttonView.text('購入');
      } else if (buttonKey === 'othercards') {
        buttonView.text(
          $f.format('山札{0}/捨札{1}', $a.deckCards.count(), $a.talonCards.count())
        );
      }
      // Selected color
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


  $a.screen = $a.Screen.create();
  $('#game_container').append($a.screen.getView());

  $a.navigator = $a.Navigator.create();
  $a.screen.getView().append($a.navigator.getView());


  // Pages
  $a.topPage = $a.$pages.TopPage.create();
  $a.screen.getView().append($a.topPage.getView());

  $a.stageselectionPage = $a.$pages.StageselectionPage.create();
  $a.screen.getView().append($a.stageselectionPage.getView());

  $a.gamePage = $a.$pages.GamePage.create();
  $a.screen.getView().append($a.gamePage.getView());

  $a.pages = [
    $a.topPage, $a.stageselectionPage, $a.gamePage
  ];


  // Prepare boxes for game-page
  $a.mainBox = $a.MainBox.create();
  $a.gamePage.getView().append($a.mainBox.getView());

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
  $a.gamePage.getView().append($a.pagechangerBox.getView());

  $a.statusBox = $a.StatusBox.create();
  $a.gamePage.getView().append($a.statusBox.getView());


  $a.topPage.draw();
  $a.stageselectionPage.draw();
  $a.gamePage.draw();
  $a.navigator.draw();
  $a.screen.draw();


  $a.screen.changePage($a.topPage);

//}}}
}
