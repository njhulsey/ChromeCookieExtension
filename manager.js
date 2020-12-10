// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
var savedData = "";

if (!chrome.cookies) {
  chrome.cookies = chrome.experimental.cookies;
}

// A simple Timer class.
function Timer() {
  this.start_ = new Date();

  this.elapsed = function() {
    return (new Date()) - this.start_;
  }

  this.reset = function() {
    this.start_ = new Date();
  }
}

// Compares cookies for "key" (name, domain, etc.) equality, but not "value"
// equality.
function cookieMatch(c1, c2) {
  return (c1.name == c2.name) && (c1.domain == c2.domain) &&
         (c1.hostOnly == c2.hostOnly) && (c1.path == c2.path) &&
         (c1.secure == c2.secure) && (c1.httpOnly == c2.httpOnly) &&
         (c1.session == c2.session) && (c1.storeId == c2.storeId);
}

// Returns an array of sorted keys from an associative array.
function sortedKeys(array) {
  var keys = [];
  for (var i in array) {
    keys.push(i);
  }
  keys.sort();
  return keys;
}

// Shorthand for document.querySelector.
function select(selector) {
  return document.querySelector(selector);
}

// An object used for caching data about the browser's cookies, which we update
// as notifications come in.
function CookieCache() {
  this.cookies_ = {};

  this.reset = function() {
    this.cookies_ = {};
  }

  this.add = function(cookie) {
    var domain = cookie.domain;
    if (!this.cookies_[domain]) {
      this.cookies_[domain] = [];
    }
    this.cookies_[domain].push(cookie);
  };

  this.remove = function(cookie) {
    var domain = cookie.domain;
    if (this.cookies_[domain]) {
      var i = 0;
      while (i < this.cookies_[domain].length) {
        if (cookieMatch(this.cookies_[domain][i], cookie)) {
          this.cookies_[domain].splice(i, 1);
        } else {
          i++;
        }
      }
      if (this.cookies_[domain].length == 0) {
        delete this.cookies_[domain];
      }
    }
  };

  // Returns a sorted list of cookie domains that match |filter|. If |filter| is
  //  null, returns all domains.
  this.getDomains = function(filter) {
    var result = [];
    sortedKeys(this.cookies_).forEach(function(domain) {
      if (!filter || domain.indexOf(filter) != -1) {
        result.push(domain);
      }
    });
    return result;
  }

  this.getCookies = function(domain) {
    return this.cookies_[domain];
  };
}


var cache = new CookieCache();

function removeAllForFilter() {
  var filter = select("#filter").value;
  var timer = new Timer();
  cache.getDomains(filter).forEach(function(domain) {
      removeCookiesForDomain(domain);
  });
}


function removeCookie(cookie) {
  var url = "http" + (cookie.secure ? "s" : "") + "://" + cookie.domain +
            cookie.path;
  chrome.cookies.remove({"url": url, "name": cookie.name});
}

function removeCookiesForDomain(domain) {
  var timer = new Timer();
  if(savedData.includes(domain))return;
  cache.getCookies(domain).forEach(function(cookie) {
    removeCookie(cookie);
  });
}

function resetTable() {
  var table = select("#cookies");
  while (table.rows.length > 1) {
    table.deleteRow(table.rows.length - 1);
  }
}

var reload_scheduled = false;

function scheduleReloadCookieTable() {
  if (!reload_scheduled) {
    reload_scheduled = true;
    setTimeout(reloadCookieTable, 500);
  }
}

function reloadCookieTable() {
  reload_scheduled = false;
  

  var filter = select("#filter").value;
  var domains = cache.getDomains(filter);

  select("#filter_count").innerText = domains.length;
  select("#total_count").innerText = cache.getDomains().length;

  select("#delete_all_button").innerHTML = "";
  if (domains.length) {
    var button = document.createElement("button");
    button.onclick = removeAllForFilter;
    button.innerText = "delete all " + domains.length;
    button.setAttribute("class","btn btn-danger")
    select("#delete_all_button").appendChild(button);
  }

  resetTable();
  var table = select("#cookies");

  var count = 5;
  var row = table.insertRow(-1);

  domains.forEach(function(domain) {
    var cookies = cache.getCookies(domain);
    
    if(count >= 5){
      row = table.insertRow(-1);
      row.setAttribute("class","card-deck");
      count = 0;
    }

    count+=1;
    
    //CREATE NEW CARD deck: 
    var cardDeck = row.insertCell(-1);
  
    //create main card div
    var card = document.createElement("div");
    card.setAttribute("class","card");

    var img = document.createElement('img');
    img.src = "https://logo.clearbit.com/"+ domain.substring(1);
    img.alt = domain;
    img.setAttribute("class", "card-img-top")
    
    
    img.onerror = function(){
      this.src = "https://via.placeholder.com/150"
    }

    card.appendChild(img);

    var body = document.createElement("div");
    body.setAttribute("class","card-body");

    if(savedData && savedData.includes(domain))
      body.setAttribute("style","background-color:#fff3c4;");


    var header = document.createElement('h5');
    header.setAttribute("class","card-title domain-title");
    header.innerText = domain;
    body.appendChild(header);

    var text = document.createElement('p');
    text.setAttribute("class","card-text");
    text.innerText = "Cookie Count: " + cookies.length;
    body.appendChild(text);

    var button2 = document.createElement("button");
    button2.setAttribute("class","btn btn-info")
    button2.setAttribute("style","margin-left:20px;")
    button2.innerText = "lookup";

    button2.onclick = (function(dom){
      return function() {
        var bkg = chrome.extension.getBackgroundPage();
        //var output = "" + cookies.domain + " " + cookies.value;
        document.getElementById("data-table").innerHTML = "";

        var lookupImage = document.getElementById("lookup-image");
        lookupImage.src = "https://logo.clearbit.com/"+ cookies[0].domain.substring(1);
        lookupImage.onerror = function(){
              this.src = "https://via.placeholder.com/200"
        }

        var buttonR = document.getElementById("inputRemove");
        buttonR.onclick = (function(dom){
          return function() {
            removeCookiesForDomain(dom);
            location.reload();
          };
        }(domain));
            console.log(savedData);

        var buttonRem = document.getElementById("inputRemember");
        buttonRem.onclick = function(dom){
          return function() {
            //var d = Date.UTC(2024,2,30);

          //var cookie="username=CookieControlCenter;"+dom+";" + d+";";

          if(!savedData) chrome.storage.local.set({"saved":dom + ";"});
          else if(savedData.includes(dom)) return;
          else{
            chrome.storage.local.set({"saved":savedData +dom + ";"});
            
            chrome.storage.local.get(['saved'], function(result) {
              //console.log("get func: "+ result.saved);
              savedData = result.saved;
              reloadCookieTable();
            });
          }
          

          };
        }(domain);


        var lookupheader = document.getElementById("lookup-header");
        lookupheader.innerText = cookies[0].domain;


        var dataTable = document.getElementById("data-table");

        for(i = 0; i < cookies.length; i++){
              var cookieRow = document.createElement('tr');
              

              var name = document.createElement('td');
              //name.innerText = cookies[i].name;
              //name.setAttribute = ("href", "https://cookiepedia.co.uk/cookies/"+name.innerText);
              var nameText = document.createElement('a');
              nameText.setAttribute("href", "https://cookiepedia.co.uk/cookies/"+cookies[i].name);
               nameText.setAttribute("target", "https://cookiepedia.co.uk/cookies/"+cookies[i].name);
              nameText.innerText = cookies[i].name
              nameText.appendChild(document.createTextNode(cookies[i].name));
              name.appendChild(nameText);

              var secure = document.createElement('td');
              secure.innerText = cookies[i].secure;

              
              var exp = document.createElement('td');
              var date = new Date(cookies[i].expirationDate * 1000);
              exp.innerText = "" + (date.getMonth() + 1) + "/" + 
                                    date.getDate() + "/"+
                                    date.getFullYear();
             

              var data = document.createElement('td');
              data.innerText = cookies[i].value;

              cookieRow.appendChild(name);
              cookieRow.appendChild(secure);        
              cookieRow.appendChild(exp);
              cookieRow.appendChild(data);

              dataTable.appendChild(cookieRow);
          }







        bkg.console.log("output: ");
        bkg.console.log(cookies[0]);

        var focus = document.getElementById("top");
        focus.scrollIntoView();
        //removeCookiesForDomain(dom);
      };
    }(domain));

    body.appendChild(button2);
    
    card.appendChild(body);
    cardDeck.appendChild(card);  

  });
}



function resetFilter() {
  var filter = select("#filter");
  filter.focus();
  if (filter.value.length > 0) {
    filter.value = "";
    reloadCookieTable();
  }
}

var ESCAPE_KEY = 27;
window.onkeydown = function(event) {
  if (event.keyCode == ESCAPE_KEY) {
    resetFilter();
  }
}

function listener(info) {
  cache.remove(info.cookie);
  if (!info.removed) {
    cache.add(info.cookie);
  }
  scheduleReloadCookieTable();
}

function startListening() {
  chrome.cookies.onChanged.addListener(listener);
}

function stopListening() {
  chrome.cookies.onChanged.removeListener(listener);
}

function onload() {
  var timer = new Timer();
  chrome.cookies.getAll({}, function(cookies) {
    startListening();
    start = new Date();
    for (var i in cookies) {
      cache.add(cookies[i]);
    }
    timer.reset();
    reloadCookieTable();
  });
}

document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.local.get(['saved'], function(result) {
    //console.log("get func: "+ result.saved);
      savedData = result.saved;
      onload();
    });
  //document.body.addEventListener('click', focusFilter);
  document.querySelector('#filter_div input').addEventListener(
      'input', reloadCookieTable);
  document.querySelector('#filter_button').addEventListener(
      'click', resetFilter);
});
