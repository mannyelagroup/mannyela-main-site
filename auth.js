/**
 * ══════════════════════════════════════════════════════════════════════════════
 * MAISON MANNYELA — auth.js
 * Version : 1.9 · Juin 2026
 * ──────────────────────────────────────────────────────────────────────────────
 * Supabase Project : https://qiarpsfiadpxckqayrrr.supabase.co
 * ──────────────────────────────────────────────────────────────────────────────
 * Contents :
 *   1.  Supabase initialization
 *   2.  onAuthStateChange listener
 *   3.  checkPasswordResetToken()
 *   4.  renderLogin()
 *   5.  doLogin()
 *   6.  logout()
 *   7.  renderRegister()
 *   8.  doRegister()
 *   9.  renderForgotPassword()
 *  10.  doForgotPassword()
 *  11.  renderResetPassword()
 *  12.  doResetPassword()
 *  13.  togglePasswordVisibility()
 * ══════════════════════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────────────────────
// 1. SUPABASE INITIALIZATION
//    Waits for the CDN to load then creates the client.
//    Sets both window._supabaseClient AND window.supabase.
// ─────────────────────────────────────────────────────────────────────────────
(function initSupabase() {
  var SUPABASE_URL = 'https://qiarpsfiadpxckqayrrr.supabase.co';
  var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpYXJwc2ZpYWRweGNrcWF5cnJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5NTM1MDUsImV4cCI6MjA5NDUyOTUwNX0._qiQGGEG0o9rLVqaMmJNwBfDkHSXdw_rr-v6ZSPEcME';

  if (window._supabaseClient) return;

  if (typeof supabase === 'undefined' || !supabase.createClient) {
    setTimeout(initSupabase, 200);
    return;
  }

  window._supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  window.supabase        = window._supabaseClient;
  console.log('Mannyela Auth: Supabase initialized ✦');
})();


// ─────────────────────────────────────────────────────────────────────────────
// 2. SUPABASE AUTH STATE LISTENER
//    PASSWORD_RECOVERY → redirect to reset-password page
//    SIGNED_IN         → update local state
//    SIGNED_OUT        → clear state, go to landing
// ─────────────────────────────────────────────────────────────────────────────
(function() {
  function initAuthListener() {
    var client = window._supabaseClient || window.supabase;
    if (!client || !client.auth) { setTimeout(initAuthListener, 500); return; }

    client.auth.onAuthStateChange(function(event, session) {

      if (event === 'PASSWORD_RECOVERY') {
        console.log('Mannyela Auth: PASSWORD_RECOVERY token received');
        if (typeof goTo === 'function') goTo('reset-password');
      }

      if (event === 'SIGNED_IN' && session) {
        if (typeof state !== 'undefined' && !state.isLoggedIn) {
          state.isLoggedIn = true;
          state.user = {
            email : session.user.email,
            name  : (session.user.user_metadata && session.user.user_metadata.name)
                    ? session.user.user_metadata.name
                    : session.user.email.split('@')[0],
            id    : session.user.id
          };
        }
      }

      if (event === 'SIGNED_OUT') {
        if (typeof state !== 'undefined') { state.isLoggedIn = false; state.user = null; }
        if (typeof goTo === 'function') goTo('landing');
      }
    });

    console.log('Mannyela Auth: listener active ✦');
  }
  initAuthListener();
})();


// ─────────────────────────────────────────────────────────────────────────────
// 3. CHECK PASSWORD RESET TOKEN
//    Called on DOMContentLoaded.
//    Detects Supabase recovery token in the URL hash or query string.
// ─────────────────────────────────────────────────────────────────────────────
function checkPasswordResetToken() {
  var hash   = window.location.hash   || '';
  var search = window.location.search || '';
  if (
    hash.includes('type=recovery')   ||
    hash.includes('type=signup')     ||
    search.includes('reset=true')    ||
    search.includes('type=recovery')
  ) {
    if (typeof goTo === 'function') goTo('reset-password');
  }
}

document.addEventListener('DOMContentLoaded', function() {
  checkPasswordResetToken();
});


// ─────────────────────────────────────────────────────────────────────────────
// 4. RENDER LOGIN
//    Field IDs : #login-email  ·  #login-password
// ─────────────────────────────────────────────────────────────────────────────
function renderLogin() {
  render(`
    <div class="max-w-sm mx-auto fade-in">
      <div class="text-center mb-10">
        <p class="font-cinzel text-[9px] tracking-[0.5em] text-accent/30 uppercase mb-4">Espace personnel</p>
        <h2 class="font-cinzel text-2xl text-white/90 mb-3">Connexion</h2>
        <div class="h-px w-12 bg-accent/20 mx-auto mb-6"></div>
      </div>
      <div class="flex flex-col gap-4">
        <input class="input-mannyela" type="email"
               placeholder="Email"
               id="login-email"
               style="width:100%;">
        <div style="position:relative;">
          <input class="input-mannyela" type="password"
                 placeholder="Mot de passe"
                 id="login-password"
                 style="width:100%;padding-right:3rem;">
          <button type="button"
                  onclick="togglePasswordVisibility('login-password',this)"
                  style="position:absolute;right:.75rem;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:rgba(245,245,220,.3);font-size:12px;">👁</button>
        </div>
        <div id="login-error" style="color:#e07070;font-size:10px;display:none;text-align:center;"></div>
        <button class="btn-mannyela full mt-2" onclick="doLogin()">Se connecter</button>
        <p style="font-size:9px;color:rgba(245,245,220,.25);text-align:center;cursor:pointer;margin-top:.35rem;"
           onclick="goTo('forgot')">Mot de passe oublié ?</p>
        <p style="font-size:9px;color:rgba(245,245,220,.25);text-align:center;margin-top:.5rem;">
          Pas encore de compte ?
          <span onclick="goTo('register')" style="color:rgba(196,149,106,.6);cursor:pointer;">Créer un compte</span>
        </p>
      </div>
    </div>
  `);
}


// ─────────────────────────────────────────────────────────────────────────────
// 5. DO LOGIN
//    Tries Supabase signInWithPassword first, falls back to local accounts.
//    Reads : #login-email  ·  #login-password
// ─────────────────────────────────────────────────────────────────────────────
async function doLogin() {
  var client = window._supabaseClient || window.supabase;
  var email  = ((document.getElementById('login-email')    || {value:''}).value || '').trim().toLowerCase();
  var pwd    = ((document.getElementById('login-password') || {value:''}).value || '');

  if (!email || !pwd) { showNotify('Email et mot de passe requis'); return; }

  // ── Supabase auth ────────────────────────────────────────────────────────
  if (client && client.auth) {
    try {
      var res = await client.auth.signInWithPassword({ email: email, password: pwd });
      if (res.error) throw res.error;
      if (res.data && res.data.user) {
        state.isLoggedIn = true;
        state.user = {
          email : res.data.user.email,
          name  : (res.data.user.user_metadata && res.data.user.user_metadata.name)
                  ? res.data.user.user_metadata.name
                  : res.data.user.email.split('@')[0],
          id    : res.data.user.id
        };
        showNotify('Bienvenue ✦');
        goTo('dashboard');
        return;
      }
    } catch(e) {
      var errEl = document.getElementById('login-error');
      if (errEl) { errEl.textContent = 'Email ou mot de passe incorrect'; errEl.style.display = 'block'; }
      showNotify('Email ou mot de passe incorrect');
      return;
    }
  }

  // ── Local fallback (demo mode) ───────────────────────────────────────────
  var account = (typeof CLIENT_ACCOUNTS !== 'undefined') ? CLIENT_ACCOUNTS[email] : null;
  if (!account || account.pwd !== pwd) { showNotify('Email ou mot de passe incorrect'); return; }
  state.isLoggedIn = true;
  state.user = { email: email, name: account.name || email.split('@')[0], plan: account.plan || 'plante', isAdmin: account.admin || false };
  showNotify('Bienvenue ✦');
  goTo('dashboard');
}


// ─────────────────────────────────────────────────────────────────────────────
// 6. LOGOUT
// ─────────────────────────────────────────────────────────────────────────────
async function logout() {
  var client = window._supabaseClient || window.supabase;
  if (client && client.auth) { try { await client.auth.signOut(); } catch(e) {} }
  state.isLoggedIn = false;
  state.user = null;
  if (typeof renderAuthBar === 'function') renderAuthBar();
  showNotify('À bientôt !');
  goTo('landing');
}


// ─────────────────────────────────────────────────────────────────────────────
// 7. RENDER REGISTER
// ─────────────────────────────────────────────────────────────────────────────
function renderRegister() {
  render(`
    <div class="max-w-sm mx-auto fade-in">
      <div class="text-center mb-10">
        <p class="font-cinzel text-[9px] tracking-[0.5em] text-accent/30 uppercase mb-4">Rejoindre Mannyela</p>
        <h2 class="font-cinzel text-2xl text-white/90 mb-3">Créer un compte</h2>
        <div class="h-px w-12 bg-accent/20 mx-auto mb-6"></div>
        <p style="font-size:11px;color:rgba(245,245,220,.35);line-height:1.8;">Commence gratuitement avec le plan La Plante ✦</p>
      </div>
      <div class="flex flex-col gap-4">
        <input class="input-mannyela" type="text"     placeholder="Prénom"                        id="reg-name"     style="width:100%;">
        <input class="input-mannyela" type="email"    placeholder="Email"                         id="reg-email"    style="width:100%;">
        <div style="position:relative;">
          <input class="input-mannyela" type="password" placeholder="Mot de passe (8 car. min.)" id="reg-password" style="width:100%;padding-right:3rem;">
          <button type="button" onclick="togglePasswordVisibility('reg-password',this)"
                  style="position:absolute;right:.75rem;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:rgba(245,245,220,.3);font-size:12px;">👁</button>
        </div>
        <div id="reg-error" style="color:#e07070;font-size:10px;display:none;text-align:center;"></div>
        <button class="btn-mannyela full mt-2" onclick="doRegister()">Créer mon compte ✦</button>
        <p style="font-size:9px;color:rgba(245,245,220,.25);text-align:center;">
          Déjà un compte ?
          <span onclick="goTo('login')" style="color:rgba(196,149,106,.6);cursor:pointer;">Se connecter</span>
        </p>
      </div>
    </div>
  `);
}


// ─────────────────────────────────────────────────────────────────────────────
// 8. DO REGISTER
// ─────────────────────────────────────────────────────────────────────────────
async function doRegister() {
  var name  = ((document.getElementById('reg-name')    && document.getElementById('reg-name').value)     || '').trim();
  var email = ((document.getElementById('reg-email')   && document.getElementById('reg-email').value)    || '').trim().toLowerCase();
  var pwd   = ((document.getElementById('reg-password')&& document.getElementById('reg-password').value) || '').trim();
  var errEl = document.getElementById('reg-error');

  if (!name)                        { showNotify('Prénom requis'); return; }
  if (!email || !email.includes('@')){ showNotify('Email invalide'); return; }
  if (pwd.length < 8)               { showNotify('8 caractères minimum'); return; }

  var client = window._supabaseClient || window.supabase;
  if (client && client.auth) {
    try {
      var res = await client.auth.signUp({ email: email, password: pwd, options: { data: { name: name } } });
      if (res.error) throw res.error;
      showNotify('✦ Compte créé — vérifiez votre boîte mail');
      setTimeout(function() { goTo('login'); }, 2500);
      return;
    } catch(e) {
      if (errEl) { errEl.textContent = e.message; errEl.style.display = 'block'; }
      showNotify('Erreur : ' + e.message);
      return;
    }
  }

  // Local demo fallback
  state.isLoggedIn = true;
  state.user = { email: email, name: name, plan: 'plante' };
  showNotify('✦ Bienvenue ' + name);
  goTo('dashboard');
}


// ─────────────────────────────────────────────────────────────────────────────
// 9. RENDER FORGOT PASSWORD
// ─────────────────────────────────────────────────────────────────────────────
function renderForgotPassword() {
  render(`
    <div class="max-w-sm mx-auto fade-in">
      <div class="text-center mb-10">
        <p class="font-cinzel text-[9px] tracking-[0.5em] text-accent/30 uppercase mb-4">Récupération</p>
        <h2 class="font-cinzel text-2xl text-white/90 mb-3">Mot de passe oublié</h2>
        <div class="h-px w-12 bg-accent/20 mx-auto mb-6"></div>
        <p style="font-size:11px;color:rgba(245,245,220,.35);line-height:1.8;">
          Entrez votre email — nous vous envoyons un lien de réinitialisation.
        </p>
      </div>
      <div class="flex flex-col gap-4">
        <input class="input-mannyela" type="email" placeholder="Votre email" id="forgot-email" style="width:100%;">
        <button class="btn-mannyela w-full mt-2" onclick="doForgotPassword()">Envoyer le lien ✦</button>
        <p style="font-size:9px;color:rgba(245,245,220,.25);text-align:center;cursor:pointer;margin-top:.5rem;"
           onclick="goTo('login')">← Retour à la connexion</p>
      </div>
    </div>
  `);
}


// ─────────────────────────────────────────────────────────────────────────────
// 10. DO FORGOT PASSWORD
//     supabase.auth.resetPasswordForEmail()
//     redirectTo : origin + ?reset=true
// ─────────────────────────────────────────────────────────────────────────────
async function doForgotPassword() {
  var email = ((document.getElementById('forgot-email') && document.getElementById('forgot-email').value) || '').trim().toLowerCase();
  if (!email || !email.includes('@')) { showNotify('Veuillez entrer une adresse email valide'); return; }

  var client = window._supabaseClient || window.supabase;
  if (client && client.auth) {
    try {
      var res = await client.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + window.location.pathname + '?reset=true'
      });
      if (res.error) throw res.error;
      showNotify('✦ Lien envoyé — vérifiez votre boîte mail');
      setTimeout(function() { goTo('login'); }, 3000);
      return;
    } catch(e) { console.warn('Supabase reset error:', e.message); }
  }
  // Generic message — do not reveal whether account exists
  showNotify('✦ Si ce compte existe, un email vous a été envoyé');
  setTimeout(function() { goTo('login'); }, 2500);
}


// ─────────────────────────────────────────────────────────────────────────────
// 11. RENDER RESET PASSWORD
//     Shown after PASSWORD_RECOVERY token is detected.
// ─────────────────────────────────────────────────────────────────────────────
function renderResetPassword() {
  render(`
    <div class="max-w-sm mx-auto fade-in">
      <div class="text-center mb-10">
        <p class="font-cinzel text-[9px] tracking-[0.5em] text-accent/30 uppercase mb-4">Nouveau mot de passe</p>
        <h2 class="font-cinzel text-2xl text-white/90 mb-3">Réinitialisation</h2>
        <div class="h-px w-12 bg-accent/20 mx-auto mb-6"></div>
        <p style="font-size:11px;color:rgba(245,245,220,.35);line-height:1.8;">Choisissez votre nouveau mot de passe.</p>
      </div>
      <div class="flex flex-col gap-4">
        <input class="input-mannyela" type="password" placeholder="Nouveau mot de passe"      id="reset-pwd1" style="width:100%;">
        <input class="input-mannyela" type="password" placeholder="Confirmer le mot de passe" id="reset-pwd2" style="width:100%;">
        <button class="btn-mannyela w-full mt-2" onclick="doResetPassword()">Enregistrer ✦</button>
      </div>
    </div>
  `);
}


// ─────────────────────────────────────────────────────────────────────────────
// 12. DO RESET PASSWORD
//     supabase.auth.updateUser({ password }) — requires active recovery session.
// ─────────────────────────────────────────────────────────────────────────────
async function doResetPassword() {
  var p1 = ((document.getElementById('reset-pwd1') && document.getElementById('reset-pwd1').value) || '').trim();
  var p2 = ((document.getElementById('reset-pwd2') && document.getElementById('reset-pwd2').value) || '').trim();

  if (!p1 || p1.length < 8) { showNotify('8 caractères minimum'); return; }
  if (p1 !== p2)             { showNotify('Les mots de passe ne correspondent pas'); return; }

  var client = window._supabaseClient || window.supabase;
  window.supabase = client;

  if (client && client.auth) {
    try {
      var res = await client.auth.updateUser({ password: p1 });
      if (res.error) throw res.error;
      showNotify('✦ Mot de passe mis à jour — vous pouvez vous connecter');
      setTimeout(function() { goTo('login'); }, 2500);
      return;
    } catch(e) { showNotify('Erreur : ' + e.message); return; }
  }

  showNotify('✦ Mot de passe mis à jour');
  setTimeout(function() { goTo('login'); }, 2000);
}


// ─────────────────────────────────────────────────────────────────────────────
// 13. UTILITY — Toggle password visibility
// ─────────────────────────────────────────────────────────────────────────────
function togglePasswordVisibility(inputId, btn) {
  var input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === 'password') { input.type = 'text';     if (btn) btn.textContent = '🙈'; }
  else                           { input.type = 'password'; if (btn) btn.textContent = '👁';  }
}
