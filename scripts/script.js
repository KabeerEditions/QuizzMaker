import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-app.js";
import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    getDocs,
    serverTimestamp,
    updateDoc,
    onSnapshot,
    increment,
    arrayUnion,
    query,
    where,
    collection,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js";

$(function () {
    // TODO: Add SDKs for Firebase products that you want to use
    // https://firebase.google.com/docs/web/setup#available-libraries

    // Your web app's Firebase configuration
    const firebaseConfig = {
        apiKey: "AIzaSyD0mPfN-6M0SMUmQytqhGvC9w1ZyZ8x8WI",
        authDomain: "quizmaker-99237.firebaseapp.com",
        projectId: "quizmaker-99237",
        storageBucket: "quizmaker-99237.firebasestorage.app",
        messagingSenderId: "279136827743",
        appId: "1:279136827743:web:1a2def86085bdefff19eea"
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    /*
    FUNCION PARA ANIMAR EL RANKING
    function animateOrderChange() {
        const contenedor = document.querySelector(".Ranking");
        const items = Array.from(contenedor.children);

        // Guardar posición inicial
        const firstRects = items.map(item => item.getBoundingClientRect());

        // Cambiar el order en CSS
        document.querySelector(".Its_Park").style.order = "4";
        document.querySelector(".Its_Park").classList.remove("top2");
        document.querySelector(".AuronPlay").style.order = "2";
        document.querySelector(".AuronPlay").classList.add("top2");
        document.querySelector(".FurryWHo").style.order = "3";
        document.querySelector(".FurryWHo").classList.add("top3");
        document.querySelector(".Ger_demo").style.order = "5";
        document.querySelector(".Ger_demo").classList.remove("top3");

        // Guardar posición final
        const lastRects = items.map(item => item.getBoundingClientRect());

        // Animar con transform
        items.forEach((item, index) => {
            const dx = firstRects[index].left - lastRects[index].left;
            const dy = firstRects[index].top - lastRects[index].top;

            // Poner transform para mantener la posición inicial visual
            item.style.transform = `translate(${dx}px, ${dy}px)`;
            item.style.transition = 'transform 0s';

            // Forzar reflow para que el navegador aplique el transform anterior
            item.offsetHeight;

            // Animar a transform none
            item.style.transition = 'transform 0.5s ease';
            item.style.transform = 'translate(0,0)';

            // Limpiar al terminar la transición
            item.addEventListener('transitionend', () => {
                item.style.transition = '';
                item.style.transform = '';
            }, { once: true });
        });
    }

    document.getElementById("siguiente2").addEventListener("click", animateOrderChange);
    */
      
});