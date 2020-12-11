

function clearSavedCookies(){
    chrome.storage.local.set({"saved":""});
}

function onLoad(){

	console.log(savedData);






	if(!savedData) return;
	
	domains = savedData.split(";");
	console.log(domains);

  var table = document.querySelector("#cookies");

  var count = 5;
  var row = table.insertRow(-1);

	domains.forEach(function(domain){
		console.log(domain);
		if(domain == "") return;
	    if(count >= 5){
	      row = table.insertRow(-1);
	      row.setAttribute("class","card-deck");
	      count = 0;
	    }
	    count+=1;

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
    
    var header = document.createElement('h5');
    header.setAttribute("class","card-title domain-title");
    header.innerText = domain;
    body.appendChild(header);

    var text = document.createElement('p');
    text.setAttribute("class","card-text");
    text.innerText = "";
    body.appendChild(text);
    

    var button = document.createElement("button");
    button.setAttribute("class","btn btn-purple");
    button.setAttribute("style","margin-left:20px;margin-right:20px;margin-bottom:20px;")
    button.innerText = "Forget";
    button.onclick = (function(domain){
      return function() {
      	var rem = domain + ";";
      	savedData = savedData.replace(rem,"");

   	 	chrome.storage.local.set({"saved":savedData});
   	 	location.reload();
      }
  	}(domain));

    card.appendChild(body);
    card.appendChild(button);

    cardDeck.appendChild(card);

	});

  	/*domains.forEach(function(domain) {
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

    card.appendChild(img);*/

}
	var savedData = "";
document.addEventListener('DOMContentLoaded', function() {

	chrome.storage.local.get(['saved'], function(result) {
		//console.log("get func: "+ result.saved);
		savedData = result.saved;
		onLoad();
	});

	document.getElementById('removeCookies').addEventListener('click',function(){
		clearSavedCookies();
	});


});
