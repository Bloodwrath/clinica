// Manejo del formulario de contacto
document.getElementById('contact-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    const status = document.getElementById('form-status');
    status.textContent = "Enviando...";
    const data = {
        nombre: document.getElementById('nombre').value,
        email: document.getElementById('email').value,
        mensaje: document.getElementById('mensaje').value
    };
    const formspreeEndpoint = "https://formspree.io/f/mwpoaveb";
    try {
        const res = await fetch(formspreeEndpoint, {
            method: "POST",
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nombre: data.nombre,
                email: data.email,
                mensaje: data.mensaje,
                _subject: "Nuevo mensaje de contacto desde la web"
            })
        });
        if (res.ok) {
            status.textContent = "¡Mensaje enviado! Nos pondremos en contacto contigo pronto.";
            this.reset();
        } else {
            status.textContent = "Ocurrió un error al enviar el mensaje. Intenta de nuevo más tarde.";
        }
        if (window.innerWidth < 600) {
            status.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    } catch {
        status.textContent = "Ocurrió un error al enviar el mensaje. Intenta de nuevo más tarde.";
        if (window.innerWidth < 600) {
            status.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }
});
