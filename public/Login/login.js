function checkForm() {
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
	} else {
		document.getElementById("formErrors").innerHTML = errorMsg;
		document.getElementById("formErrors").style.display = "block";
	}
}

function signinResponseReceivedHandler()
{
	if(this.responseText != "Username or password is incorrect.")
	{
		let response = this.responseText;
		console.log(response);
		//load boards html page, make getBoards request with userId
	}
}

document.getElementById("submit").addEventListener("click", function(event) {
	checkForm();

	let username = document.getElementById("username").value;
	let password = document.getElementById("password").value;
	
	let xmlHttp = new XMLHttpRequest();
	let requestURL = "http://scrum375.lroy.us/signin";
	xmlHttp.addEventListener("load", signinResponseReceivedHandler);
	xmlHttp.open("POST", requestURL);
	xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xmlHttp.send("username=" + username +"&password="+ password);
	
	// Prevent default form action. DO NOT REMOVE THIS LINE
	event.preventDefault();
});
