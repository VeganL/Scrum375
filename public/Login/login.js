function signinResponseReceivedHandler()
{
	if(this.responseText != "Username or password is incorrect.")
	{
		let userId = this.responseText;
		//load boards html page, make getBoards request with userId
	}
}
 
 document.getElementById("submit").addEventListener("click", function(event) {
    checkForm();
	
	let username = document.getElementById("username").value;
	let password = document.getElementById("password").value;
	
	let xmlHttp = new XMLHttpRequest();
	let requestURL = "http://scrum375.lroy.us/signin";
	xmlHttp.addEventListener("load", signinresponseReceivedHandler);
	xmlHttp.open("POST", requestURL);
	xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	xmlhttp.send(JSON.stringify({ "username": username, "password": password }));
 
    // Prevent default form action. DO NOT REMOVE THIS LINE
    event.preventDefault();
 });