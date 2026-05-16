// Initialize Supabase using the window global package
const supabase = window.supabase; 

// 1. CLIENT SIGN UP FUNCTION
async function handleSignUp(email, password) {
    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
        });

        if (error) throw error;

        // Dynamic alert letting them know a real confirmation email was sent via your server
        alert("Success! A confirmation link has been sent to your email address. Please check your inbox to verify your account.");
        return data;
    } catch (error) {
        alert("Sign Up Error: " + error.message);
        console.error(error);
    }
}

// 2. CLIENT LOGIN FUNCTION
async function handleLogin(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) throw error;

        alert("Welcome back! Redirecting to platform dashboard...");
        window.location.href = "/dashboard.html"; // Redirects client to dashboard after login
        return data;
    } catch (error) {
        alert("Login Error: " + error.message);
        console.error(error);
    }
}
