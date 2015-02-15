/** Abstract class */
$a.Card = (function(){
//{{{
  var cls = function(){
    /** Array of 'victory', 'treasure', 'action', 'reaction', 'attack' */
    this._cardTypes = undefined;

    this._title = undefined;
    this._description = null;
    this._cost = 0;
    this._victoryPoints = 0;  // int or func(){ return int; }
    this._card = 0;
    this._actionCount = 0;
    this._buyCount = 0;
    this._coinCorrection = 0;
    this._coin = 0;

    this.className = undefined;
    this._isSelected = false;
    this._isTurnedDown = false;
  };
  $f.inherit(cls, new $f.Sprite(), $f.Sprite);
  $f.mixin(cls, new $f.SignalableMixin());

  cls.POS = [0, 0];
  cls.SIZE = [60, 60];

  cls.STYLES = {
    TITLE_COLOR: '#000',
    SELECTED_TITLE_COLOR: 'red'
  };

  function __INITIALIZE(self){

    self.className = $f.getMyName($a.$cards, self.__myClass__);

    // For compounded type
    self._cardTypes.sort();

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

    if (this._isTurnedDown) {
      this._view.css({
        backgroundColor: '#ccc'
      });
      this._titleView.text('');
      this._costView.text('');
      return;
    }

    var bgColor;
    if (this.getCardType() === 'victory') {
      bgColor = '#76bc75';
    } else if (this.getCardType() === 'treasure') {
      bgColor = '#f9ca58';
    } else if (this.getCardType() === 'action') {
      bgColor = '#839c9d';
    } else if (this.getCardType() === 'action-victory') {
      bgColor = '#829f83';
    } else if (this.getCardType() === 'treasure-victory') {
      bgColor = '#999d76';
    }

    var opacity = 1.0;
    // FIXME: Dirty implementation
    if ($a.asideCards.has(this)) {
      opacity = 0.5;
    }

    this._titleView.text(this._title);

    this._costView.text(this.getCost() + ' cost');

    this._view.css({
      backgroundColor: bgColor,
      opacity: opacity
    });

    this._drawSelectedState();
  };

  cls.prototype._drawSelectedState = function(){
    if (this._isSelected) {
      this._titleView.css('color', cls.STYLES.SELECTED_TITLE_COLOR);
    } else {
      this._titleView.css('color', cls.STYLES.TITLE_COLOR);
    }
  };

  cls.prototype.toSelected = function(){
    this._isSelected = true;
    this._drawSelectedState();
  };
  cls.prototype.toUnselected = function(){
    this._isSelected = false;
    this._drawSelectedState();
  };

  cls.prototype.turnedUp = function(){
    this._isTurnedDown = false;
  };
  cls.prototype.turnedDown = function(){
    this._isTurnedDown = true;
  };

  /**
   * null = It is not actable.
   * func = Custom action.
   *        It must return resolved deferred, if it include async process.
   */
  cls.prototype._act = null;

  cls.prototype.act = function(){
    $a.game.increaseUsedActionCardCount(this.className);
    return this._act() || $.Deferred().resolve();
  };

  cls.prototype.isActable = function(){
    return this._act !== null;
  };

  cls.prototype._actBuffing = function(){

    $a.game.modifyActionCount(this._actionCount);
    $a.game.modifyBuyCount(this._buyCount);
    $a.game.modifyCoinCorrection(this._coinCorrection);
    if (this._card > 0) {
      $a.handCards.pullCards(this._card);
    }

    $a.statusBox.draw();
    $a.handBox.draw();
    $a.pagechangerBox.draw();
  };

  /** 'action' || 'treasure' || 'victory' ||
    'action-victory', 'treasure-victory' */
  cls.prototype.getCardType = function(){
    if (this._cardTypes.length === 1) return this._cardTypes[0];
    return this._cardTypes.join('-');
  };

  cls.prototype.hasCardType = function(cardType){
    return _.indexOf(this._cardTypes, cardType) >= 0;
  };

  cls.prototype.getTitle = function(){ return this._title; };

  cls.prototype.getCost = function(){
    var cost = this._cost;
    cost -= $a.game.countUsedActionCount('BridgeCard');
    return (cost > 0)? cost: 0;
  };

  cls.prototype.getVictoryPoints = function(){
    if (_.isFunction(this._victoryPoints)) return this._victoryPoints();
    return this._victoryPoints;
  };

  cls.prototype.getCoin = function(){
    var coin = this._coin;
    if (
      this.className === 'Coin1Card' &&
      $a.game.countUsedActionCount('CoppersmithCard') > 0
    ) {
      coin += $a.game.countUsedActionCount('CoppersmithCard');
    }
    return coin;
  };

  cls.prototype.isBuyable = function(){
    return this.getCost() <= $a.game.getCoin();
  };

  function __ONMOUSEDOWN(evt){
    var self = evt.data.self;
    self.triggerSignal();
    evt.stopPropagation();
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


//
// Fixed cards
//
$a.$cards.Coin1Card = (function(){
//{{{
  var cls = function(){
    this._cardTypes = ['treasure'];
    this._title = '銅貨';
    this._coin = 1;
  };
  $f.inherit(cls, new $a.Card(), $a.Card);
  return cls;
//}}}
}());

$a.$cards.Coin2Card = (function(){
//{{{
  var cls = function(){
    this._cardTypes = ['treasure'];
    this._title = '銀貨';
    this._cost = 3;
    this._coin = 2;
  };
  $f.inherit(cls, new $a.Card(), $a.Card);
  return cls;
//}}}
}());

$a.$cards.Coin3Card = (function(){
//{{{
  var cls = function(){
    this._cardTypes = ['treasure'];
    this._title = '金貨';
    this._cost = 6;
    this._coin = 3;
  };
  $f.inherit(cls, new $a.Card(), $a.Card);
  return cls;
//}}}
}());

$a.$cards.Victorypoints1Card = (function(){
//{{{
  var cls = function(){
    this._cardTypes = ['victory'];
    this._title = '屋敷';
    this._cost = 2;
    this._victoryPoints = 1;
  };
  $f.inherit(cls, new $a.Card(), $a.Card);
  return cls;
//}}}
}());

$a.$cards.Victorypoints3Card = (function(){
//{{{
  var cls = function(){
    this._cardTypes = ['victory'];
    this._title = '公領';
    this._cost = 5;
    this._victoryPoints = 3;
  };
  $f.inherit(cls, new $a.Card(), $a.Card);
  return cls;
//}}}
}());

$a.$cards.Victorypoints6Card = (function(){
//{{{
  var cls = function(){
    this._cardTypes = ['victory'];
    this._title = '属州';
    this._cost = 8;
    this._victoryPoints = 6;
  };
  $f.inherit(cls, new $a.Card(), $a.Card);
  return cls;
//}}}
}());


//
// 2 cost
//

// Basic
$a.$cards.CellarCard = (function(){
//{{{
  var cls = function(){
    this._cardTypes = ['action'];
    this._title = '地下貯蔵庫';
    this._cost = 2;
    this._actionCount = 1;
  };
  $f.inherit(cls, new $a.Card(), $a.Card);
  cls.prototype._act = function(){

    var d = $.Deferred();

    this._actBuffing();

    alert('捨てるカードを選んでください');
    $a.screen.waitChoiceCards($a.handCards.getData()).then(function(cards){
      $a.handCards.throwCards(cards);
      $a.handCards.pullCards(cards.length);
      $a.screen.drawGameScene();
      d.resolve();
    });

    return d;

  };
  return cls;
//}}}
}());

// Intrigue
$a.$cards.CourtyardCard = (function(){
//{{{
  var cls = function(){
    this._cardTypes = ['action'];
    this._title = '中庭';
    this._cost = 2;
    this._card = 3;
  };
  $f.inherit(cls, new $a.Card(), $a.Card);
  cls.prototype._act = function(){

    this._actBuffing();

    alert('山札へ戻すカードを選んで下さい');
    return $f.waitChoice($a.handCards.getData()).done(function(card){
      $a.handCards.moveCard(card, $a.deckCards, { stack:true });
      $a.handBox.draw();
      $a.othercardsBox.draw();
      $a.pagechangerBox.draw();
    });

  };
  return cls;
//}}}
}());

$a.$cards.PawnCard = (function(){
//{{{
  var cls = function(){
    this._cardTypes = ['action'];
    this._title = '手先';
    this._cost = 2;
  };
  $f.inherit(cls, new $a.Card(), $a.Card);
  cls.prototype._act = function(){

    var effectTypes = ['card', 'action', 'buy', 'coin'];
    var choices = [];
    var cnt = 0;
    var currentType;
    while (choices.length < 2) {

      currentType = effectTypes[cnt % effectTypes.length];
      cnt += 1;
      if (_.indexOf(choices, currentType) > -1) {
        continue;
      }

      if (currentType === 'card') {
        if (confirm('カードを 1 枚引きますか?')) choices.push('card');
      } else if (currentType === 'action') {
        if (confirm('アクションを 1 増加しますか?')) choices.push('action');
      } else if (currentType === 'buy') {
        if (confirm('購入を 1 増加しますか?')) choices.push('buy');
      } else if (currentType === 'coin') {
        if (confirm('コインを 1 増加しますか?')) choices.push('coin');
      } else {
        throw Error('PawnCard._act: Invalid situation'); // For infinity loop
      }

    }

    _.each(choices, function(effectType){
      if (effectType === 'card') {
        $a.handCards.pullCards(1);
      } else if (effectType === 'action') {
        $a.game.modifyActionCount(1);
      } else if (effectType === 'buy') {
        $a.game.modifyBuyCount(1);
      } else if (effectType === 'coin') {
        $a.game.modifyCoinCorrection(1);
      }
    });
    $a.statusBox.draw();
    $a.handBox.draw();
    $a.othercardsBox.draw();
    $a.pagechangerBox.draw();

  };
  return cls;
//}}}
}());


//
// 3 cost
//

// Basic
$a.$cards.ChancellorCard = (function(){
//{{{
  var cls = function(){
    this._cardTypes = ['action'];
    this._title = '宰相';
    this._cost = 3;
    this._coinCorrection = 2;
  };
  $f.inherit(cls, new $a.Card(), $a.Card);
  cls.prototype._act = function(){
    this._actBuffing();
    if (confirm('山札を捨て札にしますか？')) {
      _.each($a.deckCards.getData(), function(card){ card.turnedUp(); });
      $a.deckCards.dumpTo($a.talonCards);
      $a.screen.drawGameScene();
    }
  };
  return cls;
//}}}
}());

$a.$cards.VillageCard = (function(){
//{{{
  var cls = function(){
    this._cardTypes = ['action'];
    this._title = '村';
    this._cost = 3;
    this._card = 1;
    this._actionCount = 2;
  };
  $f.inherit(cls, new $a.Card(), $a.Card);
  cls.prototype._act = cls.prototype._actBuffing;
  return cls;
//}}}
}());

$a.$cards.WoodcutterCard = (function(){
//{{{
  var cls = function(){
    this._cardTypes = ['action'];
    this._title = '木こり';
    this._cost = 3;
    this._coinCorrection = 2;
    this._buyCount = 1;
  };
  $f.inherit(cls, new $a.Card(), $a.Card);
  cls.prototype._act = cls.prototype._actBuffing;
  return cls;
//}}}
}());

$a.$cards.WorkshopCard = (function(){
//{{{
  var cls = function(){
    this._cardTypes = ['action'];
    this._title = '工房';
    this._cost = 3;
  };
  $f.inherit(cls, new $a.Card(), $a.Card);

  cls.prototype._act = function(){

    $a.mainBox.changePage('kingdom');
    $a.pagechangerBox.draw();

    return cls.gainCard(4);
  };

  cls.gainCard = function(maxCost){
    var d = $.Deferred();

    alert(maxCost + ' コスト以下のカードを獲得できます');
    $f.waitChoice($a.kingdomCards.getData()).then(function(card){

      if (card.getCost() <= maxCost) {
        $a.talonCards.addNewCard(card.className, { stack:true });
      }
      $a.mainBox.changePage('hand');
      $a.screen.drawGameScene();

      d.resolve(card);
    });

    return d;
  };

  return cls;
//}}}
}());

// Intrigue
$a.$cards.GreathallCard = (function(){
//{{{
  var cls = function(){
    this._cardTypes = ['action', 'victory'];
    this._title = '大広間';
    this._cost = 3;
    this._card = 1;
    this._actionCount = 1;
    this._victoryPoints = 1;
  };
  $f.inherit(cls, new $a.Card(), $a.Card);
  cls.prototype._act = cls.prototype._actBuffing;
  return cls;
//}}}
}());

$a.$cards.ShantytownCard = (function(){
//{{{
  var cls = function(){
    this._cardTypes = ['action'];
    this._title = '貧民街';
    this._cost = 3;
    this._actionCount = 2;
  };
  $f.inherit(cls, new $a.Card(), $a.Card);
  cls.prototype._act = function(){

    this._actBuffing();

    if (
      _.any($a.handCards.getData(), function(card){
        return card.hasCardType('action');
      }) === false
    ) {
      $a.handCards.pullCards(2);
      $a.screen.drawGameScene();
    }

  };
  return cls;
//}}}
}());

$a.$cards.StewardCard = (function(){
//{{{
  var cls = function(){
    this._cardTypes = ['action'];
    this._title = '執事';
    this._cost = 3;
  };
  $f.inherit(cls, new $a.Card(), $a.Card);
  cls.prototype._act = function(){

    // If you execute this as lambda function in loop,
    //   then JSHint will alert "Don't make functions within a loop.".
    var destroy2Cards = function(){
      return $a.screen.waitChoiceAndDestroingHandCards(2).then(function(){
        $a.statusBox.draw();
        $a.othercardsBox.draw();
        $a.pagechangerBox.draw();
      });
    };

    while (true) {
      if (confirm('カードを 2 枚引きますか?')) {
        $a.handCards.pullCards(2);
        $a.screen.drawGameScene();
        return;
      } else if (confirm('コインを 2 増加しますか?')) {
        $a.game.modifyCoinCorrection(2);
        $a.screen.drawGameScene();
        return;
      } else if (confirm('カードを 2 枚廃棄しますか?')) {
        return destroy2Cards();
      }
    }

  };
  return cls;
//}}}
}());

$a.$cards.WishingwellCard = (function(){
//{{{
  var cls = function(){
    this._cardTypes = ['action'];
    this._title = '願いの井戸';
    this._cost = 3;
    this._card = 1;
    this._actionCount = 1;
  };
  $f.inherit(cls, new $a.Card(), $a.Card);
  cls.prototype._act = function(){

    this._actBuffing();

    var openableCards = $a.deckCards.getOpenableCards(1);
    if (openableCards.length === 0) {
      alert('山札がありません');
      return;
    }

    $a.mainBox.changePage('kingdom');
    $a.pagechangerBox.draw();

    var d = $.Deferred();

    alert('山札の一番上のカードを予測して下さい');
    $f.waitChoice($a.kingdomCards.getData()).done(function(card){

      $a.mainBox.changePage('othercards');
      $a.pagechangerBox.draw();

      $f.wait(500).done(function(){

        var surfaceCard = openableCards[0];
        surfaceCard.turnedUp();
        $a.othercardsBox.draw();

        $f.wait(1000).done(function(){

          if (card.className === surfaceCard.className) {
            alert('おめでとうございます!');
            $a.handCards.pullCards(1);
          } else {
            surfaceCard.turnedDown();
          }

          $a.mainBox.changePage('hand');
          $a.screen.drawGameScene();
          d.resolve();

        });

      });

    });

    return d;

  };
  return cls;
//}}}
}());


//
// 4 cost
//

// Basic
$a.$cards.FeastCard = (function(){
//{{{
  var cls = function(){
    this._cardTypes = ['action'];
    this._title = '祝宴';
    this._cost = 4;
  };
  $f.inherit(cls, new $a.Card(), $a.Card);
  cls.prototype._act = function(){

    // This check is for the ThroneroomCard
    if ($a.playareaCards.has(this)) {
      $a.playareaCards.destroyCard(this);
    }
    $a.screen.drawGameScene();

    $a.mainBox.changePage('kingdom');
    $a.pagechangerBox.draw();

    return $a.$cards.WorkshopCard.gainCard(5);
  };
  return cls;
//}}}
}());

$a.$cards.GardensCard = (function(){
//{{{
  var cls = function(){
    this._cardTypes = ['victory'];
    this._title = '庭園';
    this._cost = 4;
    this._victoryPoints = function(){
      return ~~($a.game.getTotalCardCount() / 10);
    };
  };
  $f.inherit(cls, new $a.Card(), $a.Card);
  return cls;
//}}}
}());

$a.$cards.MoneylenderCard = (function(){
//{{{
  var cls = function(){
    this._cardTypes = ['action'];
    this._title = '金貸し';
    this._cost = 4;
  };
  $f.inherit(cls, new $a.Card(), $a.Card);
  cls.prototype._act = function(){

    var coin1s = _.filter($a.handCards.getData(), function(card){
      return card instanceof $a.$cards.Coin1Card;
    });

    if (coin1s.length > 0) {
      $a.handCards.destroyCard(coin1s[0]);
      $a.game.modifyCoinCorrection(3);
      $a.statusBox.draw();
      $a.handBox.draw();
      $a.othercardsBox.draw();
      $a.pagechangerBox.draw();
    } else {
      alert('銅貨がありません');
    }

  };
  return cls;
//}}}
}());

$a.$cards.RemodelCard = (function(){
//{{{
  var cls = function(){
    this._cardTypes = ['action'];
    this._title = '改築';
    this._cost = 4;
  };
  $f.inherit(cls, new $a.Card(), $a.Card);
  cls.prototype._act = function(){
    return cls.removel(2);
  };

  cls.removel = function(bonus){

    var d = $.Deferred();

    if ($a.handCards.getData().length === 0) {
      alert('カードがありません');
      return;
    }

    alert('廃棄するカードを選んで下さい');
    $f.waitChoice($a.handCards.getData()).done(function(card){

      var maxGainableCardCost = card.getCost() + bonus;
      $a.handCards.destroyCard(card);

      $a.screen.drawGameScene();

      $a.mainBox.changePage('kingdom');
      $a.pagechangerBox.draw();

      $a.$cards.WorkshopCard.gainCard(maxGainableCardCost).done(function(){
        d.resolve();
      });

    });

    return d;
  };

  return cls;
//}}}
}());

$a.$cards.SmithyCard = (function(){
//{{{
  var cls = function(){
    this._cardTypes = ['action'];
    this._title = '鍛冶屋';
    this._cost = 4;
    this._card = 3;
  };
  $f.inherit(cls, new $a.Card(), $a.Card);
  cls.prototype._act = cls.prototype._actBuffing;
  return cls;
//}}}
}());

$a.$cards.ThroneroomCard = (function(){
//{{{
  var cls = function(){
    this._cardTypes = ['action'];
    this._title = '玉座の間';
    this._cost = 4;
  };
  $f.inherit(cls, new $a.Card(), $a.Card);
  cls.prototype._act = function(){

    var actions = $a.handCards.findDataByCardType('action');
    if (actions.length === 0) {
      alert('アクションカードがありません');
      return;
    }

    var d = $.Deferred();

    alert('使用するカードを選んで下さい');
    $f.waitChoice(actions).done(function(card){

      $a.handCards.useActionCard(card);
      $a.screen.drawGameScene();

      card.act().done(function(){
        card.act().done(function(){
          d.resolve();
        });
      });

    });

    return d;

  };
  return cls;
//}}}
}());

// Intrigue
$a.$cards.BaronCard = (function(){
//{{{
  var cls = function(){
    this._cardTypes = ['action'];
    this._title = '男爵';
    this._cost = 4;
    this._buyCount = 1;
  };
  $f.inherit(cls, new $a.Card(), $a.Card);
  cls.prototype._act = function(){

    this._actBuffing();

    var targets = $a.handCards.findDataByClassName('Victorypoints1Card');
    if (
      targets.length > 0 &&
      confirm('屋敷を捨て札にして 4 コインを取得しますか?')
    ) {
      $a.game.modifyCoinCorrection(4);
      $a.handCards.throwCard(targets[0]);
    } else {
      $a.talonCards.addNewCard('Victorypoints1Card');
    }

    $a.screen.drawGameScene();

  };
  return cls;
//}}}
}());

$a.$cards.BridgeCard = (function(){
//{{{
  var cls = function(){
    this._cardTypes = ['action'];
    this._title = '橋';
    this._cost = 4;
    this._buyCount = 1;
    this._coinCorrection = 1;
  };
  $f.inherit(cls, new $a.Card(), $a.Card);
  cls.prototype._act = function(){
    this._actBuffing();
    $a.screen.drawGameScene();
    $a.kingdomBox.draw();
  };
  return cls;
//}}}
}());

$a.$cards.ConspiratorCard = (function(){
//{{{
  var cls = function(){
    this._cardTypes = ['action'];
    this._title = '共謀者';
    this._cost = 4;
  };
  $f.inherit(cls, new $a.Card(), $a.Card);
  cls.prototype._act = function(){

    $a.game.modifyCoinCorrection(2);

    if ($a.game.countTotalUsedActionCount() >= 3) {
      $a.handCards.pullCards(1);
      $a.game.modifyActionCount(1);
    }

    $a.screen.drawGameScene();

  };
  return cls;
//}}}
}());

$a.$cards.CoppersmithCard = (function(){
//{{{
  var cls = function(){
    this._cardTypes = ['action'];
    this._title = '銅細工師';
    this._cost = 4;
  };
  $f.inherit(cls, new $a.Card(), $a.Card);
  cls.prototype._act = cls.prototype._actBuffing;
  return cls;
//}}}
}());

$a.$cards.IronworksCard = (function(){
//{{{
  var cls = function(){
    this._cardTypes = ['action'];
    this._title = '鉄工所';
    this._cost = 4;
  };
  $f.inherit(cls, new $a.Card(), $a.Card);
  cls.prototype._act = function(){

    var d = $.Deferred();

    $a.mainBox.changePage('kingdom');
    $a.pagechangerBox.draw();

    $a.$cards.WorkshopCard.gainCard(4).done(function(card){

      if (card.hasCardType('action')) $a.game.modifyActionCount(1);
      if (card.hasCardType('treasure')) $a.game.modifyCoinCorrection(1);
      if (card.hasCardType('victory')) $a.handCards.pullCards(1);

      $a.mainBox.changePage('hand');
      $a.screen.drawGameScene();

      d.resolve();

    });

    return d;
  };
  return cls;
//}}}
}());

$a.$cards.MiningvillageCard = (function(){
//{{{
  var cls = function(){
    this._cardTypes = ['action'];
    this._title = '鉱山の村';
    this._cost = 4;
    this._card = 1;
    this._actionCount = 2;
  };
  $f.inherit(cls, new $a.Card(), $a.Card);
  cls.prototype._act = function(){

    this._actBuffing();

    // This check is for the ThroneroomCard
    if ($a.playareaCards.has(this)) {
      if (confirm('このカードを廃棄して 2 コイン取得しますか?')) {
        $a.game.modifyCoinCorrection(2);
        $a.playareaCards.destroyCard(this);
        $a.screen.drawGameScene();
      }
    }

  };
  return cls;
//}}}
}());

$a.$cards.ScoutCard = (function(){
//{{{
  var cls = function(){
    this._cardTypes = ['action'];
    this._title = '偵察員';
    this._cost = 4;
    this._actionCount = 1;
  };
  $f.inherit(cls, new $a.Card(), $a.Card);
  cls.prototype._act = function(){

    this._actBuffing();

    $a.asideCards.pullCards(4);
    _.each($a.asideCards.getData().slice(), function(card){
      if (card.hasCardType('victory')) {
        $a.asideCards.moveCard(card, $a.handCards);
      }
    });

    $a.handBox.draw();
    $a.pagechangerBox.draw();

    if ($a.asideCards.count() === 0) return;

    var d = $.Deferred();

    alert('山札へ戻す順に選択して下さい');
    var process = function(){
      $f.waitChoice($a.asideCards.getData().slice()).done(function(card){

        $a.asideCards.moveCard(card, $a.deckCards, { stack:true });
        card.turnedDown();
        $a.screen.drawGameScene();

        if ($a.asideCards.count() > 0) {
          setTimeout(process, 1);
        } else {
          d.resolve();
        }

      });
    };
    setTimeout(process, 1);

    return d;

  };
  return cls;
//}}}
}());


//
// 5 cost
//

// Basic
$a.$cards.FestivalCard = (function(){
//{{{
  var cls = function(){
    this._cardTypes = ['action'];
    this._title = '祝祭';
    this._cost = 5;
    this._actionCount = 2;
    this._buyCount = 1;
    this._coinCorrection = 2;
  };
  $f.inherit(cls, new $a.Card(), $a.Card);
  cls.prototype._act = cls.prototype._actBuffing;
  return cls;
//}}}
}());

$a.$cards.LaboratoryCard = (function(){
//{{{
  var cls = function(){
    this._cardTypes = ['action'];
    this._title = '研究所';
    this._cost = 5;
    this._card = 2;
    this._actionCount = 1;
  };
  $f.inherit(cls, new $a.Card(), $a.Card);
  cls.prototype._act = cls.prototype._actBuffing;
  return cls;
//}}}
}());

$a.$cards.LibraryCard = (function(){
//{{{
  var cls = function(){
    this._cardTypes = ['action'];
    this._title = '書庫';
    this._cost = 5;
  };
  $f.inherit(cls, new $a.Card(), $a.Card);
  cls.prototype._act = function(){

    // FIXME: Can't choice putting action card to talonCards directly

    var card;
    while (true) {

      if ($a.handCards.count() >= 7 || $a.deckCards.isEmpty()) {
        break;
      }

      $a.asideCards.pullCards(1);
      card = $a.asideCards.getLastCard();

      $a.screen.drawGameScene();

      if (
        card.hasCardType('action') &&
        confirm($f.format('{0} を無視しますか?', card.getTitle()))
      ) {
        /* no process */
      } else {
        $a.asideCards.moveCard(card, $a.handCards);
        $a.screen.drawGameScene();
      }
    }

    $a.asideCards.dumpTo($a.talonCards);
    $a.screen.drawGameScene();

  };
  return cls;
//}}}
}());

$a.$cards.MarketCard = (function(){
//{{{
  var cls = function(){
    this._cardTypes = ['action'];
    this._title = '市場';
    this._cost = 5;
    this._card = 1;
    this._actionCount = 1;
    this._buyCount = 1;
    this._coinCorrection = 1;
  };
  $f.inherit(cls, new $a.Card(), $a.Card);
  cls.prototype._act = cls.prototype._actBuffing;
  return cls;
//}}}
}());

$a.$cards.MineCard = (function(){
//{{{
  var cls = function(){
    this._cardTypes = ['action'];
    this._title = '鉱山';
    this._cost = 5;
  };
  $f.inherit(cls, new $a.Card(), $a.Card);
  cls.prototype._act = function(){

    var d = $.Deferred();

    var treasures = $a.handCards.findDataByCardType('treasure');

    var signal;
    if (treasures.length > 0) {
      alert('廃棄する財宝カードを選んで下さい');
      signal = $.Deferred();
      $f.waitChoice(treasures, signal);
    } else {
      alert('財宝カードがありません');
      d.resolve();
      return;
    }

    $.when(signal).done(function(card){

      var maxGainableCardCost = card.getCost() + 3;
      $a.handCards.destroyCard(card);

      $a.screen.drawGameScene();

      $a.mainBox.changePage('kingdom');
      $a.pagechangerBox.draw();

      alert($f.format('{0} コスト以下の財宝カードを手札に加えられます', maxGainableCardCost));
      $f.waitChoice($a.kingdomCards.findDataByCardType('treasure')).done(function(wantedCard){

        if (wantedCard.getCost() <= maxGainableCardCost) {
          $a.handCards.addNewCard(wantedCard.className);
        }
        $a.mainBox.changePage('hand');
        $a.screen.drawGameScene();

        d.resolve();

      });

    });

    return d;
  };
  return cls;
//}}}
}());

// Intrigue
$a.$cards.DukeCard = (function(){
//{{{
  var cls = function(){
    this._cardTypes = ['victory'];
    this._title = '公爵';
    this._cost = 5;
    this._victoryPoints = function(){
      return _.filter($a.game.getPlayersCardData(), function(card){
        return card.className === 'Victorypoints3Card';
      }).length;
    };
  };
  $f.inherit(cls, new $a.Card(), $a.Card);
  return cls;
//}}}
}());

$a.$cards.TradingpostCard = (function(){
//{{{
  var cls = function(){
    this._cardTypes = ['action'];
    this._title = '交易場';
    this._cost = 5;
  };
  $f.inherit(cls, new $a.Card(), $a.Card);
  cls.prototype._act = function(){

    return $a.screen.waitChoiceAndDestroingHandCards(2).then(function(){
      $a.handCards.addNewCard('Coin2Card');
      $a.screen.drawGameScene();
    });

  };
  return cls;
//}}}
}());

$a.$cards.UpgradeCard = (function(){
//{{{
  var cls = function(){
    this._cardTypes = ['action'];
    this._title = '改良';
    this._cost = 5;
    this._card = 1;
    this._actionCount = 1;
  };
  $f.inherit(cls, new $a.Card(), $a.Card);
  cls.prototype._act = function(){
    this._actBuffing();
    return $a.$cards.RemodelCard.removel(1);
  };
  return cls;
//}}}
}());


//
// 6 cost
//

// Basic
$a.$cards.AdventurerCard = (function(){
//{{{
  var cls = function(){
    this._cardTypes = ['action'];
    this._title = '冒険者';
    this._cost = 6;
  };
  $f.inherit(cls, new $a.Card(), $a.Card);
  cls.prototype._act = function(){

    var d = $.Deferred();

    var treasureCount = 0;

    alert('財宝カードが 2 枚出るまで引きます');
    var looped = function(){

      if ($a.deckCards.isEmpty()) {
        d.resolve();
        return;
      }

      $a.handCards.pullCards(1);

      // Must not draw after throwing card for animation.
      $a.screen.drawGameScene();

      var card = $a.handCards.getLastCard();
      if (card.hasCardType('treasure')) {
        treasureCount += 1;
      } else {
        $a.handCards.throwCard(card);
      }

      if (treasureCount >= 2) {
        $a.screen.drawGameScene();
        d.resolve();
      } else {
        setTimeout(looped, 500);
      }
    };
    setTimeout(looped, 1);

    return d;
  };
  return cls;
//}}}
}());

// Intrigue
$a.$cards.HaremCard = (function(){
//{{{
  var cls = function(){
    this._cardTypes = ['treasure', 'victory'];
    this._title = 'ハーレム';
    this._cost = 6;
    this._coin = 2;
    this._victoryPoints = 2;
  };
  $f.inherit(cls, new $a.Card(), $a.Card);
  return cls;
//}}}
}());

$a.$cards.NoblesCard = (function(){
//{{{
  var cls = function(){
    this._cardTypes = ['action'];
    this._title = '貴族';
    this._cost = 6;
    this._victoryPoints = 2;
  };
  $f.inherit(cls, new $a.Card(), $a.Card);
  cls.prototype._act = function(){

    var effectType = null; // 1=Card+3 2=Action+2
    var cnt = 0;
    while (effectType === null) {
      if (cnt % 2) {
        if (confirm('カードを 3 枚引きますか?')) effectType = 1;
      } else {
        if (confirm('アクションを 2 増加しますか?')) effectType = 2;
      }
      cnt += 1;
    }

    if (effectType === 1) {
      $a.handCards.pullCards(3);
    } else {
      $a.game.modifyActionCount(2);
    }
    $a.screen.drawGameScene();

  };
  return cls;
//}}}
}());
