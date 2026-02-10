const form = document.getElementById("fullform");
const fullName = document.getElementById("fullname");
const email = document.getElementById("email");
const phone = document.getElementById("phone");
const errorFullName = document.querySelector(".errorfullname");
const errorEmail = document.querySelector(".erroremail");
const errorPhone = document.querySelector(".errorphone");
const result = document.getElementById("result");
const submitBtn = document.getElementById("submitBtn");
const emailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
const phonePattern = /^[0-9]{10}$/;
form.addEventListener("submit", function (event) {
  event.preventDefault();
  errorFullName.innerText = "";
  errorEmail.innerText = "";
  errorPhone.innerText = "";
  let isValid = true;

  if (fullName.value.trim() === "") {
    errorFullName.innerText = "Name is required";
    errorFullName.style.color = "red";
    isValid = false;
  }

  if (email.value.trim() === "") {
    errorEmail.innerText = "Email is required";
    errorEmail.style.color = "red";
    isValid = false;
  } 
  else if (!emailPattern.test(email.value)) {
    errorEmail.innerText = "Check the email";
    errorEmail.style.color = "red";
    isValid = false;
  }

  if (phone.value.trim() === "") {
    errorPhone.innerText = "Phone number is required";
    errorPhone.style.color = "red";
    isValid = false;
  } 
  else if (!phonePattern.test(phone.value)) {
    errorPhone.innerText = "Phone number must be 10 digits";
    errorPhone.style.color = "red";
    isValid = false;
  }

  if (isValid) {
    submitBtn.innerText = "Loading...";
    submitBtn.disabled = true;
    setTimeout(() => {
      result.innerHTML = `
        <li><b>Full Name:</b> ${fullName.value}</li>
        <li><b>Email:</b> ${email.value}</li>
        <li><b>Phone:</b> ${phone.value}</li>
      `;
      submitBtn.innerText = "Submit";
      submitBtn.disabled = false;
      form.reset();
    }, 5000);
  }
});
