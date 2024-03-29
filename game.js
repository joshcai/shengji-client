var ws = new WebSocket("ws://localhost:7000/ws");
var player_num, trump_num, num_counter;
var current_suit = false;
var played = false;
var cards = [];

var NUM = {
  "2": "two",
  "3": "three",
  "4": "four",
  "5": "five",
  "6": "six",
  "7": "seven",
  "8": "eight",
  "9": "nine",
  "10": "ten",
  "11": "jack",
  "12": "queen",
  "13": "king",
  "14": "ace",
  "15": "trump number",
  "16": "trump number trump suit",
  "17": "small joker",
  "18": "big joker"
}

function addToChat(message) {
  document.getElementById("game").value += message +"\n";
};

ws.onopen = function(event) {
  ws.send("hello");
  var name = document.getElementById("name").value;
  ws.send("ready " + name);
  renderScore(0);
};

ws.onmessage = function(event) {
  var m = event.data.split(" ");
  switch(m[0]) {
    case "assign":
      player_num = m[1];
      break;
    case "deal":
      cards.push(JSON.parse(m[1]));
      addToChat(stringifyCard(cards[cards.length-1]))
      renderCards();
      break;
    case "cards":
      cards = JSON.parse(m[1]);
      renderCards();
      break;
    case "newtrick":
      current_suit = false;
      played = false;
      break;
    case "tricktype":
      current_suit = m[1];
      break;
    case "score":
      renderScore(m[1]);
      break;
    case "trumpnum":
      trump_num = m[1]; // nums are passed as strings here (fix later?)
      addToChat('Trump num is: ' + trump_num);
      break;
    case "numcounter":
      num_counter = parseInt(m[1], 10);
      break;
    default:
      addToChat(event.data);
  }
};

function ready() {
  var name = document.getElementById("name").value;
  ws.send("ready " + name);
}

function start() {
  ws.send("start");
}

function playCard() {
  var cardNum = document.getElementById("card").value;
  var c = cards[cardNum];
  if(played) {
    addToChat('Please wait until the next turn!');
  }
  else if(current_suit && c.suit != current_suit && containsSuit(current_suit)) {
    addToChat('Illegal move!');
  }
  else {
    ws.send("play " + cardNum);
    played = true;
    cards.splice(cardNum, 1);
    renderCards();
  }
}

function declare() {
  var e = document.getElementById("declare");
  var suit = e.options[e.selectedIndex].value;
  if(containsCard(suit, trump_num, num_counter+1)) {
    ws.send("declare " + player_num + " " + suit);
  }
  else {
    addToChat('You don\'t have enough to declare that.');
  }
}

function bottomExchange() {
  var bottom = document.getElementById("card").value.split(" ");
  if(bottom.length != 8) {
    addToChat('Needs 8 total cards!');
  }
  else
  {
    ws.send("bottomExchange " + bottom);
  }
}

function renderCards() {
  // TODO: use react for this later
  var value = "";
  for(var i = 0; i < cards.length; i++)
  {
    value += i + " " + stringifyCard(cards[i]);
  }
  document.getElementById("cardsArea").value = value;
}

function renderScore(score) {
  var span = document.getElementById('score');
  span.innerHTML = score;
}

function containsSuit(suit) {
  // TODO: put into object later
  // TODO: replace with a counter for each type of card, decrease each time a card is played
  for(var i = 0; i < cards.length; i++) {
    if(cards[i].suit == suit) {
      return true;
    }
  }
  return false;
}

function containsCard(suit, num, times) {
  var count = 0;
  for(var i = 0; i < cards.length; i++) {
    if(cards[i].suit == suit && cards[i].num == num) {
      count += 1;
    }
    if(count == times) {
      return true
    }
  }
  return false;
}

function stringifyCard(card) {
  return NUM[card.actual_num] + " " + card.actual_suit + " ";
}
