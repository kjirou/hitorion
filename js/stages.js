/** Abstract class */
$a.Stage = (function(){
//{{{
  var cls = function(){
    // Must set for each sub-class
    this._buyableCards = undefined;

    // Not must set
    this.label = undefined;
    this.className = undefined;
    this._rounds = undefined;
    this._currentRoundIndex = 0;
  }
  $f.mixin(cls, null, $f.ClassBasedMasterDatalyzerMixin);
  cls.initializeClassBasedMasterDatalyzerMixin($a.$stages, cls, function(klass, className){
    return {
      className: className,
      order: klass._order,
      label: klass._label//,
    };
  });

  // Must set for each sub-class
  cls._label = undefined;
  cls._order = undefined;

  function __INITIALIZE(self){

    self.label = self.__myClass__.label;
    self.className = $f.getMyName($a.$stages, self.__myClass__);

    // Each game settings
    self._rounds = [];
    var roundsDataList = [
      ['1st', 12],
      ['2nd', 14],
      ['3rd', 16]//,
    ];
    _.each(roundsDataList, function(data, idx){
      self._rounds.push({
        label: data[0],
        maxTurn: data[1],
        score: null//,
      });
    });

  }

  cls.prototype._randChoiceBuyableCards = function(){
    var count = 10;
    var cards = this._buyableCards.slice();
    cards = _.shuffle(cards);
    return cards.slice(0, count);
  }

  cls.prototype.cleanGame = function(){

    // Destroy all cards
    var allCards = [];
    allCards = allCards.concat($a.kingdomCards.getData().slice());
    allCards = allCards.concat($a.deckCards.getData().slice());
    allCards = allCards.concat($a.talonCards.getData().slice());
    allCards = allCards.concat($a.trashCards.getData().slice());
    allCards = allCards.concat($a.handCards.getData().slice());
    _.each(allCards, function(card){ card.destroy(); });

    $a.kingdomCards = null;
    $a.deckCards = null;
    $a.talonCards = null;
    $a.trashCards = null;
    $a.handCards = null;

    $a.game = null;
  }

  cls.prototype.prepareGame = function(){

    var round = this._rounds[this._currentRoundIndex];

    $a.game = $a.Game.create(round.maxTurn);

    $a.kingdomCards = $a.KingdomCards.create(
      this._randChoiceBuyableCards()
    );
    $a.kingdomCards.reset();
    $a.deckCards = $a.DeckCards.create();
    $a.deckCards.reset();
    $a.talonCards = $a.Cards.create();
    $a.trashCards = $a.Cards.create();
    $a.handCards = $a.HandCards.create();
    $a.handCards.reset();

    $a.statusBox.draw();
    $a.mainBox.draw();
    $a.handBox.draw();
    $a.kingdomBox.draw();
    $a.othercardsBox.draw();
    $a.deckCardsBox.draw();
    $a.talonCardsBox.draw();
    $a.trashCardsBox.draw();
    $a.pagechangerBox.draw();
  }

  cls.prototype.getRounds = function(){
    return this._rounds;
  }

  cls.prototype.nextRound = function(){
    this._currentRoundIndex += 1;
  }

  cls.prototype.isFinishedAllRounds = function(){
    return this._rounds.length <= this._currentRoundIndex;
  }

  cls.prototype.summaryTotalScore = function(){
    return _.reduce(this._rounds, function(memo, round){
      return memo + round.score;
    }, 0);
  }

  cls.create = function(){
    var obj = new this();
    __INITIALIZE(obj);
    return obj;
  }

  return cls;
//}}}
}());


$a.$stages.BasicStage = (function(){
//{{{
  var cls = function(){
    this._buyableCards = [
      'ChancellorCard',
      'VillageCard',
      'WoodcutterCard',
      'WorkshopCard',
      'RemodelCard',
      'SmithyCard',
      'FestivalCard',
      'LaboratoryCard',
      'MarketCard'//,
    ];
  }
  $f.inherit(cls, new $a.Stage(), $a.Stage);
  cls._label = '基本';
  cls._order = 1;
  return cls;
//}}}
}());


$a.$stages.IntrigueStage = (function(){
//{{{
  var cls = function(){
    this._buyableCards = [
    ];
  }
  $f.inherit(cls, new $a.Stage(), $a.Stage);
  cls._label = '陰謀';
  cls._order = 2;
  return cls;
//}}}
}());


$a.$stages.SeasideStage = (function(){
//{{{
  var cls = function(){
    this._buyableCards = [
    ];
  }
  $f.inherit(cls, new $a.Stage(), $a.Stage);
  cls._label = '海辺';
  cls._order = 3;
  return cls;
//}}}
}());
