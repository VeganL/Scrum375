function validateForm() {
	let nameValid = false;
	let passwordValid = false;
	let errorMsg = '<ul>';

	if (document.getElementById("username").value.length > 0) {
		document.getElementById("username").style.border = "1px solid #aaa";
		nameValid = true;
	} else {
		document.getElementById("username").style.border = "2px solid red";
		errorMsg += '<li>Enter username.</li>';
	}
	if (document.getElementById("password").value.length > 0) {
		document.getElementById("password").style.border = "1px solid #aaa";
		passwordValid = true;
	} else {
		document.getElementById("password").style.border = "2px solid red";
		errorMsg += '<li>Enter password.</li>';
	}

	console.log(nameValid);
	console.log(passwordValid);

	errorMsg += '</ul>';

	if (nameValid && passwordValid) {
		document.getElementById("formErrors").style.display = "none";
		return true;
	} else {
		document.getElementById("formErrors").innerHTML = errorMsg;
		document.getElementById("formErrors").style.display = "block";
		return false;
	}
}

function signinResponseReceivedHandler()
{
	if (this.responseText != '"Username or password is incorrect."')
	{
		let response = JSON.parse(this.responseText);
		console.log(response.user_id);
		localStorage.setItem("userId",response.user_id);
		localStorage.setItem("boardIds",response.board_ids);
		window.location.href = "../Boards/";
	} else {
		document.getElementById("username").style.border = "2px solid red";
		document.getElementById("password").style.border = "2px solid red";
		let errorMsg = '<ul><li>' + this.responseText + '</li></ul>';
		document.getElementById("formErrors").innerHTML = errorMsg;
		document.getElementById("formErrors").style.display = "block";
	}
}

document.getElementById("submit").addEventListener("click", function(event) {
	// Prevent default form action. DO NOT REMOVE THIS LINE
	event.preventDefault();

	if (!validateForm())
		return;

	let username = document.getElementById("username").value;
	let password = document.getElementById("password").value;
	
	let xmlHttp = new XMLHttpRequest();
	let requestURL = "http://scrum375.lroy.us/signin";
	xmlHttp.addEventListener("load", signinResponseReceivedHandler);
	xmlHttp.open("POST", requestURL);
	xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xmlHttp.send("username=" + username +"&password="+ password);
	
	// Prevent default form action. DO NOT REMOVE THIS LINE
	// event.preventDefault();
});
