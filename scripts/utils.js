import {
    db,
    getDoc,
    doc
} from './firebase.js';

const puedePonerMensaje = {
    Error: true,
    Advertencia: true,
    Correcto: true
};

function mensaje(mensaje, tipoMensaje) {
    $(`.mensaje${tipoMensaje} p`).text(mensaje);
    $(`.mensaje${tipoMensaje}`).show();
    $(`.mensaje${tipoMensaje}`).css("transform", "translateY(0px)");
    if (puedePonerMensaje[tipoMensaje]) {
        puedePonerMensaje[tipoMensaje] = false;
        setTimeout(function () {
            $(`.mensaje${tipoMensaje}`).css("transform", "translateY(-200px)");
            setTimeout(function () {
                $(`.mensaje${tipoMensaje}`).hide();
                puedePonerMensaje[tipoMensaje] = true;
            }, 500);
        }, 5000);
    }
}

function numeroAleatorio(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

async function comprobarPartidaExiste(codigoComprobar) {
    var referencia = doc(db, "quizz", codigoComprobar);
    var documento = await getDoc(referencia);
    return documento.data();
}

async function comprobaciones(codigo, usuario) {
    var existePartida = await comprobarPartidaExiste(codigo);

    if (!existePartida || codigo == null || usuario == null) {
        mensaje("Lo sentimos, la partida no existe o usted no ha iniciado sesion, sera redirigido al home, si cree que se trata de un error reportelo", "Error");
        setTimeout(function () {
            window.location.href = "home.html";
        }, 6000);
    }

    else if (existePartida.admin == usuario) {
        $(".loader, .mensajeEsperando").hide();
        $("#comenzar").show();
    }
}

async function hashear(palabraHashear) {
    const encoder = new TextEncoder();
    const data = encoder.encode(palabraHashear);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function ordenarJugadores(jugadores, puntos) {
    var jugadoresOrdenados_2 = [];
    var longitudListaJugadores = jugadores.length;
    for (var i = 0; i < longitudListaJugadores; i++) {
        var jugadorMayorPuntuacion = jugadores[0];
        var puntajeMasAlto = puntos[jugadores[0]];
        for (var o = 0; o < jugadores.length; o++) {
            if (puntos[jugadores[o]] > puntajeMasAlto) {
                jugadorMayorPuntuacion = jugadores[o];
                puntajeMasAlto = puntos[jugadores[o]];
            }
        }
        jugadoresOrdenados_2.push(jugadorMayorPuntuacion);
        var pos = jugadores.indexOf(jugadorMayorPuntuacion);
        jugadores.splice(pos, 1);
    }

    return jugadoresOrdenados_2;
}

export {
    mensaje,
    numeroAleatorio,
    comprobarPartidaExiste,
    comprobaciones,
    hashear,
    ordenarJugadores
};