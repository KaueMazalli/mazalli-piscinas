/* =========================================================
   MAZALLI PISCINAS
   JAVASCRIPT
========================================================= */


document.addEventListener("DOMContentLoaded", () => {



/* =====================================================
   CONFIGURAÇÃO WHATSAPP
===================================================== */


const WHATSAPP_NUMBER = "5517997321804";


const WHATSAPP_MESSAGE =
"Olá! Gostaria de solicitar um orçamento para uma piscina.";



const whatsappLinks =
document.querySelectorAll(".js-whatsapp");



const whatsappURL =
`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;



whatsappLinks.forEach((link) => {

    link.href = whatsappURL;

});





/* =====================================================
   HEADER SCROLL
===================================================== */


const header =
document.querySelector(".site-header");



function updateHeader(){


if(!header) return;



if(window.scrollY > 20){

    header.classList.add("scrolled");

}else{

    header.classList.remove("scrolled");

}


}



updateHeader();



window.addEventListener(
"scroll",
updateHeader,
{
passive:true
}
);





/* =====================================================
   MENU MOBILE
===================================================== */


const menuToggle =
document.getElementById("menuToggle");


const mainNav =
document.getElementById("mainNav");




if(menuToggle && mainNav){



function closeMenu(){


menuToggle.classList.remove("active");


mainNav.classList.remove("open");


document.body.classList.remove("menu-open");


menuToggle.setAttribute(
"aria-expanded",
"false"
);


}





menuToggle.addEventListener(
"click",
()=>{


const opened =
mainNav.classList.toggle("open");



menuToggle.classList.toggle(
"active",
opened
);



document.body.classList.toggle(
"menu-open",
opened
);



menuToggle.setAttribute(
"aria-expanded",
String(opened)
);



}

);





mainNav.querySelectorAll("a")
.forEach(link=>{


link.addEventListener(
"click",
closeMenu
);


});





document.addEventListener(
"click",
(event)=>{


const clickedInside =
mainNav.contains(event.target)
||
menuToggle.contains(event.target);



if(
!clickedInside &&
mainNav.classList.contains("open")
){

closeMenu();

}


}

);





document.addEventListener(
"keydown",
(event)=>{


if(
event.key === "Escape" &&
mainNav.classList.contains("open")
){

closeMenu();

}


}

);



}





/* =====================================================
   ANO AUTOMÁTICO
===================================================== */


const currentYear =
document.getElementById("currentYear");



if(currentYear){

currentYear.textContent =
new Date().getFullYear();

}





/* =====================================================
   SCROLL REVEAL
===================================================== */


const revealElements =
document.querySelectorAll(
".project-card, .about-image, .about-content, .contact-cta"
);




if("IntersectionObserver" in window){



const revealObserver =
new IntersectionObserver(
(entries, observer)=>{


entries.forEach(entry=>{


if(!entry.isIntersecting)
return;



entry.target.classList.add(
"reveal",
"is-visible"
);



observer.unobserve(
entry.target
);



});


},
{
threshold:0.15
}

);




revealElements.forEach(element=>{


element.classList.add(
"reveal"
);



revealObserver.observe(
element
);



});



}else{



revealElements.forEach(element=>{


element.classList.add(
"reveal",
"is-visible"
);


});


}



});
/* =====================================================
   SUPABASE
===================================================== */


const SUPABASE_URL = "https://xthfwqhxhlrjnqbbjepk.supabase.co";


const SUPABASE_KEY = "sb_publishable_TdGK1NkytskI75f8wZq8JA__NI4fg4m";



const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);



/* =====================================================
   CARREGAR PROJETOS HOME
===================================================== */


async function carregarProjetosHome(){


const container = document.getElementById(
    "homeProjetos"
);



if(!container) return;



const { data, error } = await supabaseClient
.from("projetos")
.select("*")
.order(
    "created_at",
    {
        ascending:false
    }
)
.limit(4);



if(error){

console.log(
    "Erro Supabase:",
    error
);

return;

}



container.innerHTML = "";



data.forEach((projeto)=>{


container.innerHTML += `


<article class="project-card">


<div class="project-image">


<img
src="${projeto.imagem}"
alt="${projeto.titulo}"
loading="lazy"
>


</div>


</article>


`;


});


}



carregarProjetosHome();
// Deploy Cloudflare