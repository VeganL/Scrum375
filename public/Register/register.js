function checkForm() {
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
    } else {
       document.getElementById("formErrors").innerHTML = errorMsg;
       document.getElementById("formErrors").style.display = "block";
    }
 }
 
 document.getElementById("submit").addEventListener("click", function(event) {
    checkForm();
 
    // Prevent default form action. DO NOT REMOVE THIS LINE
    event.preventDefault();
 });