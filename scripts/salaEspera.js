import {
    db,
    doc,
    getDoc,
    onSnapshot,
    updateDoc
} from './firebase.js';

import {
    mensaje,
    comprobaciones
} from './utils.js';

$(function() {
    $(`.mensajeError, .mensajeAdvertencia`).hide();
    const codigo = sessionStorage.getItem("codigoPartida");
    const usuario = sessionStorage.getItem("usuario");
    var escuchaTiempoReal;
    comprobaciones(codigo, usuario);
    $(".codigo").text(codigo);
    leerDatosTiempoReal(codigo);

    /*
      =====================================================
      Apartado: Comenzar partida
      ===================================================== 
   */

    $("#comenzar").on("click", async function() {
        var referencia = doc(db, "quizz", codigo);
        var documento = await getDoc(referencia);
        var informacion = documento.data();
        if (usuario == informacion.admin) {
            mensaje("Comenzando partida...", "Correcto");
            await updateDoc(referencia, {
                puedenEntrarJugadores: false,
                estadoJuego: "responiendo"
            });
            window.location.href = "quizz.html";
        }
    });

    /* 
       =====================================================
       Aqui acaba el apartado: Comenzar partida
       ===================================================== 
    */

    function leerDatosTiempoReal(codigoEscuchar) {
        var referencia = doc(db, "quizz", codigoEscuchar);
        escuchaTiempoReal = onSnapshot(referencia, (leerDatos) => {
            var datos = leerDatos.data();
            colocarJugadores(datos.jugadores);
            /*
            Bug rarisimo, si no pongo que el usuario no sea el admin, aunque la condicion no se cumpla ni se actualize, el admin pasa a la siguiente sala
            como si nada sin actualizar el estado de la partida, eso significa que el if no se cumple, pero aun asi pasa, no se porque sinceramente, pero
            añadiendo una condicion extra de que el usuario no sea el admin ya funciona perfectamente
            */
            if (!datos.puedenEntrarJugadores && usuario != datos.admin) {
                mensaje("Comenzando partida...", "Correcto");
                window.location.href = "quizz.html";
            }
        });
    }

    function colocarJugadores(jugadores) {
        $(".jugador").remove();
        for (var i = 0; i < jugadores.length; i++) {
            $("#jugadores").prepend(`
                <div class="jugador">
                    <p>${jugadores[i]}</p>
                </div>
            `);
        }
    }
});