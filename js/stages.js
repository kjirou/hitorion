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
  $f.mixin(cls, null, $f.ClassBasedDatalyzerMixin);

  // Must set for each sub-class
  cls._label = undefined;
  cls._order = undefined;

  function __INITIALIZE(self){

    self.label = self.__myClass__.label;
    self.className = $f.getMyName($a.$stages, self.__myClass__);

    // Each game settings
    self._rounds = [];
    var roundsDataList = [
      [12],
      [14],
      [16]//,
    ];
    // For debug
    if ($e.debugFinishingGame) {
      roundsDataList = [
        [1]
      ];
    }
    _.each(roundsDataList, function(data, idx){
      self._rounds.push({
        roundNumber: idx + 1,
        maxTurn: data[0],
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

  cls.prototype._cleanGame = function(){

    // Destroy all cards
    var allCards = [];
    allCards = allCards.concat($a.kingdomCards.getData().slice());
    allCards = allCards.concat($a.deckCards.getData().slice());
    allCards = allCards.concat($a.talonCards.getData().slice());
    allCards = allCards.concat($a.trashCards.getData().slice());
    allCards = allCards.concat($a.playareaCards.getData().slice());
    allCards = allCards.concat($a.asideCards.getData().slice());
    allCards = allCards.concat($a.handCards.getData().slice());
    _.each(allCards, function(card){ card.destroy(); });

    $a.kingdomCards = null;
    $a.deckCards = null;
    $a.talonCards = null;
    $a.trashCards = null;
    $a.handCards = null;

    $a.game = null;
  }

  cls.prototype._prepareGame = function(){

    var round = this.getCurrentRound();
    $a.game = $a.Game.create(round.maxTurn);

    $a.kingdomCards = $a.KingdomCards.create(
      this._randChoiceBuyableCards()
    );
    $a.kingdomCards.reset();
    $a.deckCards = $a.DeckCards.create();
    $a.deckCards.reset();
    $a.talonCards = $a.Cards.create();
    $a.trashCards = $a.Cards.create();
    $a.asideCards = $a.Cards.create();
    $a.handCards = $a.HandCards.create();
    $a.handCards.reset();
    $a.playareaCards = $a.PlayareaCards.create();

    $a.statusBox.draw();
    $a.mainBox.draw();
    $a.handBox.draw();
    $a.kingdomBox.draw();
    $a.othercardsBox.draw();
    $a.deckCardsBox.draw();
    $a.talonCardsBox.draw();
    $a.trashCardsBox.draw();
    $a.mainBox.changePage('hand');
    $a.pagechangerBox.draw();
  }

  cls.prototype.getCurrentRound = function(){
    return this._rounds[this._currentRoundIndex];
  }

  cls.prototype.run = function(){
    var self = this;
    var process = function(){

      self._prepareGame();

      $.when($a.game.run()).done(function(){

        self.getCurrentRound().score = $a.game.summaryVictoryPoints();
        self._cleanGame();
        self._currentRoundIndex += 1;

        if (self._isFinishedAllRounds() === false) {
          setTimeout(process, 1);
        } else {
          self._finish();
          return;
        }

      });
    }

    setTimeout(process, 1);
  }

  cls.prototype._isFinishedAllRounds = function(){
    return this._rounds.length <= this._currentRoundIndex;
  }

  cls.prototype._summaryTotalScore = function(){
    return _.reduce(this._rounds, function(memo, round){
      return memo + round.score;
    }, 0);
  }

  cls.prototype._finish = function(){
    var self = this;

    var myData = $a.Stage.getData()[this.className];

    var score = this._summaryTotalScore();
    if (score > myData.score) {
      myData.score = score;
      $a.player.saveStageData();
    }

    alert($f.format('スコアは {0} 点でした', score));

    // Post score
    this._runPostingScore().done(function(){

      // TODO: Tweet

      $a.stage = null;

      $a.stageselectionPage.draw();
      $a.screen.changePage($a.stageselectionPage);
    });
  }

  cls.prototype._runPostingScore = function(){
    var d = $.Deferred();

    var yourname = '';
    var comment;
    if (confirm('スコアを送信しますか?')) {
      while (yourname === '') {
        yourname = prompt('お名前は?(12文字)', $a.player.getUsername()) || '';
      }
      $a.player.saveUsername(yourname);
      comment = prompt('コメントを一言!(32文字)', '') || '';

      $.ajax({
        url: $e.baseUrl + '/easyscorekeeper/api.php',
        dataType: 'jsonp',
        jsonp: 'c',
        data: {
          u: yourname.slice(0, 12),
          score: this._summaryTotalScore(),
          comment: comment.slice(0, 32),
          category: this.className
        }
      }).done(function(){
        d.resolve();
      });
    } else {
      d.resolve();
    }

    return d;
  }

  cls.initializeClassBasedDatalyzerMixin($a.$stages, cls, function(klass, className){
    return {
      className: className,
      order: klass._order,
      label: klass._label,
      score: 0//,
    };
  });

  cls.mergeMyData = function(dat, myDat){
    if ('score' in myDat) dat.score = myDat.score;
    return dat;
  }

  var __mergedData = undefined;

  cls.initializeData = function(myData){
    __mergedData = {};
    _.each(cls.getClassBasedData(), function(data, className){
      if (className in myData) cls.mergeMyData(data, myData[className]);
      __mergedData[className] = data;
    });
  }

  cls.getData = function(){
    return __mergedData;
  }

  cls.getDataList = function(){
    return _.map(__mergedData, function(data, className){
      return data;
    }).sort(function(a, b){
      return a.order - b.order;
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


$a.$stages.BasicStage = (function(){
//{{{
  var cls = function(){
    this._buyableCards = [
      'CellarCard',
      'ChancellorCard',
      'VillageCard',
      'WoodcutterCard',
      'WorkshopCard',
      'FeastCard',
      'GardensCard',
      'MoneylenderCard',
      'RemodelCard',
      'SmithyCard',
      'ThroneroomCard',
      'FestivalCard',
      'LaboratoryCard',
      'LibraryCard',
      'MarketCard',
      'MineCard',
      'AdventurerCard'//,
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
      'CourtyardCard',
      'PawnCard',
      'StewardCard',
      'GreathallCard',
      'BaronCard',
      'ConspiratorCard',
      'CoppersmithCard',
      'IronworksCard',
      'ScoutCard',
      'MiningvillageCard',
      'DukeCard',
      'UpgradeCard',
      'TradingpostCard',
      'NoblesCard'//,
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
      //'CellarCard',
      //'ChancellorCard',
      //'VillageCard',
      //'WoodcutterCard',
      //'WorkshopCard',
      //'FeastCard',
      //'GardensCard',
      //'MoneylenderCard',
      'RemodelCard',
      //'SmithyCard',
      'ThroneroomCard',
      //'FestivalCard',
      'LaboratoryCard',
      //'LibraryCard',
      //'MarketCard',
      //'MineCard',
      //'AdventurerCard',

      'CourtyardCard',
      //'PawnCard',
      'StewardCard',
      'WishingwellCard',
      //'GreathallCard',
      //'BaronCard',
      //'ConspiratorCard',
      //'CoppersmithCard',
      'IronworksCard',
      'ScoutCard',
      //'MiningvillageCard',
      //'DukeCard',
      'UpgradeCard',
      //'TradingpostCard',
      'NoblesCard'//,
    ];
  }
  $f.inherit(cls, new $a.Stage(), $a.Stage);
  cls._label = '海辺';
  cls._order = 3;
  return cls;
//}}}
}());
