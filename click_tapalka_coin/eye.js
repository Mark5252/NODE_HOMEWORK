document.addEventListener("DOMContentLoaded", function () {
    const passwordInput = document.getElementById("pass");
    const togglePassword = document.getElementById("togglePassword");

    togglePassword.addEventListener("click", function () {
        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            togglePassword.src = "close.png";
        } else {
            passwordInput.type = "password";
            togglePassword.src = "Show.png";
        }
    });
});