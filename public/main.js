window.onload = () => {
    animateBackground();
}
function animateBackground() {
    let bg = document.getElementById("index-main-display");
    let e = document.createElement("div");
    e.classList.add("shape");
    e.style.position = "absolute";
    e.style.top = (Math.random() * bg.offsetHeight)+"px";
    e.style.left = (Math.random() * bg.offsetWidth)+"px";
    e.style.zIndex = 0;
    e.style.setProperty("--gb-animation-translate-x", Math.floor(Math.random()*20))
    e.style.setProperty("--gb-animation-translate-y", Math.floor(Math.random()*20))
    e.innerHTML = (()=>{switch (Math.floor(Math.random()*3)) {case 2: return "&#9633"; case 0: return "&#11040"; case 1: return "&#9651"}})();
    bg.appendChild(e);
    setTimeout(()=>{
        animateBackground();
    }, Math.random()*1000);
    setTimeout(()=>{
        bg.removeChild(e);
    }, 10000)
}