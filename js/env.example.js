var $e = {};

$e.debug = true;
$e.debugFinishingGame = false;

// Google Analytics タグのID、'UA-' で始まるやつ
$e.googleAnalyticsId = null;

$e.baseUrl = 'http://localhost:8080';
//$e.baseUrl = 'http://hitorion.intergames.jp';

$e.mediaUrl = '.';

$e.require = function(){
    var i, url, p;
    for (i = 0; i < this.cssSources.length; i++) {
        url = this.cssSources[i][0];
        p = (this.cssSources[i][1])? '': '?_=' + Math.random();
        document.write('<link rel="stylesheet" type="text/css" href="' + url + p + '" />');
    };
    for (i = 0; i < this.jsSources.length; i++) {
        url = this.jsSources[i][0];
        p = (this.jsSources[i][1])? '': '?_=' + Math.random();
        document.write('<scr' + 'ipt src="' + url + p + '" type="text/javas' + 'cript"></scr' + 'ipt>');
    };
};

$e.cssSources = [];
$e.cssSources.push([$e.mediaUrl + '/css/all.min.css', true]);

$e.jsSources = [];
if ($e.debug) {
  $e.jsSources.push([$e.mediaUrl + '/js/all.js', true]);
} else {
  $e.jsSources.push([$e.mediaUrl + '/js/all.min.js', true]);
}
