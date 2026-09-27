/* =========================================================
   MAZALLI PISCINAS
   DASHBOARD ADMINISTRATIVO
========================================================= */

const SUPABASE_URL = "https://xthfwqhxhlrjnqbbjepk.supabase.co";
const SUPABASE_KEY = "sb_publishable_TdGK1NkytskI75f8wZq8JA__NI4fg4m";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const loginPanel = document.getElementById("loginPanel");
const dashboardContent = document.getElementById("dashboardContent");
const loginForm = document.getElementById("loginForm");
const loginStatus = document.getElementById("loginStatus");
const logoutButton = document.getElementById("logoutButton");

const imagemInput = document.getElementById("imagem");
const tituloInput = document.getElementById("titulo");
const descricaoInput = document.getElementById("descricao");
const addButton = document.getElementById("addProjeto");
const projetosDiv = document.getElementById("projetos");
const status = document.getElementById("status");
const preview = document.getElementById("preview");

let currentPreviewURL = null;

function escapeHTML(value = "") {
    return String(value).replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    }[char]));
}

function setStatus(element, message, isError = false) {
    element.textContent = message;
    element.classList.toggle("error", isError);
}

function showDashboard() {
    loginPanel.hidden = true;
    dashboardContent.hidden = false;
    logoutButton.hidden = false;
    carregarProjetos();
}

function showLogin() {
    loginPanel.hidden = false;
    dashboardContent.hidden = true;
    logoutButton.hidden = true;
}

async function iniciar() {
    const { data, error } = await supabaseClient.auth.getSession();

    if (error) {
        console.error(error);
        setStatus(loginStatus, "Não foi possível verificar a sessão.", true);
        showLogin();
        return;
    }

    if (data.session) {
        showDashboard();
    } else {
        showLogin();
    }
}

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    setStatus(loginStatus, "Entrando...");
    const submitButton = loginForm.querySelector("button");
    submitButton.disabled = true;

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    const { error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
    });

    submitButton.disabled = false;

    if (error) {
        console.error(error);
        setStatus(loginStatus, "E-mail ou senha inválidos.", true);
        return;
    }

    loginForm.reset();
    setStatus(loginStatus, "");
    showDashboard();
});

logoutButton.addEventListener("click", async () => {
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
        console.error(error);
        return;
    }

    showLogin();
});

supabaseClient.auth.onAuthStateChange((_event, session) => {
    if (session) {
        showDashboard();
    } else {
        showLogin();
    }
});

imagemInput.addEventListener("change", () => {
    const arquivo = imagemInput.files[0];

    if (currentPreviewURL) {
        URL.revokeObjectURL(currentPreviewURL);
        currentPreviewURL = null;
    }

    if (!arquivo) {
        preview.innerHTML = "";
        return;
    }

    currentPreviewURL = URL.createObjectURL(arquivo);
    preview.innerHTML = `
        <img src="${currentPreviewURL}" alt="Pré-visualização da imagem selecionada">
    `;
});

addButton.addEventListener("click", async () => {
    const arquivo = imagemInput.files[0];
    const titulo = tituloInput.value.trim();
    const descricao = descricaoInput.value.trim();

    if (!arquivo || !titulo) {
        setStatus(status, "Adicione uma imagem e um título.", true);
        return;
    }

    if (arquivo.size > 8 * 1024 * 1024) {
        setStatus(status, "A imagem deve ter no máximo 8 MB.", true);
        return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(arquivo.type)) {
        setStatus(status, "Use uma imagem JPG, PNG ou WebP.", true);
        return;
    }

    setStatus(status, "Enviando projeto...");
    addButton.disabled = true;

    const extensao = arquivo.name.split(".").pop()?.toLowerCase() || "jpg";
    const nomeArquivo = `${crypto.randomUUID()}.${extensao}`;

    try {
        const { error: uploadError } = await supabaseClient
            .storage
            .from("piscinas")
            .upload(nomeArquivo, arquivo, {
                cacheControl: "31536000",
                contentType: arquivo.type,
                upsert: false
            });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabaseClient
            .storage
            .from("piscinas")
            .getPublicUrl(nomeArquivo);

        const imagemURL = urlData.publicUrl;

        const { error: insertError } = await supabaseClient
            .from("projetos")
            .insert({
                titulo,
                descricao,
                imagem: imagemURL
            });

        if (insertError) {
            await supabaseClient.storage.from("piscinas").remove([nomeArquivo]);
            throw insertError;
        }

        setStatus(status, "Piscina adicionada com sucesso!");

        imagemInput.value = "";
        tituloInput.value = "";
        descricaoInput.value = "";
        preview.innerHTML = "";

        if (currentPreviewURL) {
            URL.revokeObjectURL(currentPreviewURL);
            currentPreviewURL = null;
        }

        await carregarProjetos();
    } catch (error) {
        console.error(error);
        setStatus(status, "Erro ao adicionar projeto. Verifique as permissões do Supabase.", true);
    } finally {
        addButton.disabled = false;
    }
});

async function carregarProjetos() {
    projetosDiv.innerHTML = "<p role=\"status\">Carregando...</p>";

    const { data, error } = await supabaseClient
        .from("projetos")
        .select("id,titulo,descricao,imagem,created_at")
        .order("created_at", { ascending: false });

    if (error) {
        console.error(error);
        projetosDiv.innerHTML = "<p role=\"alert\">Erro ao carregar projetos.</p>";
        return;
    }

    if (!data?.length) {
        projetosDiv.innerHTML = "<p role=\"status\">Nenhum projeto cadastrado.</p>";
        return;
    }

    projetosDiv.innerHTML = data.map((projeto) => {
        const id = escapeHTML(projeto.id);
        const titulo = escapeHTML(projeto.titulo);
        const descricao = escapeHTML(projeto.descricao || "");
        const imagem = escapeHTML(projeto.imagem);

        return `
            <article class="item">
                <img src="${imagem}" alt="${titulo}" loading="lazy">
                <div>
                    <h3>${titulo}</h3>
                    <p>${descricao}</p>
                    <button type="button" data-delete-id="${id}" data-image="${imagem}">
                        Excluir
                    </button>
                </div>
            </article>
        `;
    }).join("");
}

projetosDiv.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-delete-id]");
    if (!button) return;

    const id = button.dataset.deleteId;
    const imagem = button.dataset.image;

    if (!confirm("Deseja excluir essa piscina?")) return;

    button.disabled = true;

    try {
        const url = new URL(imagem);
        const marker = "/storage/v1/object/public/piscinas/";
        const index = url.pathname.indexOf(marker);

        if (index !== -1) {
            const nomeArquivo = decodeURIComponent(url.pathname.slice(index + marker.length));
            const { error: storageError } = await supabaseClient
                .storage
                .from("piscinas")
                .remove([nomeArquivo]);

            if (storageError) console.warn("Não foi possível remover a imagem:", storageError);
        }

        const { error: deleteError } = await supabaseClient
            .from("projetos")
            .delete()
            .eq("id", id);

        if (deleteError) throw deleteError;

        await carregarProjetos();
    } catch (error) {
        console.error(error);
        alert("Não foi possível excluir o projeto.");
        button.disabled = false;
    }
});

iniciar();