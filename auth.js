// Initialize Supabase client globally
const supabase = window.supabase;

// 1. CLIENT SIGN UP LOGIC
async function handleSignUp(email, password) {
    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
        });
        if (error) throw error;
        alert("Succès ! Un lien de confirmation a été envoyé à votre adresse email. Veuillez vérifier votre boîte de réception.");
        return data;
    } catch (error) {
        alert("Erreur d'inscription: " + error.message);
        console.error(error);
    }
}

// 2. CLIENT LOGIN LOGIC
async function handleLogin(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });
        if (error) throw error;
        alert("Connexion réussie ! Redirection vers votre espace...");
        window.location.href = "/dashboard.html"; // Redirects to client dashboard
        return data;
    } catch (error) {
        alert("Erreur de connexion: " + error.message);
        console.error(error);
    }
}

// 3. AUTOMATIC DOM EVENT HANDLERS
// This listens for clicks on your existing form setup dynamically
document.addEventListener("click", function(event) {
    // Look for a login button click
    if (event.target && event.target.innerText && event.target.innerText.includes("Connexion")) {
        const emailInput = document.getElementById("login-email");
        const passwordInput = document.getElementById("login-pass");
        
        if (emailInput && passwordInput) {
            event.preventDefault();
            handleLogin(emailInput.value, passwordInput.value);
        }
    }

    // Look for a registration button click
    if (event.target && event.target.innerText && event.target.innerText.includes("Rejoindre")) {
        const emailInput = document.getElementById("reg-email");
        // Dynamically searching for the password element inside the registration template
        const passwordInput = document.getElementById("reg-pass") || document.querySelector("input[type='password']");
        
        if (emailInput && passwordInput) {
            event.preventDefault();
            handleSignUp(emailInput.value, passwordInput.value);
        }
    }
});
