/* =====================================================
   MAZALLI PISCINAS
   GALERIA DINÂMICA
===================================================== */

const SUPABASE_URL = "https://xthfwqhxhlrjnqbbjepk.supabase.co";
const SUPABASE_KEY = "sb_publishable_TdGK1NkytskI75f8wZq8JA__NI4fg4m";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const galeria = document.getElementById("galeria");

function escapeHTML(value = "") {
    return String(value).replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    }[char]));
}

async function carregarGaleria() {
    if (!galeria) return;

    galeria.innerHTML = "<p role=\"status\">Carregando projetos...</p>";

    const { data, error } = await supabaseClient
        .from("projetos")
        .select("id,titulo,descricao,imagem,created_at")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Erro Supabase:", error);
        galeria.innerHTML = `
            <p role="alert">Não foi possível carregar os projetos no momento.</p>
        `;
        return;
    }

    if (!data?.length) {
        galeria.innerHTML = `
            <p role="status">Novos projetos serão adicionados em breve.</p>
        `;
        return;
    }

    galeria.innerHTML = data.map((projeto) => {
        const titulo = escapeHTML(projeto.titulo);
        const descricao = escapeHTML(projeto.descricao || "");
        const imagem = escapeHTML(projeto.imagem);

        return `
            <article class="gallery-card">
                <img
                    src="${imagem}"
                    alt="${titulo}"
                    loading="lazy"
                >
                <div class="gallery-info">
                    <span>Mazalli Piscinas</span>
                    <h3>${titulo}</h3>
                    ${descricao ? `<p>${descricao}</p>` : ""}
                </div>
            </article>
        `;
    }).join("");
}

const year = document.getElementById("currentYear");
if (year) year.textContent = new Date().getFullYear();

carregarGaleria();