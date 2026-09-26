/* =====================================================
   MAZALLI PISCINAS
   GALERIA DINÂMICA
===================================================== */


const SUPABASE_URL =
"https://xthfwqhxhlrjnqbbjepk.supabase.co";


const SUPABASE_KEY =
"sb_publishable_TdGK1NkytskI75f8wZq8JA__NI4fg4m";



const supabaseClient =
supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);



const galeria =
document.getElementById("galeria");



async function carregarGaleria(){


const {data,error}=

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

galeria.innerHTML =
`
<p>
Erro ao carregar projetos.
</p>
`;

return;

}



galeria.innerHTML="";



data.forEach((projeto)=>{


galeria.innerHTML +=

`

<article class="gallery-card">


<img
src="${projeto.imagem}"
alt="${projeto.titulo}"
loading="lazy"
>


<div class="gallery-info">


<span>
Mazalli Piscinas
</span>


<h3>
${projeto.titulo}
</h3>


<p>
${projeto.descricao || ""}
</p>


</div>


</article>

`;


});


}



const year =
document.getElementById("currentYear");


if(year){

year.textContent =
new Date().getFullYear();

}



carregarGaleria();