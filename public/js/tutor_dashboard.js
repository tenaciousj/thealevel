function main(){
	//initialize Parse
	Parse.initialize("QCoDICrJKN3wcGr8f1YY39X97IyepLRqUa5HWIEJ", "b4e33HPvTRsI8aZIvwMW9NefSJKYCr0jWevH6CMD");

	//load newsfeed messages
	startLoadMessages();

	//load available filters
	startLoadFilters();
}


//loads messages to appear on a tutor's newsfeed
function startLoadMessages(){
	//show loading gif
	document.getElementById("messages").innerHTML = "<img src='img/loading.gif' />";


	var messageClass = Parse.Object.extend("Message");
	var messageQuery = new Parse.Query(messageClass);

	//order by date created (older ones should go first)
	messageQuery.ascending("createdAt");

	messageQuery.find({
		success: function(results){
			console.log("Messages successfully retrieved from database");
			if(results.length == 0){
				$("#messages").html("<p>No messages found</p>");
			}
			else {
				loadMessagesHTML(results);
			}
		},
		error: function(error){
			console.log("Error in startLoadMessages(): " + error);
			$("#messages").html("<p>No messages found, database error</p>");
		}
	});

}


function loadMessagesHTML(messages){
	//The Message List will have this form in HTML
	// <div class="list-group">
	//   <a href="#" class="list-group-item">
	//     <h4 class="list-group-item-heading">List group item heading</h4>
	//     <p class="list-group-item-text">Donec id elit non mi porta gravida at eget metus. Maecenas sed diam eget risus varius blandit.</p>
	//   </a>
	//   <a href="#" class="list-group-item">
	//     <h4 class="list-group-item-heading">List group item heading</h4>
	//     <p class="list-group-item-text">Donec id elit non mi porta gravida at eget metus. Maecenas sed diam eget risus varius blandit.</p>
	//   </a>
	// </div>


	var listGroupDiv = document.createElement("div");
	listGroupDiv.className = "list-group";

	for(var i = 0; i < messages.length; i++){
		var a = document.createElement("a");
		a.className = "list-group-item";

		//header
		var h4 = document.createElement("h4");
		h4.className = "list-group-item-heading";
		h4.textContent = messages[i].get("header");

		//time
		var p1 = document.createElement("p");
		p1.className = "list-group-item-text";
		var createdAt = new Date();
		createdAt = messages[i]["createdAt"];
		p1.textContent = createdAt.toDateString() + " " + formatAMPM(createdAt);


		//text content
		var p2 = document.createElement("p");
		p2.className = "list-group-item-text";
		p2.textContent = messages[i].get("content");

		a.appendChild(h4);
		a.appendChild(p1);
		a.appendChild(p2);

		listGroupDiv.appendChild(a);
	}

	var messagesDiv = document.getElementById("messages");
	//clear loading gif
	messagesDiv.innerHTML = "";
	//add messages
	messagesDiv.appendChild(listGroupDiv);
}

//starts the process of loading filters that will appear as checkboxes on the screen
function startLoadFilters(){
	//show loading gif
	document.getElementById("filters").innerHTML = "<img src='img/loading.gif' />";

	var subjectClass = Parse.Object.extend("Subject");
	var subjectQuery = new Parse.Query(subjectClass);

	subjectQuery.ascending("Department,Course_Number");
	

	subjectQuery.find({
		success: function(results){
			console.log("Filters successfully retrieved from database");
			if(results.length == 0){
				$("#filters").html("<p>No filters found</p>");
			}
			else {
				loadFiltersHTML(results);
			}
		},
		error: function(error){
			console.log("Error in startLoadFilters(): " + error);
			$("#filters").html("<p>No filters found</p>");
		}
	});
}

//loads filters for screen
function loadFiltersHTML(subjects){
	// The Filter List will have this form in HTML
	// <ul>
	// 	<li>
	// 		<div class="checkbox">
	// 			<label>
	// 		        <input type="checkbox"> Filter 1
	// 		    </label>
	// 		</div>
	// 	</li>
	// 	<li>
	// 		<div class="checkbox">
	// 			<label>
	// 		        <input type="checkbox"> Filter 2
	// 		    </label>
	// 		</div>
	// 	</li>
	// </ul>


	var ul = document.createElement("ul");
	//get rid of default bullets
	ul.style.cssText = "list-style-type:none; text-align:left;";

	//for every subject, create a checkbox
	for(var i = 0; i < subjects.length; i++){
		//create list item element
		var li = document.createElement("li");

		//create checkbox div element
		var checkboxDiv = document.createElement("div");
		checkboxDiv.className = "checkbox";

		//create label element
		var label = document.createElement("label");

		var dept = subjects[i].get("Department");
		var courseNum = subjects[i].get("Course_Number");

		var subjectName = dept + " " + courseNum;
		var id = dept + "_" + courseNum;

		label.innerHTML = "<input class='checkboxes' onclick='filterMessages()' id='" + id + "' type='checkbox'> " + subjectName;

		//add children to DOM
		checkboxDiv.appendChild(label);

		li.appendChild(checkboxDiv);

		ul.appendChild(li);
	}

	//get filters div
	var filters = document.getElementById("filters");
	//clear loading gif
	filters.innerHTML = "";
	//add checkbox list
	filters.appendChild(ul);


}

function filterMessages(){
	var checkboxes = document.getElementsByClassName("checkboxes");
	var filterList = [];
	for(var i = 0; i < checkboxes.length; i++){
		if(checkboxes[i].checked){
			filterList.push(checkboxes[i].id);
		}
	}
	//nothing is checked, no filters
	if(filterList.length == 0){
		startLoadMessages();
	}
	//apply the checked filters
	else{
		applyFilters(filterList);
	}
	
}

function applyFilters(filterList){
	//put up loading gif
	document.getElementById("messages").innerHTML = "<img src='img/loading.gif' />";

	//we are going to query the messages to see which ones have the selected subjects
	var messageQuery = new Parse.Query(Parse.Object.extend("Message"));
	messageQuery.containedIn("subjects", filterList);

	messageQuery.find({
		success: function(results){
			//if we find messages
			console.log("Messages with filters successfully retrieved from database");
			//no messages
			if(results.length == 0){
				$("#messages").html("<p>No messages with such filters available</p>");
			}
			else {
				loadMessagesHTML(results);
			}
		},
		error: function(error){
			//database error
			console.log("Error in applyFilters(): " + error);
			$("#messages").html("<p>No messages with such filters available, database error</p>");
		}
	});	

}


//helper function to convert to AM/PM in loadMessagesHTML()
function formatAMPM(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime;
}


main();