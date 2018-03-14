/*! coin functions: ISmith2018  */



/*  global and default declarations -----------------------------------------------------------------  */

getglobalsettings();
setInterval(function () {
  LoadAPIData(global_tickerurl, reloadok);
}, global_interval);
/*  -------------------------------------------------------------------------------global_interval-----------  */

/*  refresh all tables?-------------------------------------------------------------  */

function reloadok() {
  console.log("reloaded")
}


/*  global_xxxxxxxx: settings page coins-------------------------------------------------------------  */
function getglobalsettings() {
  // get these/set from local storage when loading the any page
  coinpricearray = []; //  coinlist. refreshed on successful api call
  global_num = getitem('global_num', "100"); // how many in total to load?
  global_smallnum = getitem('global_smallnum', "10"); // load top '10's
  global_interval = getitem('global_interval', "300000"); //5mins in miliseconds
  global_icons = getitem('global_icons', "1"); // show icons in  (use -1 for false)
  global_allicons = getitem('global_allicons', "1"); // show icons everywhere
  global_numindex = getitem('global_numindex', "10"); // index, how many coins to count in summary
  global_tickerurl = getitem('global_tickerurl', "https://api.coinmarketcap.com/v1/ticker/?limit="); + global_num; // watchlist

  // defaultwatchlist = ["BTC", "ETH", "BCH", "XRP", "LTC"]  // top 5 by market cap
  global_coinlist = getitem('global_coinlist', ["BTC", "ETH", "BCH", "XRP", "LTC"]); // default watchlist (note: Object) 

  global_currency = getitem('global_currency', "USD"); // not used yet.

}

/* ------ functions for settngs ---- */

function setdefault(btngroup) {
  // set the controls for settings page
  var groupitem = document.getElementsByName(btngroup);
  var defaultvalue = getitem(btngroup);
  for (var i = 0; i < groupitem.length; i++) {
    groupitem[i].checked = false; // all false
    if (groupitem[i].value == defaultvalue) {
      groupitem[i].checked = true; // only one true
    }
  }
}

function changesettings(btngroup) {
  // radio buttons in settings page. make sure btngroup is named same as global variable to store
  var groupitem = document.getElementsByName(btngroup);
  var value;
  // find value of checked btn in the group
  for (var i = 0; i < groupitem.length; i++) {
    if (groupitem[i].checked) {
      value = groupitem[i].value;
      // update localstorage
      storeitem(btngroup, value);
    }
  }
}

/* ----  get/set global item (or set default) ---- */
function getitem(item, defaultvalue) {
  // get the item frm localstorage
  var value = defaultvalue;
  try {
    value = JSON.parse(localStorage.getItem(item));
  } catch (error) {
    // store the default value for next time
    value = defaultvalue;
    storeitem(item, defaultvalue);
  }
  if (value == null) {
    value = defaultvalue;
    storeitem(item, defaultvalue);
  }
  return value;
}

function storeitem(item, value) {
  // save an item to local storgage
  localStorage.setItem(item, JSON.stringify(value))
}



/*  global_coinlist: for favourite coins-------------------------------------------------------------  */

function watchlist() {
  // called in watchlist page
  LoadAPIData(global_tickerurl, displaywatchlist);
}

function add_coin(symbol) {
  // if obj.symbol is passed in use it 
  // else get symbol from user input
  var maybe = "";
  if (symbol == undefined) {
    var ul = document.getElementById("coin-list");
    var candidate = document.getElementById("candidate");
    candidate.value = candidate.value.toUpperCase();
    var li = document.createElement("li");
    var length = candidate.value.length;
    maybe = candidate.value;
  } else {
    maybe = symbol;
  }

  if (maybe) {
    // update global_coinlist & local storage... dont add duplicates... dont add if not found
    var index = global_coinlist.indexOf(maybe); // index -1 means not found
    if (index == -1) {
      for (var i in coinpricearray) {
        if (coinpricearray[i].symbol == maybe) {
          global_coinlist.push(maybe);
          storeitem('global_coinlist', global_coinlist);
          coinpricearray[i].watchlist = true;
          rank = coinpricearray[i].rank
          if (symbol == undefined) {
            candidate.value = "";
            displaywatchlist();
          } // only for wishlist screen
          else {
            showcoin(rank); // the popup
          }
        }
      }
    }

  }
}

function remove_coin(symbol) {
  // if obj.symbol is passed in use it 
  // else get symbol from user input
  var maybe = "";
  if (symbol == undefined) {
    var ul = document.getElementById("coin-list");
    var candidate = document.getElementById("candidate");
    maybe = candidate.value.toUpperCase();
  } else {
    maybe = symbol;
  }

  if (maybe) {
    // update global_coinlist & local storage...
    var index = global_coinlist.indexOf(maybe);
    if (index > -1) {
      global_coinlist.splice(index, 1);
      storeitem('global_coinlist', global_coinlist);
    }
    // update the gloabal coinlist
    var n = coinpricearray.length;
    for (i = 0; i < n; i++) {
      if (coinpricearray[i].symbol == maybe) {
        rank = coinpricearray[i].rank;
        coinpricearray[i].watchlist = false;
      }
    }

    if (symbol == undefined) {
      candidate.value = "";
      displaywatchlist();
    } else {
      showcoin(rank);
    }
  }
}

function displaywatchlist(jsonobj) {
  // 
  if (jsonobj == undefined) {} else {
    coinpricearray = JSON.parse(jsonobj);
  }
  var n = coinpricearray.length;
  for (i = 0; i < n; i++) {
    coinpricearray[i].watchlist = inwatchlist(coinpricearray[i].symbol);
  }
  var coins = coinpricearray;
  var tablename = "watchlisttbl";
  var tableid = "ID_" + tablename;
  // global_coinlist
  /* CREATE THE TABLE - coin listed in global_coinlist */

  var target = document.getElementById(tablename);
  var data = "";
  var summarydata = "";
  var rank = "";
  data += "<table class='sortable' id=" + tableid + ">";
  data += "<thead><tr>";
  data += "<th class='mid'>Coin</th>";
  data += "<th class='mid'>Price</th>";
  data += "<th class='narrow'>1h</th>";
  data += "<th class='narrow'>1d</th>";
  data += "</tr></thead><tbody>";

  for (i = 0; i < n; i++) {
    if (coins[i].watchlist) {
      rank = coins[i];
      data += "<tr onclick=showcoin(" + coins[i].rank + ")>";
      data += "<td class='mid'>" + coins[i].name + "<br class='smallbr'><img src='./coinicon/32/color/" + ToLowerCase(coins[i].symbol) + ".png' class='img32'><br class='smallbr'>(" + coins[i].symbol + ")</td>";
      data += "<td class='mid'>" + formatCurrency(Number(coins[i].price_usd)) + "</td>";
      data += "<td class='narrow" + checkchange(Number(coins[i].percent_change_1h)) + formatpercent(coins[i].percent_change_1h) + "</td>";
      data += "<td class='narrow" + checkchange(Number(coins[i].percent_change_24h)) + formatpercent(coins[i].percent_change_24h) + "</td>";
      data += '</tr>';
    }
  }
  data += "</tbody></table>";
  target.innerHTML = data;
  sorttable.makeSortable(document.getElementById(tableid));
  addfooter();
}

function inwatchlist(coin) {
  var coin = coin;
  var index = global_coinlist.indexOf(coin);
  if (index > -1) {
    return true;
  }
  return false;
}

/*  display popup for selected coin by rank (id)-----------------------------------------------  */
function showcoin(i) {
  var rank = i; // find coin obj from its rank then display in the modal
  var value = ""; // triggered by any row clicked on a table

  var result = coinpricearray.filter(function (obj) {
    if (obj.rank == rank) {
      //            console.log(obj.name);
      value += '<div style="border:2px solid #E4E6EB;border-radius: 10px;"><div>';
      value += '<div style="float:right;width:67%;border: 0px solid #000;text-align:left;padding:2px 0px;line-height:32px;">';
      value += '<span style="font-size: 22px;"><a href="" style="text-decoration: none;">';
      if (obj.watchlist) {
        value += '<img src="./images/watch.png" class="img20">';
      }
      value += obj.name + '(' + obj.symbol + ')' + '</a></span><br>';
      value += '<span style="font-size: 24px;">' + formatCurrency(Number(obj.price_usd));
      value += '</span></div>';
      value += '<div style="text-align:center;padding:auto;width:33%;">';
      value += '<img src="./coinicon/32/color/' + ToLowerCase(obj.symbol) + '.png" class="img40"></div></div>';
      value += '<div style="border-top: 1px solid #E4E6EB;clear:both;text-align:center;padding:5px;">';
      value += '<div style="text-align:center;float:left;width:33%;font-size:12px;padding:12px 0;line-height:1.25em;">';
      value += '<span style="font-size: 12px; width:33%;">1h: ' + formatpercent(obj.percent_change_1h) + '</span></div> ';
      value += '<div style="text-align:center;float:left;width:33%;font-size:12px;padding:12px 0;line-height:1.25em;">';
      value += '<span style="font-size: 12px; width:33%;"> 24h: ' + formatpercent(obj.percent_change_24h) + '</span></div> ';
      value += '<div style="text-align:center;float:left;width:33%;font-size:12px;padding:12px 0;line-height:1.25em;">';
      value += '<span style="font-size: 12px; width:33%;"> 7d: ' + formatpercent(obj.percent_change_7d) + '</span> </div>';
      value += '</span></div>';
      value += '<div style="border-top: 1px solid #E4E6EB;clear:both;">';
      value += '<div style="text-align:center;float:left;width:30%;font-size:12px;padding:12px 0;line-height:1.25em;">RANK';
      value += '<br><br><span style="font-size: 18px; ">' + obj.rank + '</span></div>';
      value += '<div style="text-align:center;float:left;width:70%;font-size:12px;padding:12px 0 16px 0;line-height:1.25em;">MARKET CAP<br><br>';
      value += '<span style="font-size: 14px; ">' + formatCurrency(Number(obj.market_cap_usd)) + '</span></div>';
      value += ' </div>';
      value += '<div style="border-top: 1px solid #E4E6EB;text-align:center;clear:both;font-size:10px;font-style:italic;padding:5px 0;"><br>';
      value += '<a href="link" target="_blank" style="text-decoration: none; color: rgb(66, 139, 202);">Powered by CoinMarketCap</a><br>';
      if (obj.watchlist) {
        value += '<button class="smallbtn" onclick="remove_coin(\'' + obj.symbol + '\')";>Stop Watching</button>';
      } else {
        value += '<button class="smallbtn" onclick="add_coin(\'' + obj.symbol + '\')";>Start Watching</button>';
      }

      value += '</div><div>';
      // 24h_volume_usd - problmm with this variable name? starts with numbers?

      document.getElementById("coindata").innerHTML = value;

      // Get the modal
      var modal = document.getElementById('popup1');
      // Get the <span> element that closes the modal
      var span = document.getElementsByClassName("closemodal")[0];
      span.onclick = function () {
        modal.style.display = "none";
      }
      // When the user clicks anywhere outside of the modal, close it
      window.onclick = function (event) {
        if (event.target == modal) {
          modal = document.getElementById("popup1");
          modal.style.display = "none";
        }
      }

      modal.style.display = "block"; // display the modal
      return;
    }
  });

}

/*  populate all the coin tables-----------------------------------------------  */
function loadalltables(num) {
  var n = num;
  if (n == undefined) {
    n = global_num;
  };
  requesturl = "https://api.coinmarketcap.com/v1/ticker/?limit=" + n;
  Spinner("ON");
  LoadAPIData(requesturl, PriceTables);
}

function PriceTables(jsonobj) {
  coinpricearray = JSON.parse(jsonobj);
  // add 'watchlist'propery to all
  var n = coinpricearray.length
  for (i = 0; i < n; i++) {
    coinpricearray[i].watchlist = inwatchlist(coinpricearray[i].symbol);
  }

  /* all coins, no summary, not sorted, get markethealth */
  var period = "1H";
  var tablename = "AllCoinsTable";
  var num = global_num;
  tablelbl("AllCoinlbl", "by Market CAP", num)
  markethealth = 0.00;
  CreateSortableTable(period, tablename, num, false, true);

  /* top 10 by markket cap, on sorting rqd*/
  var period = "1H";
  var tablename = "Top10Table";
  var num = global_smallnum;
  tablelbl("Top10Tablelbl", "by Market CAP", num)
  CreateSortableTable(period, tablename, num, true);

  /* To price risers, last hour.no summary */
  var period = "1H";
  var tablename = "BigUpTable";
  var num = global_smallnum;
  var direction = "DESC";
  tablelbl("BigUplbl", "Risers in 1 hour", num)
  SortCoinArray(period, direction)
  CreateSortableTable(period, tablename, num, false);

  /* To price fallers, last hour. no summary */
  var period = "1H";
  var tablename = "BigDownTable";
  var num = global_smallnum;
  var direction = "ASC";
  tablelbl("BigDownlbl", "Fallers in 1 hour", num)
  SortCoinArray(period, direction)
  CreateSortableTable(period, tablename, num, false);

  Spinner("OFF");
}

function tablelbl(id, dir, num) {
  // eg <h2 id="BigDownlbl">Top 10 Fallers in 1 hour</h2>
  var lblid = id;
  var num = num;
  var dir = dir; //riser of faller
  var tablelbl = "Top " + num + ", " + dir;
  document.getElementById(lblid).innerHTML = tablelbl;
}

function LoadAPIData(requesturl, handler) {
  var xmlhttp = new XMLHttpRequest();
  var url = requesturl;
  xmlhttp.onreadystatechange = function () {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
      handler(xmlhttp.responseText);
    }
  }
  xmlhttp.open("GET", url, true);
  xmlhttp.send();
}

function SortCoinArray(period, direction) {
  var period = period;
  var tablename = tablename;
  var direction = direction;
  if (period == undefined || period == "") {
    period = "1H"
  };
  if (tablename == undefined || tablename == "") {
    tablename = "Top10Table"
  };
  if (direction == undefined || direction == "") {
    direction = "DESC"
  };

  if (direction == "DESC") {
    if (period == "1H") {
      coinpricearray.sort(function (a, b) {
        return Number(b.percent_change_1h) - Number(a.percent_change_1h)
      });
    };
    if (period == "1D") {
      coinpricearray.sort(function (a, b) {
        return Number(b.percent_change_24h) - Number(a.percent_change_24h)
      });
    };
  }

  if (direction == "ASC") {
    if (period == "1H") {
      coinpricearray.sort(function (a, b) {
        return Number(a.percent_change_1h) - Number(b.percent_change_1h)
      });
    };
    if (period == "1D") {
      coinpricearray.sort(function (a, b) {
        return Number(a.percent_change_24h) - Number(b.percent_change_24h)
      });
    };
  }
}

function CreateSortableTable(period, tablename, num, summary, score) {
  var coins = coinpricearray;
  var totalp = 0.00;
  var totalcap = 0.00;
  var n = num;
  var period = period;
  var tablename = tablename;
  var tableid = "ID_" + tablename;
  var summary = summary;
  var rowcount = 0;
  var scorehealth = score;
  var upcount = 0.00

  if (scorehealth == undefined) {
    scorehealth = false;
  };

  if (n == undefined) {
    n = global_numindex;
  };
  if (n > coins.length || n == 0) {
    n = coins.length;
  };
  if (period == undefined || period == "") {
    period = "1H";
  };
  if (tablename == undefined || tablename == "") {
    tablename = "Top10Table";
  };
  if (summary == undefined) {
    summary = true;
  };

  /* CREATE THE TABLE */

  var target = document.getElementById(tablename);
  var data = "";
  var summarydata = "";
  var rank = "";
  data += "<table class='sortable' id=" + tableid + ">";
  data += "<thead><tr>";
  data += "<th class='mid'>Coin</th>";
  data += "<th class='mid'>Price</th>";
  data += "<th class='narrow'>1h</th>";
  data += "<th class='narrow'>1d</th>";
  data += "<th class='narrow'>7d</th>";
  data += "<th class='wide'>CAP</th>";
  data += "</tr></thead><tbody>";

  for (i = 0; i < n; i++) {
    rank = coins[i];
    data += "<tr onclick=showcoin(" + coins[i].rank + ")>";
    data += "<td class='mid'>";
    if (coins[i].watchlist) {
      data += "<img src='./images/watch.png' class='img20'>";
    }
    data += coins[i].name;
    data += "<br class='smallbr'><img src='./coinicon/32/color/";
    data += ToLowerCase(coins[i].symbol) + ".png' class='img40'>";

    data += "<br class='smallbr'>(" + coins[i].symbol + ")</td>";



    data += "<td class='mid'>" + formatCurrency(Number(coins[i].price_usd)) + "</td>";
    data += "<td class='narrow" + checkchange(Number(coins[i].percent_change_1h)) + formatpercent(coins[i].percent_change_1h) + "</td>";
    data += "<td class='narrow" + checkchange(Number(coins[i].percent_change_24h)) + formatpercent(coins[i].percent_change_24h) + "</td>";
    data += "<td class='narrow" + checkchange(Number(coins[i].percent_change_7d)) + formatpercent(coins[i].percent_change_7d) + "</td>";
    data += "<td class='wide'>" + formatCurrency(Number(coins[i].market_cap_usd)) + "</td>";
    data += '</tr>';
    totalp += Number(coins[i].price_usd);
    totalcap += Number(coins[i].market_cap_usd);

    rowcount += 1;
    if (Number(coins[i].percent_change_1h) > 0.00) {
      upcount += 1;
    }
  }

  data += "</tbody></table>";
  if (summary) {
    summarydata += "<table class= 'summary'><thead><tr>";
    summarydata += "<th class=''>Total Price</th>";
    summarydata += "<th class=''>Market CAP</th>";
    summarydata += "</tr></thead><tbody><tr>";
    summarydata += "<td class=''><strong>" + formatCurrency(totalp) + "</strong></td>";
    summarydata += "<td class=''><strong>" + formatCurrency(totalcap) + "</strong></td>";
    summarydata += "</tr></tbody><tfoot></tfoot></table><br>";
    data = summarydata + data;
  }

  /* data = data + "<P>Row count: " + rowcount + "<P>";  */
  target.innerHTML = data;
  sorttable.makeSortable(document.getElementById(tableid));

  if (scorehealth) {
    markethealth = (100 * upcount / rowcount);
    var temp = '';
    temp += markethealth + "% " + "<img src='./images/good.png' style='height:21px'>";
    temp += (100 - Number(markethealth)) + "% " + "<img src='./images/bad.png' style='height:21px'>";
    document.getElementById("markethealth").innerHTML = temp;
  }
  addfooter();
}

/*  loader gif-----------------------------------------------  */
function Spinner(state) {
  var newstate = state;
  var spin = document.getElementById("spinner");
  if (newstate == 'ON') {
    spin.style.display = "block";
  } else {
    spin.style.display = "none";
  }
}

/*  formatting-----------------------------------------------  */
function formatCurrency(num) {
  if (num === null) {
    num = "0";
  }
  num = num.toString().replace(/\$|\,/g, '');
  if (isNaN(num)) {
    num = "0";
  }

  sign = (num == (num = Math.abs(num)));
  num = Math.floor(num * 100 + 0.50000000001);
  cents = num % 100;
  num = Math.floor(num / 100).toString();

  if (cents < 10) {
    cents = "0" + cents;
  }
  for (var i = 0; i < Math.floor((num.length - (1 + i)) / 3); i++) {
    num = num.substring(0, num.length - (4 * i + 3)) + ',' + num.substring(num.length - (4 * i + 3));
  }

  return (((sign) ? '' : '-') + '$' + num + '.' + cents);
}

function formatpercent(pcnt) {
  var string;
  var percent = pcnt;
  if (percent === null) {
    percent = "0.00";
  }
  string = percent;
  return string;
}

function checkchange(pcnt) {
  var UpDown = "'>";
  var percent = pcnt;
  if (percent === null) {
    UpDown = "'>";
  } else if (percent < 0) {
    UpDown = " isDown'>";
  } else if (percent >= 0) {
    UpDown = " isUp'>";
  }
  return UpDown;
}

function ToLowerCase(str) {
  var string = str;
  return string.toLowerCase();
}

/*  page footer----------------------------------------------  */
function addfooter() {
  var value = '';
  value += "<div class='footer' style=''>";
  value += "<div class='footer-inner' style=''>";
  value += "<a href='#' target='_404.html'>IanSmith.IT</a></div>";
  value += "</div>";

  document.getElementById("footer").innerHTML = value;
}

/*  page tabs -----------------------------------------------  */
function openprice(evt, priceName) {
  var i, x, tablinks;
  x = document.getElementsByClassName("price");
  for (i = 0; i < x.length; i++) {
    x[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablink");
  for (i = 0; i < x.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" w3-border-red", "");
  }
  document.getElementById(priceName).style.display = "block";
  evt.currentTarget.firstElementChild.className += " w3-border-red";
}

function openTab(priceName) {
  var i, x, tablinks;
  x = document.getElementsByClassName("price");
  for (i = 0; i < x.length; i++) {
    x[i].style.display = "none";
  }
  document.getElementById(priceName).style.display = "block";
}


// -not used?
function searchtable() {
  var input, filter, table, tr, td, i;
  input = document.getElementById("myInput");
  filter = input.value.toUpperCase();
  table = document.getElementById("ID_AllCoinsTable");
  tr = table.getElementsByTagName("tr");
  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[0];
    if (td) {
      if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }
  }
}