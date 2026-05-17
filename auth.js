// ═══════════════════════════════════════════════════════════════
// auth.js — Mannyela · Supabase Authentication
// Compatible avec window._supabaseClient (initialisé dans index.html)
// ═══════════════════════════════════════════════════════════════

// Résout le client Supabase quelle que soit la source
function getSupabaseClient() {
  return window._supabaseClient
    || window.supabase?.createClient && window.supabase
    || null;
}

// ─── 1. INSCRIPTION CLIENT ────────────────────────────────────────────────────
async function handleSignUp(email, password) {
  // Compatibilité avec l'initialisation dans index.html
  window.supabase = window.supabase || window._supabaseClient;
  const client = getSupabaseClient();

  if (!client) {
    console.error('[auth.js] Supabase client introuvable.');
    return;
  }

  try {
    const { data, error } = await client.auth.signUp({
      email: email,
      password: password,
    });
    if (error) throw error;
    alert('Succès ! Un lien de confirmation a été envoyé à votre adresse email. Veuillez vérifier votre boîte de réception.');
    return data;
  } catch (error) {
    alert("Erreur d'inscription : " + error.message);
    console.error('[auth.js handleSignUp]', error);
  }
}

// ─── 2. CONNEXION CLIENT ──────────────────────────────────────────────────────
async function handleLogin(email, password) {
  // Compatibilité avec l'initialisation dans index.html
  window.supabase = window.supabase || window._supabaseClient;
  const client = getSupabaseClient();

  if (!client) {
    console.error('[auth.js] Supabase client introuvable.');
    return;
  }

  try {
    const { data, error } = await client.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (error) throw error;
    alert('Connexion réussie ! Redirection vers votre espace...');
    window.location.href = '/dashboard.html';
    return data;
  } catch (error) {
    alert('Erreur de connexion : ' + error.message);
    console.error('[auth.js handleLogin]', error);
  }
}

// ─── 3. DÉCONNEXION ───────────────────────────────────────────────────────────
async function handleLogout() {
  window.supabase = window.supabase || window._supabaseClient;
  const client = getSupabaseClient();
  if (!client) return;

  try {
    await client.auth.signOut();
    window.location.href = '/';
  } catch (error) {
    console.error('[auth.js handleLogout]', error);
  }
}

// ─── 4. ÉCOUTEURS DOM AUTOMATIQUES ───────────────────────────────────────────
// Note : doRegister() dans index.html gère déjà l'inscription complète
// (validation, CGU, Supabase, fallback local). Ces écouteurs sont un filet
// de sécurité supplémentaire pour les boutons hors du flux principal.

document.addEventListener('click', function (event) {
  const target = event.target;
  if (!target || !target.innerText) return;

  const text = target.innerText.trim();

  // Bouton de connexion
  if (text.includes('Connexion') || text.includes('Se connecter')) {
    const emailInput    = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-pass');
    if (emailInput && passwordInput) {
      event.preventDefault();
      handleLogin(emailInput.value, passwordInput.value);
    }
  }

  // Bouton d'inscription — uniquement si doRegister() n'est pas disponible
  // (évite le double appel : index.html gère déjà ce cas)
  if (
    (text.includes('Rejoindre') || text.includes('Créer mon compte')) &&
    typeof window.doRegister !== 'function'
  ) {
    const emailInput    = document.getElementById('reg-email');
    const passwordInput = document.getElementById('reg-pass')
                       || document.querySelector("input[type='password']");
    if (emailInput && passwordInput) {
      event.preventDefault();
      handleSignUp(emailInput.value, passwordInput.value);
    }
  }
});
