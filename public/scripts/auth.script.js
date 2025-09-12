const loginBtn = document.getElementById("login-btn"); //for ui switch
const signupBtn = document.getElementById("signup-btn"); //for ui switch
const loginForm = document.getElementById("login-form"); //for form ui fileds
const signupForm = document.getElementById("signup-form"); //for form ui fileds
const otpForm = document.getElementById("otp-form");
const sendOtpBtn = document.getElementById("signup-submit-btn"); //send Otp
const loginBtnSubmit = document.getElementById("login-submit-btn"); //login btn - auth
const verifyBtn = document.getElementById("otp-submit-btn"); //verify Otp
const toggleButtons = document.getElementById("toggle-buttons");
const authMessage = document.getElementById("auth-message");

const signupFormData = document.getElementById("signup-form-data");
const loginFormData = document.getElementById("login-form-data");
const otpFormData = document.getElementById("otp-form-data");




// Custom Alert Function
window.alert = function(message, timeout = 2500) {
  const existingAlert = document.querySelector(".custom-alert");
  if (existingAlert) existingAlert.remove();

  const alert = document.createElement('div');
  alert.classList.add('custom-alert');
  alert.innerText = message;

  alert.setAttribute('style', `
    position: fixed;
    top: 15%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #cec9ccc2;
    color: black;
    padding: 1rem 2rem;
    border-radius: 1rem;
    box-shadow: 0 0 20px rgba(128, 128, 128, 0.25);
    font-family: 'Poppins', sans-serif;
    font-size: 1rem;
    z-index: 9999;
    text-align: center;
    opacity: 0;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    transition: opacity 0.3s ease, transform 0.3s ease;
  `);

  document.body.appendChild(alert);
  requestAnimationFrame(() => {
    alert.style.opacity = "1";
    alert.style.transform = "translate(-50%, -50%) scale(1.05)";
  });

  setTimeout(() => {
    alert.style.opacity = "0";
    alert.style.transform = "translate(-50%, -50%) scale(1)";
    setTimeout(() => alert.remove(), 300);
  }, timeout);
};




loginBtn.addEventListener("click", () => {
  // Show Login form
  loginForm.classList.remove("hidden");
  signupForm.classList.add("hidden");
  otpForm.classList.add("hidden");
  authMessage.classList.add("hidden");

  // Update button styles
  loginBtn.classList.add("active");
  signupBtn.classList.remove("active");
});

signupBtn.addEventListener("click", () => {
  // Show Sign Up form
  signupForm.classList.remove("hidden");
  loginForm.classList.add("hidden");
  otpForm.classList.add("hidden");
  authMessage.classList.add("hidden");

  // Update button styles
  signupBtn.classList.add("active");
  loginBtn.classList.remove("active");
});

// Handle Login form submission
loginFormData.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const formData = new FormData(loginFormData);
    const payload = Object.fromEntries(formData.entries());

    const response = await axios.post("/api/v1/user/login", payload);

    if (response.data.success) {
      alert("Login successful!");
      window.location.href = "/";
    } else {
      alert(response.data.message || "Login failed");
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Login failed";
    alert(errorMessage);
  }
});

// Handle Sign Up form submission to show OTP form
sendOtpBtn.addEventListener("click", async (e) => {
  e.preventDefault();

  try {
    const formData = new FormData(signupFormData);
    const payload = Object.fromEntries(formData.entries());

      signupForm.classList.add("hidden");
      toggleButtons.classList.add("hidden");
      otpForm.classList.remove("hidden");    
    const response = await axios.post("/api/v1/user/send-otp", payload);

    if (response.data.success) {
      // Show success message
      authMessage.innerHTML = `<div class="success-message">
                <strong>Success!</strong>
                <span>OTP sent to your email.</span>
            </div>`;
      authMessage.classList.remove("hidden");

      // alert("");
      console.log("Sign up form submitted, showing OTP form.");

      // Set hidden email field in OTP form
      document.getElementById("otp-email").value = payload.email;

    
    } else {
      alert(response.data.message || "Failed to send OTP");
    }
  } catch (err) {
    const errorMessage = err.response?.data?.message || "Something went wrong";
    alert(errorMessage);
  }
});

// Handle OTP form submission
verifyBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  try {
    const formData = new FormData(otpFormData);
    const payload = Object.fromEntries(formData.entries());

    if (!payload.email || !payload.otp) {
      alert("Please enter your email and OTP.");
      return;
    }

    verifyBtn.disabled = true;
    verifyBtn.textContent = "Verifying...";

    const response = await axios.post("/api/v1/user/verify-signup", payload);

    if (response.data && response.data.success) {
      alert("Account created successfully!");
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } else {
      throw new Error(response.data?.message || "Verification failed");
    }
  } catch (error) {
    console.error('Verification error:', error);
    const errorMessage = error.response?.data?.message || error.message || "Verification failed";
    alert(errorMessage);
    
    // If account already exists, redirect to login
    if (errorMessage.includes("already exists")) {
      setTimeout(() => {
        loginBtn.click(); // Switch to login form
      }, 1500);
    }
  } finally {
    verifyBtn.disabled = false;
    verifyBtn.textContent = "Verify & Create Account";
  }
});
