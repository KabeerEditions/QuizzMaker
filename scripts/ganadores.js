import {
    db,
    doc,
    getDoc,
    updateDoc
} from './firebase.js';

import {
    mensaje,
    ordenarJugadores
} from './utils.js';

$(function () {
    $(`.mensajeError, .mensajeAdvertencia`).hide();
    const codigo = sessionStorage.getItem("codigoPartida");
    const usuario = sessionStorage.getItem("usuario");
    acabarPartida(codigo);

    $("#volverInicio").click(function() {
        sessionStorage.removeItem("codigoPartida");
        window.location.href = "home.html";
    });

    async function acabarPartida(codigoAcabar) {
        var referencia = doc(db, "quizz", codigoAcabar);
        var documento = await getDoc(referencia);
        var informacion = documento.data();

        if (!informacion.haCambiadoAFinalizado) {
            await updateDoc(referencia, {
                haCambiadoAFinalizado: true
            });
        }
        var jugadoresOrdenados = ordenarJugadores(informacion.jugadores, informacion.puntaje);
        colocarJugadores(jugadoresOrdenados, informacion.puntaje, informacion.aciertos);
    }

    function colocarJugadores(jugadores, puntos, aciertos) {
        var cantidadJugadores = jugadores.length;
        if (cantidadJugadores > 6) {
            cantidadJugadores = 6;
        }
        var i = 1;
        if (jugadores.length <= 3) {
            $(".restoRanking").remove();
        }
        $(".rankingFinal").each(function () {
            if (i <= jugadores.length) {
                $(this).find("strong").text(jugadores[i - 1]);
                $(this).find(".puntos").text(`${puntos[jugadores[i - 1]]} puntos`);
                $(this).find(".aciertos").text(`(${aciertos[jugadores[i - 1]]})`);
            }

            else {
                $(this).remove();
            }
            i++;
        });
    }
});