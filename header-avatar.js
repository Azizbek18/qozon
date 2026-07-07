/**
 * Qozon — Header profil-avatar
 * Har qanday sahifada `[data-header-avatar]` belgisiga ega havolani
 * haqiqiy profil rasmi bilan to'ldiradi; rasm bo'lmasa fallback icon qoladi.
 */
(function () {
    const SUPABASE_URL = 'https://usoekoycypxbcxzwoaea.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_BL1ADSdK5cXfmXI4rrTmRA_eixc8I0-';

    // Eski hisoblarga tasodifan yozib qo'yilgan umumiy placeholder rasm —
    // haqiqiy profil surati emas, shu sabab icon fallback ko'rsatiladi.
    function isRealAvatar(url) {
        return !!url && !url.includes('user-male-circle');
    }

    function setAvatar(container, url) {
        const img = container.querySelector('.header-avatar-img');
        const icon = container.querySelector('.header-avatar-fallback');
        if (!img || !icon) return;
        if (isRealAvatar(url)) {
            img.src = url;
            img.style.display = 'block';
            icon.style.display = 'none';
        } else {
            img.style.display = 'none';
            img.removeAttribute('src');
            icon.style.display = 'flex';
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        const containers = document.querySelectorAll('[data-header-avatar]');
        if (!containers.length || typeof supabase === 'undefined') return;

        containers.forEach(container => {
            const img = container.querySelector('.header-avatar-img');
            if (img) img.addEventListener('error', () => setAvatar(container, ''));
        });

        const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

        client.auth.getSession().then(({ data: { session } }) => {
            if (!session) return;
            client
                .from('profiles')
                .select('avatar_url')
                .eq('id', session.user.id)
                .single()
                .then(({ data: profile }) => {
                    containers.forEach(container => setAvatar(container, profile?.avatar_url || ''));
                })
                .catch(err => console.error('Header avatar fetch failed:', err));
        }).catch(err => console.error('Header avatar session check failed:', err));
    });
})();
