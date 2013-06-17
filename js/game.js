// App object
var App = (function() {
  var images = [];

  function getData() {
    // I could create a generic object for this, but for this purpose I only created a function.
    var head = document.getElementsByTagName("head")[0];
    var request = document.createElement("script");
    request.type = "text/javascript";
    request.src = "https://services.sapo.pt/Codebits/listbadges?callback=App.fetchData";
    head.appendChild(request);
  }
  return {
    init: function() {
      var stButton = document.getElementById('stButton');
      stButton.onclick = getData;
    },
    fetchData: function(json) {
      var r = Math.floor(Math.random() * 83);
      var elem;
      var i = 0;
      while(i < 9) {
        r = Math.floor(Math.random() * 83);
        elem = json[r];
        if(elem !== undefined) {
          if(!elem.selected){
            images.push(elem);
            json[r].selected = true;
            i++;
          }
        }
      }
      Game.init(images);
    }
  };
})();

App.init();


// This is the object that defines the Game, it contains the number of images and the matched ones.
var Game = (function() {
  var initialized = false;
  var images = [];
  var numImgs = 9;
  var numMatched = 0;
  var container = document.getElementById('content');
  var buttonInit;

  function drawBoard() {
    Board.init(images);
    Board.draw();
  }
  function drawControls() {
    buttonInit = document.createElement('div');
    buttonInit.className = 'button';
    buttonInit.innerHTML = 'Iniciar Jogo';
    buttonInit.onclick = Game.start;
    var clock = Clock.init();
    container.appendChild(buttonInit);
    container.appendChild(clock);
  }
  return {
    init: function(imgs) {
      if(imgs !== undefined){
        images = imgs;
        drawBoard();
        drawControls();
      }
      else
        console.error('Please send valid images!');
    },
    start: function() {
      initialized = true;
      buttonInit.style.display = 'none';
      Clock.start();
    },
    isInitialized: function() {
      return initialized;
    },
    numImgs: function() {
      return numImgs;
    },
    matched: function() {
      numMatched++;
      if(numMatched == numImgs) {
        Clock.stop();
        var text = document.createElement('text');
        // Hardcoded texts
        text.innerHTML = "Parabens terminaste o jogo! Faz share do teu resultado no ";
        var twitter = document.createElement('a');
        twitter.href = 'https://twitter.com/intent/tweet/?text=' + escape('Memory JavaScript FTW em ' + Clock.getTime());
        twitter.innerHTML = 'Twitter!';
        container.appendChild(text);
        container.appendChild(twitter);
      }
    }
  };
}());

// Board object. This is here all the cards are appended.
var Board = (function() {
  var cards = [];
  var container = document.getElementById('content');
  var currClicked1, currClicked2;

  function changeStates() {
    currClicked1.changeState();
    currClicked2.changeState();
    currClicked1 = undefined;
    currClicked2 = undefined;
  }
  return {
    init: function(images) {
      for(var i = 0; i < Game.numImgs(); i++) {
        cards.push(new card(images[i]));
        cards.push(new card(images[i]));
      }
    },
    draw: function() {
      var i = 0;
      container.innerHTML = '';
      while(i < (Game.numImgs() * 2)){
        var r = Math.floor(Math.random() * (Game.numImgs() * 2));
        if(!cards[r].selected){
          container.appendChild(cards[r].elem);
          cards[r].selected = true;
          i++;
        }
      }
    },
    clickedImg: function(card) {
      if(currClicked1 === undefined)
        currClicked1 = card;
      else if(currClicked2 === undefined) {
        currClicked2 = card;
        if(currClicked1.img.id == currClicked2.img.id) {
          currClicked1.changeMatched();
          currClicked2.changeMatched();
          currClicked1 = undefined;
          currClicked2 = undefined;
          Game.matched();
        }
      }
      else{
        changeStates();
        currClicked1 = card;
      }
    }
  };
}());

// Card object
function card(img) {
  this.selected = false;
  this.matched = false;
  this.clicked = false;
  this.def  = "https://i2.wp.com/codebits.eu/logos/defaultavatar.jpg";
  this.img = img;
  var elem = document.createElement('img');
  elem.src = this.def;
  this.elem = elem;
  var _this = this;
  this.elem.onclick = function(evt) {
    if(Game.isInitialized() && !_this.matched) {
      if(!_this.clicked) {
        var src = _this.img.img;
        _this.clicked = true;
        Board.clickedImg(_this);
        _this.elem.src = src;
      }
    }
  };
}

card.prototype.changeState = function(){
  this.clicked = false;
  this.elem.src = this.def;
};

card.prototype.changeMatched = function(){
  this.matched = true;
};

// Clock object.
var Clock = (function() {
  var hour = 0;
  var minutes = 0;
  var seconds = -1;
  var started = false;
  // DOM elements for the clock
  var elem = document.createElement('div');
  var elemHour = document.createElement('span');
  var separator1 = document.createElement('text');
  var elemMinutes = document.createElement('span');
  var separator2 = document.createElement('text');
  var elemSeconds = document.createElement('span');
  var timer;
  elem.appendChild(elemHour);
  elem.appendChild(separator1);
  elem.appendChild(elemMinutes);
  elem.appendChild(separator2);
  elem.appendChild(elemSeconds);

  function refreshClock() {
    elemHour.innerHTML = Value(hour);
    elemMinutes.innerHTML = Value(minutes);
    elemSeconds.innerHTML = Value(seconds);
    separator1.innerHTML = ':';
    separator2.innerHTML = ':';
  }
  function Value(v) {
    if(v<10)
      return '0'+v;
    else return String(v);
  }
  function updateClock() {
      seconds++;
      if(seconds > 59){
        minutes++;
        seconds = 0;
      }
      else if(minutes > 59)
      {
        hour++;
        minutes = 0;
      }
      refreshClock();
  }

  return {
    init: function() {
      updateClock();
      return elem;
    },
    start: function(){
      if(!started){
        started = !started;
        timer = window.setInterval(updateClock,1000);
      }
    },
    stop: function() {
      window.clearInterval(timer);
      started = false;
    },
    reset: function(){
      Clock.stop();
      hour = 0;
      minutes = 0;
      seconds = 0;
      refreshClock();
    },
    getTime: function(){
      return Value(hour) + ':' + Value(minutes) + ':' + Value(seconds);
    }
  };
})();