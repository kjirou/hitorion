/** Abstract class */
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
      $a.handCards.pullCards(this._card);
    }

    $a.statusBox.draw();
    $a.handBox.draw();
    $a.pagechangerBox.draw();
  }

  cls.prototype.getCardType = function(){
    // Card types are currently always only one
    return this._cardTypes[0];
  }

  cls.prototype.hasCardType = function(cardType){
    return _.indexOf(this._cardTypes, cardType) >= 0;
  }

  cls.prototype.getTitle = function(){ return this._title; }
  cls.prototype.getCost = function(){ return this._cost; }
  cls.prototype.getVictoryPoints = function(){ return this._victoryPoints; }
  cls.prototype.getCoin = function(){ return this._coin; }

  cls.prototype.isBuyable = function(){
    return this._cost <= $a.game.getCoin();
  }

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
  }
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
  }
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
  }
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
  }
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
  }
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
  }
  $f.inherit(cls, new $a.Card(), $a.Card);
  return cls;
//}}}
}());


//
// 3 cost
//
$a.$cards.ChancellorCard = (function(){
//{{{
  var cls = function(){
    this._cardTypes = ['action'];
    this._title = '宰相';
    this._cost = 3;
    this._coinCorrection = 2;
  }
  $f.inherit(cls, new $a.Card(), $a.Card);
  cls.prototype._act = function(){
    this._actBuffing();
    if (confirm('山札を捨て札にしますか？')) {
      $a.deckCards.dumpTo($a.talonCards);
      $a.statusBox.draw();
      $a.deckCardsBox.draw();
      $a.talonCardsBox.draw();
      $a.pagechangerBox.draw();
    }
  }
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
  }
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
  }
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
  }
  $f.inherit(cls, new $a.Card(), $a.Card);
  cls.prototype._act = function(){

    $a.mainBox.changePage('kingdom');
    $a.pagechangerBox.draw();
    alert('4コスト以下のカードを1枚取得できます');

    var d = $.Deferred();
    var signal = $.Deferred();
    $f.waitChoice($a.kingdomCards.getData(), signal);
    $.when(signal).done(function(card){
      if (card.getCost() <= 4) {
        $a.talonCards.addNewCard(card.className, { stack:true })
        $a.statusBox.draw();
        $a.talonCardsBox.draw();
      }
      $a.mainBox.changePage('hand');
      $a.pagechangerBox.draw();
      d.resolve();
    });
    return d;
  }
  return cls;
//}}}
}());


//
// 4 cost
//
$a.$cards.RemodelCard = (function(){
//{{{
  var cls = function(){
    this._cardTypes = ['action'];
    this._title = '改築';
    this._cost = 4;
  }
  $f.inherit(cls, new $a.Card(), $a.Card);
  cls.prototype._act = function(){

    var d = $.Deferred();
    alert('廃棄するカードを選んで下さい');
    var signal = $.Deferred();
    $f.waitChoice($a.handCards.getData(), signal);

    $.when(signal).done(function(card){

      var maxGainableCardCost = card.getCost() + 2;
      $a.handCards.destroyCard(card);
      $a.statusBox.draw();
      $a.handBox.draw();
      $a.trashCardsBox.draw();

      $a.mainBox.changePage('kingdom');
      $a.pagechangerBox.draw();
      alert($f.format('{0} コスト以下のカードを獲得できます', maxGainableCardCost));

      var signal2 = $.Deferred();
      $f.waitChoice($a.kingdomCards.getData(), signal2);
      $.when(signal2).done(function(wantedCard){

        if (wantedCard.getCost() <= maxGainableCardCost) {
          $a.talonCards.addNewCard(wantedCard.className, { stack:true })
          $a.statusBox.draw();
          $a.talonCardsBox.draw();
        }
        $a.mainBox.changePage('hand');
        $a.pagechangerBox.draw();
        d.resolve();

      });

    });

    return d;
  }
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
  }
  $f.inherit(cls, new $a.Card(), $a.Card);
  cls.prototype._act = cls.prototype._actBuffing;
  return cls;
//}}}
}());


//
// 5 cost
//
$a.$cards.FestivalCard = (function(){
//{{{
  var cls = function(){
    this._cardTypes = ['action'];
    this._title = '祝祭';
    this._cost = 5;
    this._actionCount = 2;
    this._buyCount = 1;
    this._coinCorrection = 2;
  }
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
  }
  $f.inherit(cls, new $a.Card(), $a.Card);
  cls.prototype._act = cls.prototype._actBuffing;
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
  }
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
  }
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
      $a.statusBox.draw();
      $a.handBox.draw();
      $a.trashCardsBox.draw();

      $a.mainBox.changePage('kingdom');
      $a.pagechangerBox.draw();
      alert($f.format('{0} コスト以下の財宝カードを手札に加えられます', maxGainableCardCost));

      var signal2 = $.Deferred();
      $f.waitChoice($a.kingdomCards.findDataByCardType('treasure'), signal2);
      $.when(signal2).done(function(wantedCard){

        if (wantedCard.getCost() <= maxGainableCardCost) {
          $a.handCards.addNewCard(wantedCard.className)
          $a.statusBox.draw();
          $a.handBox.draw();
        }
        $a.mainBox.changePage('hand');
        $a.pagechangerBox.draw();
        d.resolve();

      });

    });

    return d;
  }
  return cls;
//}}}
}());
