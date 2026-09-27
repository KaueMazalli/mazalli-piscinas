/* =========================================================
   MAZALLI PISCINAS
   JAVASCRIPT
========================================================= */

const SUPABASE_URL = "https://xthfwqhxhlrjnqbbjepk.supabase.co";
const SUPABASE_KEY = "sb_publishable_TdGK1NkytskI75f8wZq8JA__NI4fg4m";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

function escapeHTML(value = "") {
    return String(value).replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    }[char]));
}

document.addEventListener("DOMContentLoaded", () => {
    const WHATSAPP_NUMBER = "5517997321804";
    const WHATSAPP_MESSAGE = "Olá! Gostaria de solicitar um orçamento para uma piscina.";
    const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

    document.querySelectorAll(".js-whatsapp").forEach((link) => {
        link.href = whatsappURL;
    });

    const header = document.querySelector(".site-header");

    function updateHeader() {
        if (!header) return;
        header.classList.toggle("scrolled", window.scrollY > 20);
    }

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });

    const menuToggle = document.getElementById("menuToggle");
    const mainNav = document.getElementById("mainNav");

    if (menuToggle && mainNav) {
        function closeMenu() {
            menuToggle.classList.remove("active");
            mainNav.classList.remove("open");
            document.body.classList.remove("menu-open");
            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.setAttribute("aria-label", "Abrir menu");
        }

        menuToggle.addEventListener("click", () => {
            const opened = mainNav.classList.toggle("open");
            menuToggle.classList.toggle("active", opened);
            document.body.classList.toggle("menu-open", opened);
            menuToggle.setAttribute("aria-expanded", String(opened));
            menuToggle.setAttribute("aria-label", opened ? "Fechar menu" : "Abrir menu");
        });

        mainNav.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", closeMenu);
        });

        document.addEventListener("click", (event) => {
            if (!mainNav.contains(event.target) &&
                !menuToggle.contains(event.target) &&
                mainNav.classList.contains("open")) {
                closeMenu();
            }
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && mainNav.classList.contains("open")) {
                closeMenu();
            }
        });
    }

    const currentYear = document.getElementById("currentYear");
    if (currentYear) currentYear.textContent = new Date().getFullYear();

    const revealElements = document.querySelectorAll(
        ".project-card, .about-image, .about-content, .contact-cta"
    );

    if ("IntersectionObserver" in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("reveal", "is-visible");
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.15 });

        revealElements.forEach((element) => {
            element.classList.add("reveal");
            revealObserver.observe(element);
        });
    } else {
        revealElements.forEach((element) => {
            element.classList.add("reveal", "is-visible");
        });
    }
});

async function carregarProjetosHome() {
    const container = document.getElementById("homeProjetos");
    if (!container) return;

    const { data, error } = await supabaseClient
        .from("projetos")
        .select("id,titulo,descricao,imagem,created_at")
        .order("created_at", { ascending: false })
        .limit(4);

    if (error) {
        console.error("Erro Supabase:", error);
        container.innerHTML = `
            <p class="projects-state projects-state-error" role="alert">
                Não foi possível carregar os projetos no momento.
            </p>
        `;
        return;
    }

    if (!data?.length) {
        container.innerHTML = `
            <p class="projects-state" role="status">
                Novos projetos serão adicionados em breve.
            </p>
        `;
        return;
    }

    container.innerHTML = data.map((projeto) => {
        const titulo = escapeHTML(projeto.titulo);
        const imagem = escapeHTML(projeto.imagem);

        return `
            <article class="project-card">
                <div class="project-image">
                    <img
                        src="${imagem}"
                        alt="${titulo}"
                        loading="lazy"
                    >
                </div>
            </article>
        `;
    }).join("");
}

carregarProjetosHome();