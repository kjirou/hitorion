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
      if (card.getCost() <= 4)
        $a.talonCards.addNewCard(card.className, { stack:true })
        $a.statusBox.draw();
        $a.talonCardsBox.draw();
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

      $a.mainBox.changePage('kingdom');
      $a.pagechangerBox.draw();
      alert('獲得するカードを選んで下さい');

      var signal2 = $.Deferred();
      $f.waitChoice($a.kingdomCards.getData(), signal2);
      $.when(signal2).done(function(wantedCard){

        if (wantedCard.getCost() <= maxGainableCardCost) {
          $a.talonCards.addNewCard(wantedCard.className, { stack:true })
          $a.statusBox.draw();
          $a.talonCardsBox.draw();
        }
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
