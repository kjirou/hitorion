/** Abstract class */
$a.Stage = (function(){
//{{{
  var cls = function(){
    // Must set for each sub-class
    this._buyableCards = undefined;

    // Not must set
    this.label = undefined;
    this.className = undefined;
    this._gameSettings = undefined;
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
    self._gameSettings = [];
    var gameSettingsDataList = [
      ['1st', 12],
      ['2nd', 14],
      ['3rd', 16]//,
    ];
    _.each(gameSettingsDataList, function(data, idx){
      self._gameSettings.push({
        gameNumber: idx + 1,
        label: data[0],
        maxTurn: data[1]//,
      });
    });

  }

  cls.prototype.randChoiceBuyableCards = function(){
    var count = 10;
    var cards = this._buyableCards.slice();
    cards = _.shuffle(cards);
    return cards.slice(0, count);
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
