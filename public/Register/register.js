document.getElementById("hamburger").addEventListener("click", function (event) {
   var dropdown = document.getElementById("dropdown");
   if (dropdown.hidden) {
      dropdown.hidden = false;
   } else {
      dropdown.hidden = true;
   }
});

function validateForm() {
   let nameValid = false;
   let emailValid = false;
   let passwordValid = false;
   let passwordMatch = false;
   let errorMsg = '<ul>';

   if (document.getElementById("username").value.length > 0) {
      document.getElementById("username").style.border = "1px solid #aaa";
      nameValid = true;
   } else {
      document.getElementById("username").style.border = "2px solid red";
      errorMsg += '<li>Missing full name.</li>';
   }

   let emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/;
   if (emailRegex.test(document.getElementById("email").value)) {
      document.getElementById("email").style.border = "1px solid #aaa";
      emailValid = true;
   } else {
      document.getElementById("email").style.border = "2px solid red";
      errorMsg += '<li>Invalid or missing email address.</li>';
   }

   let passLenValid = false;
   if (document.getElementById("password").value.length >= 10 && document.getElementById("password").value.length <= 20) {
      passLenValid = true;
   } else {
      document.getElementById("password").style.border = "2px solid red";
      errorMsg += '<li>Password must be between 10 and 20 characters.</li>';
   }

   let passOneLower = false;
   if (/[a-z]/.test(document.getElementById("password").value)) {
      passOneLower = true;
   } else {
      document.getElementById("password").style.border = "2px solid red";
      errorMsg += '<li>Password must contain at least one lowercase character.</li>';
   }

   let passOneUpper = false;
   if (/[A-Z]/.test(document.getElementById("password").value)) {
      passOneUpper = true;
   } else {
      document.getElementById("password").style.border = "2px solid red";
      errorMsg += '<li>Password must contain at least one uppercase character.</li>';
   }

   let passOneDigit = false;
   if (/[0-9]/.test(document.getElementById("password").value)) {
      passOneDigit = true;
   } else {
      document.getElementById("password").style.border = "2px solid red";
      errorMsg += '<li>Password must contain at least one digit.</li>';
   }

   if (passLenValid && passOneLower && passOneUpper && passOneDigit) {
      passwordValid = true;
      document.getElementById("password").style.border = "1px solid #aaa";
   }

   console.log(passLenValid);
   console.log(passOneLower);
   console.log(passOneUpper);
   console.log(passOneDigit);
   console.log(passwordValid);

   if (document.getElementById("password").value === document.getElementById("passwordConfirm").value) {
      document.getElementById("passwordConfirm").style.border = "1px solid #aaa";
      passwordMatch = true;
   } else {
      document.getElementById("passwordConfirm").style.border = "2px solid red";
      errorMsg += "<li>Password and confirmation password don't match.</li>";
   }

   errorMsg += '</ul>';

   if (nameValid && emailValid && passwordValid && passwordMatch) {
      document.getElementById("formErrors").style.display = "none";
      return true;
   } else {
      document.getElementById("formErrors").innerHTML = errorMsg;
      document.getElementById("formErrors").style.display = "block";
      return false;
   }
}

function registerResponseReceivedHandler() {
   console.log(this.responseText);
   if (this.responseText != '"Unable to sign in user."'
      && this.responseText != '"Username or email already used."') {
      let response = JSON.parse(this.responseText);
      console.log(response.user_id);
      localStorage.setItem("userId", response.user_id);
      localStorage.setItem("boardIds", response.board_ids);
      window.location.href = "../Boards/";
   } else {
      let errorMsg = '<ul><li>' + this.responseText + '</li></ul>';
      document.getElementById("formErrors").innerHTML = errorMsg;
      document.getElementById("formErrors").style.display = "block";
   }
}

document.getElementById("submit").addEventListener("click", function (event) {
   // Prevent default form action. DO NOT REMOVE THIS LINE
   event.preventDefault();

   if (!validateForm())
      return;

   let username = document.getElementById("username").value;
   let email = document.getElementById("email").value;
   let password = document.getElementById("password").value;


   let xmlHttp = new XMLHttpRequest();
   let requestURL = "http://scrum375.lroy.us/registernew"
   xmlHttp.addEventListener("load", registerResponseReceivedHandler);
   xmlHttp.open("POST", requestURL);
   xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
   xmlHttp.send("username=" + username + "&email=" + email + "&password=" + password);

   // Prevent default form action. DO NOT REMOVE THIS LINE
   //event.preventDefault();
});