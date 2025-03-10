async function Pairing() {
    const phone_ = document.getElementById("phone").value.trim();
    const preloader = document.getElementById("preloader");
    if (!phone_) {
    alert("Please enter a valid phone number");
    return;
    }
    preloader.style.display = "flex"; 
    try { const voidi = await fetch(`/pair?code=${phone_}`);
        const data = await voidi.json();
        if (voidi.ok) {
            localStorage.setItem("code", data.code); 
            window.location.href = "getcode.html"; 
        } else {
        alert(`${data.message || "err"}`);
        }} catch (error) {
        console.error(error);
        alert("servr err_");
    } finally {
        preloader.style.display = "none";
    }}
