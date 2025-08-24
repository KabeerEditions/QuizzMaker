import {
    arrayUnion,
    db,
    doc,
    getDoc,
    increment,
    onSnapshot,
    updateDoc
} from './firebase.js';

import {
    mensaje,
    comprobaciones,
    numeroAleatorio,
    hashear,
    ordenarJugadores
} from './utils.js';

$(function () {
    $(`.mensajeError, .mensajeAdvertencia`).hide();
    const codigo = sessionStorage.getItem("codigoPartida");
    const usuario = sessionStorage.getItem("usuario");
    var escuchaTiempoReal;
    comprobaciones(codigo, usuario);
    comprobacionesPartida(codigo);
    leerDatosTiempoReal(codigo);
    crearJugadoresRanking(codigo);

    /* 
       =====================================================
       Apartado: Variables globales
       ===================================================== 
    */

    var preguntaActual = 0;
    var estadoJuego = sessionStorage.getItem("estadoDelJuego");
    //var estadoJuego = "";
    //var explicacion = false;
    var haAcertado;
    var personasRespondieron = [];
    var mensajePoner = "";
    var tiempo;
    var mostrar = false;
    var todoNada = false;

    const funcionesComodines = {
        "50/50": async () => {
            var referencia = doc(db, "quizz", codigo);
            var documento = await getDoc(referencia);
            var informacion = documento.data();
            var botones = $(".respuestas button").toArray();
            botones = await Promise.all(
                botones.map(async (btn) => {
                    const hash = await hashear($(btn).text());
                    return {
                        id: $(btn).attr("id"),
                        esCorrecta: hash == informacion.respuestasCorrectas[informacion.preguntaActual]
                    };
                })
            );
            var respuestasIncorrectas = [];
            botones.forEach(({ id, esCorrecta }) => {
                if (esCorrecta) {
                    $(`#${id}`).addClass("comodin5050");
                }

                else {
                    respuestasIncorrectas.push(id);
                }
            });
            var posicionAleatoria = numeroAleatorio(0, respuestasIncorrectas.length - 1);
            $(`#${respuestasIncorrectas[posicionAleatoria]}`).addClass("comodin5050");
            respuestasIncorrectas.splice(posicionAleatoria, 1);
            respuestasIncorrectas.forEach(function (elementoActual) {
                $(`#${elementoActual}`).addClass("respuestaIncorrectaQuizz");
            });
        },

        "Todo o nada": async () => {
            todoNada = true;
        },

        "Sabotaje": async () => {
            var referencia = doc(db, "quizz", codigo);
            var documento = await getDoc(referencia);
            var informacion = documento.data();
            for (var i = 0; informacion.jugadores.length - 1; i++) {
                if (informacion.jugadores[i] != usuario) {
                    sumarPuntuacion(informacion.jugadores[i], -100);
                }
            }
        }
    }

    /* 
       =====================================================
       Aqui acaba el apartado: Variables globales
       ===================================================== 
    */

    /*
       =====================================================
       Apartado: Contestar preguntas
       ===================================================== 
   */

    $(".respuesta").on("click", async function () {
        var referencia = doc(db, "quizz", codigo);
        var documento = await getDoc(referencia);
        var informacion = documento.data();
        if (informacion.estadoJuego == "responiendo" && usuario != informacion.admin) {
            $("#preguntas").hide();
            $("#pantallaEspera").show();
            if (!informacion.personasRespondido.includes(usuario)) {
                haAcertado = NaN;
                var respuestaHasheada = await hashear($(this).text());
                haAcertado = await comprobarRespuesta(respuestaHasheada, $(this).text());
            }

            else {
                mensaje("Usted ya respondio", "Error");
            }
        }

        else if (usuario == informacion.admin) {
            mensaje("Usted es el administrador, no puede contestar a las preguntas", "Error");
        }

        else {
            mensaje("Lo sentimos, el estado del juego cambio y ya no puede contestar", "Error");
        }
    });

    /*
       =====================================================
       Aqui acaba el apartado: Contestar preguntas
       ===================================================== 
    */



    /*
       =====================================================
       Apartado: Siguiente pregunta (admin)
       ===================================================== 
   */

    $("#siguiente1, #siguiente2, #siguiente3").click(async function () {
        var referencia = doc(db, "quizz", codigo);
        var documento = await getDoc(referencia);
        var informacion = documento.data();
        if (informacion.admin == usuario) {
            clearInterval(tiempo);
            await establecerEstadoPartida(codigo);
        }

        else {
            mensaje("Usted no es el administrador de esta partida", "Error");
            $("#siguiente1, #siguiente2, #siguiente3").hide();
        }
    });

    /*
       =====================================================
       Aqui acaba el apartado: Siguiente pregunta (admin)
       ===================================================== 
    */

    /* 
       =====================================================
       Apartado: Usar comodin
       ===================================================== 
    */
    $(document).on("click", ".comodin", async function () {
        var referencia = doc(db, "quizz", codigo);
        var documento = await getDoc(referencia);
        var informacion = documento.data();
        var posicion = $(this).index();
        if (posicion >= 0 && posicion <= 2 && !informacion.personasRespondido.includes(usuario)) {
            var comodinesUsuario = informacion.comodin[usuario];
            var comodinesUsadosUsuario = informacion.comodinesUsados[usuario];
            if (!comodinesUsadosUsuario[posicion]) {
                funcionesComodines[comodinesUsuario[posicion]]();
                comodinesUsadosUsuario[posicion] = true;
                await updateDoc(referencia, {
                    [`comodinesUsados.${usuario}`]: comodinesUsadosUsuario
                });
            }

            else {
                mensaje("Este comodin ya ha sido usado", "Error");
            }
        }

        else {
            mensaje("Ha ocurrido un error", "Error");
        }

        $(this).remove();
    });

    /* 
       =====================================================
       Aqui acaba el apartado: Usar comodin
       ===================================================== 
    */

    function leerDatosTiempoReal(codigoEscuchar) {
        var referencia = doc(db, "quizz", codigoEscuchar);
        escuchaTiempoReal = onSnapshot(referencia, (leerDatos) => {
            var datos = leerDatos.data();
            $("#cronometro").text(datos.cronometro);
            if (preguntaActual != datos.preguntaActual + 1 && !datos.juegoPausado) {
                preguntaActual = datos.preguntaActual + 1;
                $(".numeroPregunta").text(datos.preguntaActual + 1);
                $(".pregunta").text(datos.preguntas[datos.preguntaActual]);

                var respuestaPoner = datos.preguntaActual * 4;
                var posicionesAleatorias = [1, 2, 3, 4];
                for (var i = 1; i <= 4; i++) {
                    var posicionAleatoria = numeroAleatorio(0, posicionesAleatorias.length - 1);
                    $(`#respuesta-${posicionesAleatorias[posicionAleatoria]}`).text(datos.respuestas[respuestaPoner]);
                    respuestaPoner++;
                    posicionesAleatorias.splice(posicionAleatoria, 1);
                }

                if (datos.mostrarDificultadPregunta) {
                    $(".textoDificultad").text(datos.dificultades[datos.preguntaActual]);
                    $(".dificultad-indicador").attr("class", `dificultad-indicador dificultad-${datos.dificultades[datos.preguntaActual]}`);
                    $(".icono").text(datos.dificultades[datos.preguntaActual] != "Extremo" ? "★" : "💀");
                }
            }

            if (datos.estadoJuego == "responiendo") {
                if (datos.admin == usuario) {
                    $("#siguiente1").show();
                }
                mostrar = true;
                $(".respuestaCorrectaQuizz").removeClass("respuestaCorrectaQuizz");
                $(".respuestaIncorrectaQuizz").removeClass("respuestaIncorrectaQuizz");
                $(".comodin5050").removeClass("comodin5050");
                estadoJuego = "responiendo";
                sessionStorage.setItem("estadoDelJuego", estadoJuego);
                if (!datos.personasRespondido.includes(usuario)) {
                    $("#pantallaEspera, #explicacion, #ranking").hide();
                    $("#preguntas").show();
                }

                else {
                    $("#preguntas, #explicacion, #ranking").hide();
                    $("#pantallaEspera").show();
                }

                var jugadoresFaltantes = datos.jugadores.length - datos.personasRespondido.length;
                if (isNaN(jugadoresFaltantes)) {
                    jugadoresFaltantes = datos.jugadores.length;
                }
                $(".jugadoresFaltantes").text(jugadoresFaltantes);
                if (jugadoresFaltantes <= 0 && usuario == datos.admin) {
                    establecerEstadoPartida(codigo);
                }
            }

            else if (datos.estadoJuego == "explicando") {
                $("#explicacion div p").text(datos.explicaciones[datos.preguntaActual]);
                if (estadoJuego != "explicando" && datos.revelarRespuesta) {
                    mostrarRespuesta("explicando", "explicacion");
                }

                else {
                    $("#pantallaEspera, #ranking, #preguntas").hide();
                    $("#explicacion").show();
                }
            }

            else if (datos.estadoJuego == "mostrarRanking") {
                if (!datos.puntuadoPersonaRacha) {
                    calcularPersonaConRacha(datos.jugadores, datos.aciertosSeguidos);
                }
                if (usuario != datos.admin && estadoJuego != "mostrarRanking") {
                    mostrarMensajeAcierto(datos.personasRespondido);
                }

                if (estadoJuego != "mostrarRanking" && datos.revelarRespuesta) {
                    mostrarRespuesta("mostrarRanking", "ranking");
                }

                else {
                    $("#pantallaEspera, #explicacion, #preguntas").hide();
                    $("#ranking").show();
                }

                if (!datos.personasRespondido.includes(usuario) && usuario != datos.admin && estadoJuego != "mostrarRanking") {
                    mensaje("No has elejido ninguna opcion asi que no se te sumara ningun punto y tu racha se reiniciara", "Advertencia");
                }
                colocarJugadoresRanking(codigo);
                if (mostrar) {
                    mostrar = false;
                    setTimeout(async function () {
                        var documento = await getDoc(referencia);
                        var informacion = documento.data();
                        console.log(informacion.preguntaActual + 1);
                        for (var i = 0; i < informacion.jugadoresMal.length; i++) {
                            if (informacion.jugadoresMal[i] != "Ger_demo") {
                                console.log(`El jugador ${informacion.jugadoresMal[i]} respondio mal (${informacion.respuestaJugador[informacion.jugadoresMal[i]]})`);
                            }

                            else {
                                $("La perra del Gerard respondio mal, no sabe leer (${informacion.respuestaJugador[informacion.jugadoresMal[i]]})")
                            }
                        }
                    }, 3000);
                }
            }

            else if (datos.estadoJuego == "finalizado") {
                estadoJuego = "finalizado";
                sessionStorage.setItem("estadoDelJuego", estadoJuego);
                mensaje("Calculando los ganadores...", "Correcto");
                if (datos.haCambiadoAFinalizado || usuario != datos.admin) {
                    window.location.href = "ganadores.html";
                }
            }

        });
    }

    async function comprobacionesPartida(codigoComprobar) {
        var referencia = doc(db, "quizz", codigoComprobar);
        var documento = await getDoc(referencia);
        var informacion = documento.data();
        $(".totalPreguntas").text(informacion.preguntas.length);

        if (!informacion.mostrarDificultadPregunta) {
            $(".dificultad-indicador").remove();
        }

        if (!informacion.existeTiempoContestar) {
            $(".cronometro-container").remove();
        }

        else {
            if (usuario == informacion.admin) {
                cronometro();
            }
        }

        if (informacion.permitirComodines && informacion.admin != usuario) {
            for (var i = 1; i <= informacion.cantidadComodines; i++) {
                $(".comodin-container").append(`<button class="comodin">
                    ${informacion.comodin[usuario][i - 1]}
                    </button>`);
            }
        }

        if (informacion.admin == usuario) {
            $("#siguiente1, #siguiente2, #siguiente3").show();
        }
    }

    async function cronometro() {
        var referencia = doc(db, "quizz", codigo);
        var documento = await getDoc(referencia);
        var informacion = documento.data();
        if (informacion.existeTiempoContestar && informacion.admin == usuario) {
            tiempo = setInterval(async function () {
                await updateDoc(referencia, {
                    cronometro: increment(-1)
                });
                documento = await getDoc(referencia);
                informacion = documento.data();
                if (informacion.cronometro <= 0) {
                    clearInterval(tiempo);
                    if (informacion.estadoJuego == "responiendo") {
                        await establecerEstadoPartida(codigo);
                    }
                }
            }, 1000);
        }
    }

    async function comprobarRespuesta(respuesta, respuestaSinHash) {
        var referencia = doc(db, "quizz", codigo);
        var documento = await getDoc(referencia);
        var informacion = documento.data();
        await updateDoc(referencia, {
            personasRespondido: arrayUnion(usuario)
        });
        if (respuesta == informacion.respuestasCorrectas[informacion.preguntaActual]) {
            await updateDoc(referencia, {
                [`aciertos.${usuario}`]: increment(1),
                [`aciertosSeguidos.${usuario}`]: increment(1)
            });
            calcularPuntuacion();
            return true;
        }

        else {
            if (todoNada) {
                await sumarPuntuacion(usuario, -100);
            }
            await updateDoc(referencia, {
                [`aciertosSeguidos.${usuario}`]: 0,
                jugadoresMal: arrayUnion(usuario),
                [`respuestaJugador.${usuario}`]: respuestaSinHash
            });
            return false;
        }
    }

    async function establecerEstadoPartida(codigo) {
        var establecerEstado;
        var incrementar = 0;
        var referencia = doc(db, "quizz", codigo);
        var documento = await getDoc(referencia);
        var informacion = documento.data();
        var revelar = false;
        var ponerTiempo = 0;
        personasRespondieron = [];

        if (informacion.estadoJuego == "responiendo") {
            revelar = true;
        }

        if (informacion.preguntaActual + 1 >= informacion.preguntas.length && informacion.estadoJuego == "mostrarRanking") {
            establecerEstado = "finalizado";
        }

        else if (informacion.explicarPregunta && informacion.explicaciones[informacion.preguntaActual] != "" && informacion.estadoJuego == "responiendo") {
            establecerEstado = "explicando";
            personasRespondieron = informacion.personasRespondido;
        }

        else if (informacion.estadoJuego == "mostrarRanking") {
            establecerEstado = "responiendo";
            ponerTiempo = informacion.tiempoParaContestar;
            incrementar = 1;
            cronometro();
            await updateDoc(referencia, {
                [`aciertosSeguidos.${usuario}`]: 0,
                jugadoresMal: [],
            });
        }

        else {
            establecerEstado = "mostrarRanking";
            personasRespondieron = informacion.personasRespondido;
        }
        await updateDoc(referencia, {
            estadoJuego: establecerEstado,
            preguntaActual: increment(incrementar),
            personasRespondido: personasRespondieron,
            personasPuntuadas: [],
            puntuadoPersonaRacha: false,
            revelarRespuesta: revelar,
            cronometro: ponerTiempo
        });
    }

    async function calcularPuntuacion() {
        var referencia = doc(db, "quizz", codigo);
        var documento = await getDoc(referencia);
        var informacion = documento.data();
        mensajePoner = "";
        if (informacion.personasRespondido.includes(usuario) && !informacion.personasPuntuadas.includes(usuario)) {
            var puntuacion = Math.max(20, 100 - (10 * (informacion.personasRespondido.length - 1)));
            if (todoNada) {
                puntuacion = puntuacion * 3;
                todoNada = false;
            }
            await updateDoc(referencia, {
                personasPuntuadas: arrayUnion(usuario)
            });
            await sumarPuntuacion(usuario, puntuacion);
        }

    }

    async function sumarPuntuacion(jugador, puntosSumar) {
        var referencia = doc(db, "quizz", codigo);
        await updateDoc(referencia, {
            [`puntaje.${jugador}`]: increment(puntosSumar)
        });
    }

    async function crearJugadoresRanking(codigoPartida) {
        $(".Ranking div").remove();
        var referencia = doc(db, "quizz", codigoPartida);
        var documento = await getDoc(referencia);
        var informacion = documento.data();

        for (var i = 0; i < informacion.jugadores.length; i++) {
            $(".Ranking").append(`
            <div class="cajaPuntuacion puntuacion ${informacion.jugadores[i]}" style="order: ${i + 1};">
                <p class="nombreJugador-${i + 1}">${informacion.jugadores[i]}</p>
                <div>
                <span class="puntos">0</span>
                <span class="aciertos">0</span>
                </div>
            </div>
            `);
        }
    }

    async function colocarJugadoresRanking(codigoPartida) {
        var referencia = doc(db, "quizz", codigoPartida);
        var documento = await getDoc(referencia);
        var informacion = documento.data();
        //Hacer una funcion que ordene los jugadores segun sus puntuaciones usando push y un bucle, todo gracias al mapa y a la lista de jugadores
        var jugadoresOrdenados = ordenarJugadores(informacion.jugadores, informacion.puntaje);
        const contenedor = document.querySelector(".Ranking");
        const items = Array.from(contenedor.children);
        const firstRects = items.map(item => item.getBoundingClientRect());
        for (var i = 0; i < jugadoresOrdenados.length; i++) {
            $(`.${jugadoresOrdenados[i]}`).css("order", i + 1);
            $(`.${jugadoresOrdenados[i]} .puntos`).text(informacion.puntaje[jugadoresOrdenados[i]]);
            $(`.${jugadoresOrdenados[i]} .aciertos`).text(`(${informacion.aciertos[jugadoresOrdenados[i]]})`);
            if (i >= 0 && i <= 2) {
                $(`.top${i + 1}`).removeClass(`top${i + 1}`);
                $(`.${jugadoresOrdenados[i]}`).addClass(`top${i + 1}`);
            }
        }
        const lastRects = items.map(item => item.getBoundingClientRect());
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

    function mostrarMensajeAcierto(personasQueRespondieron) {
        if (isNaN(haAcertado)) {
            mostrarRespuesta(personasQueRespondieron);
        }

        else if (haAcertado) {
            mensaje("Enhorabuena, tu respuesta era correcta" + mensajePoner, "Correcto");
        }

        else if (!haAcertado && personasQueRespondieron.includes(usuario)) {
            mensaje("No has acertado, suerte la proxima vez", "Error");
        }
    }

    async function calcularPersonaConRacha(jugadores, aciertosSeguidos) {
        var personaConLaRacha = "";
        var rachaMasAlta = -1;
        for (var i = 0; i < jugadores.length; i++) {
            if (aciertosSeguidos[jugadores[i]] == rachaMasAlta) {
                personaConLaRacha = "";
            }

            else if (aciertosSeguidos[jugadores[i]] > rachaMasAlta) {
                personaConLaRacha = jugadores[i];
                rachaMasAlta = aciertosSeguidos[jugadores[i]];
            }
        }

        var referencia = doc(db, "quizz", codigo);
        await updateDoc(referencia, {
            puntuadoPersonaRacha: true
        });

        if (personaConLaRacha == usuario && aciertosSeguidos[usuario] > 0) {
            mensajePoner = `y actualmente tú eres el jugador con la mejor racha (${aciertosSeguidos[usuario]})`;
            var puntosSumar = 20 * rachaMasAlta;
            sumarPuntuacion(usuario, puntosSumar);
        }
    }

    async function mostrarRespuesta(pantallaMostrar, pantallaActual) {
        var referencia = doc(db, "quizz", codigo);
        var documento = await getDoc(referencia);
        var informacion = documento.data();

        if (informacion.revelarRespuesta && estadoJuego != pantallaMostrar) {
            $("#pantallaEspera, #ranking, #explicacion, #siguiente1").hide();
            $("#preguntas").show();
            $(".respuestas button").each(async function () {
                var respuestaComprobar = await hashear($(this).text());
                if (respuestaComprobar == informacion.respuestasCorrectas[informacion.preguntaActual]) {
                    $(this).addClass("respuestaCorrectaQuizz");
                }
                else {
                    $(this).addClass("respuestaIncorrectaQuizz");
                }
            });
            if (estadoJuego != pantallaMostrar) {
                setTimeout(async function () {
                    documento = await getDoc(referencia);
                    informacion = documento.data();
                    if (informacion.estadoJuego == pantallaMostrar) {
                        $("#pantallaEspera, #explicacion, #preguntas").hide();
                        $(".respuestaCorrectaQuizz").removeClass("respuestaCorrectaQuizz");
                        $(".respuestaIncorrectaQuizz").removeClass("respuestaIncorrectaQuizz");
                        $(`#${pantallaActual}`).show();
                        estadoJuego = pantallaMostrar;
                        sessionStorage.setItem("estadoDelJuego", estadoJuego);
                    }
                }, 5000);
            }

        }
    }
});