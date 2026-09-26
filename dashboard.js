/* =========================================================
   MAZALLI PISCINAS
   DASHBOARD
========================================================= */


/* =========================================================
   SUPABASE CONFIG
========================================================= */

const SUPABASE_URL = "https://xthfwqhxhlrjnqbbjepk.supabase.co";

const SUPABASE_KEY = "sb_publishable_TdGK1NkytskI75f8wZq8JA__NI4fg4m";


const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);



/* =========================================================
   ELEMENTOS
========================================================= */

const imagemInput = document.getElementById("imagem");

const tituloInput = document.getElementById("titulo");

const descricaoInput = document.getElementById("descricao");

const addButton = document.getElementById("addProjeto");

const projetosDiv = document.getElementById("projetos");

const status = document.getElementById("status");

const preview = document.getElementById("preview");



/* =========================================================
   PREVIEW IMAGEM
========================================================= */

imagemInput.addEventListener("change", () => {

    const arquivo = imagemInput.files[0];

    if (!arquivo) return;


    const url = URL.createObjectURL(arquivo);


    preview.innerHTML = `

        <img 
            src="${url}"
            alt="Preview"
        >

    `;

});



/* =========================================================
   ADICIONAR PROJETO
========================================================= */

addButton.addEventListener("click", async () => {


    const arquivo = imagemInput.files[0];

    const titulo = tituloInput.value.trim();

    const descricao = descricaoInput.value.trim();



    if (!arquivo || !titulo) {

        status.textContent =
        "Adicione uma imagem e um título.";

        return;

    }



    status.textContent =
    "Enviando projeto...";



    try {


        const nomeArquivo =
        `${Date.now()}-${arquivo.name}`;



        /*
            ENVIA IMAGEM PARA STORAGE
        */

        const { error: uploadError } =

        await supabaseClient
        .storage
        .from("piscinas")
        .upload(
            nomeArquivo,
            arquivo
        );



        if(uploadError){

            throw uploadError;

        }




        /*
            PEGA URL DA IMAGEM
        */


        const { data:urlData } =

        supabaseClient
        .storage
        .from("piscinas")
        .getPublicUrl(
            nomeArquivo
        );



        const imagemURL =
        urlData.publicUrl;




        /*
            SALVA NO BANCO
        */


        const { error:insertError } =

        await supabaseClient
        .from("projetos")
        .insert({

            titulo: titulo,

            descricao: descricao,

            imagem: imagemURL

        });



        if(insertError){

            throw insertError;

        }



        status.textContent =
        "Piscina adicionada com sucesso!";



        imagemInput.value = "";

        tituloInput.value = "";

        descricaoInput.value = "";

        preview.innerHTML = "";



        carregarProjetos();



    } catch(error){


        console.error(error);


        status.textContent =
        "Erro ao adicionar projeto.";

    }


});



/* =========================================================
   LISTAR PROJETOS
========================================================= */

async function carregarProjetos(){


    projetosDiv.innerHTML =
    "Carregando...";



    const {data,error} =

    await supabaseClient
    .from("projetos")
    .select("*")
    .order(
        "created_at",
        {
            ascending:false
        }
    );



    if(error){

        console.error(error);

        projetosDiv.innerHTML =
        "Erro ao carregar.";

        return;

    }



    projetosDiv.innerHTML = "";



    data.forEach((projeto)=>{


        projetosDiv.innerHTML += `


        <article class="item">


            <img
            src="${projeto.imagem}"
            alt="${projeto.titulo}"
            >


            <div>

                <h3>
                ${projeto.titulo}
                </h3>


                <p>
                ${projeto.descricao || ""}
                </p>


                <button
                onclick="excluirProjeto('${projeto.id}','${projeto.imagem}')"
                >

                Excluir

                </button>


            </div>


        </article>


        `;


    });


}




/* =========================================================
   EXCLUIR PROJETO
========================================================= */

async function excluirProjeto(id,imagem){


    const confirmar =
    confirm(
        "Deseja excluir essa piscina?"
    );


    if(!confirmar) return;



    const nomeArquivo =
    imagem.split("/").pop();



    await supabaseClient
    .storage
    .from("piscinas")
    .remove([
        nomeArquivo
    ]);



    await supabaseClient
    .from("projetos")
    .delete()
    .eq(
        "id",
        id
    );



    carregarProjetos();


}



/* =========================================================
   INICIAR
========================================================= */

carregarProjetos();