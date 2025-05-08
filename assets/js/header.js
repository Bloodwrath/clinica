document.addEventListener('DOMContentLoaded', function () {
    // Espera a que el header esté cargado por fetch
    setTimeout(function () {
        const toggle = document.getElementById('headerMenuToggle');
        const menu = document.getElementById('mainMenu');
        function updateMenuDisplay() {
            if (window.innerWidth > 991) {
                menu.classList.remove('show-menu-mobile');
                menu.style.display = '';
                toggle.setAttribute('aria-expanded', 'false');
            } else {
                if (!menu.classList.contains('show-menu-mobile')) {
                    menu.style.display = 'none';
                }
            }
        }
        updateMenuDisplay();
        if (toggle && menu) {
            toggle.addEventListener('click', function (e) {
                e.stopPropagation();
                const isOpen = menu.classList.toggle('show-menu-mobile');
                toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
                menu.style.display = isOpen ? 'flex' : 'none';
            });
            // Cierra el menú al hacer clic fuera del menú
            document.addEventListener('click', function (e) {
                if (window.innerWidth <= 991 && menu.classList.contains('show-menu-mobile')) {
                    if (!menu.contains(e.target) && e.target !== toggle) {
                        menu.classList.remove('show-menu-mobile');
                        menu.style.display = 'none';
                        toggle.setAttribute('aria-expanded', 'false');
                    }
                }
            });
            // Cierra el menú al hacer clic en un enlace
            menu.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', function () {
                    if (window.innerWidth <= 991) {
                        menu.classList.remove('show-menu-mobile');
                        menu.style.display = 'none';
                        toggle.setAttribute('aria-expanded', 'false');
                    }
                });
            });
        }
        window.addEventListener('resize', updateMenuDisplay);
    }, 0);
});