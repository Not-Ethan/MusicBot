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
    e.innerHTML = "&#9633"
    bg.appendChild(e);
    setTimeout(()=>{
        animateBackground();
    }, Math.random()*1000)
    setTimeout(()=>{
        bg.removeChild(e);
    }, 10000)
}