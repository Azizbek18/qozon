(function() {
    const SUPABASE_URL = 'https://usoekoycypxbcxzwoaea.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_BL1ADSdK5cXfmXI4rrTmRA_eixc8I0-';
    
    // Inject CSS to hide body immediately during head parsing (prevents content flash)
    const style = document.createElement('style');
    style.id = 'auth-guard-style';
    style.innerHTML = 'body { display: none !important; }';
    document.head.appendChild(style);

    function redirectToLogin() {
        let role = 'mijoz';
        const path = window.location.pathname.toLowerCase();
        if (path.includes('menu.html') || path.includes('daromad.html') || path.includes('oshpazlaronboard.html') || path.includes('xurmoopa%202') || path.includes('xurmoopa 2') || path.includes('profil.html') || path.includes('chefdashboard.html')) {
            role = 'oshpaz';
        }
        window.location.href = 'kirish.html?role=' + role;
    }

    if (typeof supabase !== 'undefined') {
        const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        
        // Query current session status
        client.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                redirectToLogin();
            } else {
                // Reveal body if authenticated
                const s = document.getElementById('auth-guard-style');
                if (s) s.remove();
            }
        }).catch(err => {
            console.error("Auth guard check failed:", err);
            redirectToLogin();
        });

        // Listen for signed-out events in real-time
        client.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT' || !session) {
                redirectToLogin();
            }
        });
    } else {
        console.warn("Supabase library not loaded. Bypassing auth guard.");
        const s = document.getElementById('auth-guard-style');
        if (s) s.remove();
    }
})();
