document.addEventListener('DOMContentLoaded', () => {
    
    // =========================================================
    // 1. INICIALIZACIÓN DE LENIS (Scroll Suave)
    // =========================================================
    const lenis = new Lenis({
        duration: 0,        // Velocidad (más alto = más lento/suave)
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Curva física
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: false,
        mouseMultiplier: 1,   // Sensibilidad del mouse
        smoothTouch: false,   // Desactivado en móvil (recomendado para rendimiento)
        touchMultiplier: 2,
    });

    // Loop de animación (Necesario para que Lenis funcione)
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // =========================================================
    // 2. CARGA DE COMPONENTES (Header y Footer)
    // =========================================================
    loadComponents();
});

async function loadComponents() {
    try {
        // Cargar Header
        const headerRes = await fetch('components/header.html');
        if(headerRes.ok) {
            document.getElementById('header-placeholder').innerHTML = await headerRes.text();
        }

        // Cargar Footer
        const footerRes = await fetch('components/footer.html');
        if(footerRes.ok) {
            document.getElementById('footer-placeholder').innerHTML = await footerRes.text();
        }

        // Una vez que el HTML existe, iniciamos la lógica de la UI
        initAppLogic();

    } catch (error) {
        console.error('Error cargando componentes:', error);
    }
}

// =========================================================
// 3. LÓGICA PRINCIPAL DE LA APP
// =========================================================
function initAppLogic() {
    
    /* --- A. HEADER PEGAJOSO (Sticky Header) --- */
    const header = document.querySelector('.main-header');
    
    // Función para detectar scroll
    const handleScroll = () => {
        if(window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Checar al cargar por si ya estamos abajo


    /* --- B. MENÚ HAMBURGUESA (Móvil) --- */
    const hamburgerBtn = document.querySelector('.hamburger-menu');
    const navMenu = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.navbar a');

    if(hamburgerBtn && navMenu) {
        
        function toggleMenu() {
            const isOpened = hamburgerBtn.getAttribute('aria-expanded') === 'true';
            
            // Cambiar estado del botón (animación X)
            hamburgerBtn.setAttribute('aria-expanded', !isOpened);
            
            // Mostrar/Ocultar menú
            navMenu.classList.toggle('active');
            
            // Bloquear scroll del cuerpo cuando el menú está abierto
            document.body.style.overflow = isOpened ? 'auto' : 'hidden';
        }

        hamburgerBtn.addEventListener('click', toggleMenu);

        // Cerrar menú al dar clic en un enlace
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if(navMenu.classList.contains('active')) {
                    toggleMenu();
                }
            });
        });
    }


    /* --- C. SCROLL REVEAL (Animaciones al bajar) --- */
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1 // Se activa cuando el 10% del elemento es visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Dejar de observar una vez animado
            }
        });
    }, observerOptions);

    // Seleccionamos todos los elementos con la clase "reveal"
    const elementsToReveal = document.querySelectorAll('.reveal');
    elementsToReveal.forEach(el => observer.observe(el));


    /* --- D. ALERTAS PERSONALIZADAS (Modal) --- */
    
    // 1. Definir elementos del modal
    const modalOverlay = document.getElementById('custom-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const modalIcon = document.getElementById('modal-icon');
    const modalCloseBtn = document.getElementById('modal-close');

    // 2. Función para mostrar el modal
    function showModal(title, message, type) {
        if(!modalOverlay) return;

        modalTitle.textContent = title;
        modalMessage.textContent = message;

        // Cambiar icono según el tipo (éxito o error)
        if (type === 'success') {
            // Icono de Check (Palomita)
            modalIcon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
            modalIcon.style.backgroundColor = '#D4Cfb0'; // Beige
        } else {
            // Icono de X (Error)
            modalIcon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
            modalIcon.style.backgroundColor = '#ff6b6b'; // Rojo suave
        }

        // Mostrar modal
        modalOverlay.classList.add('active');
    }

    // 3. Función para cerrar modal
    if(modalCloseBtn) {
        modalCloseBtn.addEventListener('click', () => {
            modalOverlay.classList.remove('active');
            cleanURL(); // Limpiar URL al cerrar
        });
    }

    // Cerrar si hacen clic fuera de la tarjeta (en el fondo oscuro)
    if(modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                modalOverlay.classList.remove('active');
                cleanURL();
            }
        });
    }

    // 4. Leer parámetros de URL y activar modal
    const urlParams = new URLSearchParams(window.location.search);
    const estado = urlParams.get('estado');

    if (estado === 'exito') {
        showModal(
            "¡Mensaje Enviado!", 
            "Gracias por contactarnos. Hemos recibido tu información y nos pondremos en contacto contigo a la brevedad.", 
            "success"
        );
    } else if (estado === 'error_datos') {
        showModal(
            "Datos Incompletos", 
            "Por favor verifica que todos los campos estén llenos correctamente.", 
            "error"
        );
    } else if (estado === 'error_servidor') {
        showModal(
            "Error de Envío", 
            "Hubo un problema al enviar el formulario. Por favor intenta más tarde o llámanos directamente.", 
            "error"
        );
    }
}

// Función auxiliar para limpiar parámetros de URL sin recargar
function cleanURL() {
    window.history.replaceState({}, document.title, window.location.pathname);
}