import {
    db,
    setDoc,
    getDoc,
    getDocs,
    doc,
    serverTimestamp,
    updateDoc,
    arrayUnion,
    query,
    collection,
    where,
    deleteDoc
} from './firebase.js';

import {
    mensaje,
    numeroAleatorio,
    comprobarPartidaExiste,
    hashear
} from './utils.js';

/* 
   =====================================================
   Apartado: 
   ===================================================== 
*/

/* 
   =====================================================
   Aqui acaba el apartado: 
   ===================================================== 
*/

/* 
   =====================================================
   Apartado: Variables globales
   ===================================================== 
*/

var desordenarPreguntas = false;
var permitirComodines = true;
var explicacionPregunta = false;
var dificultadPregunta = false;
var tiempoPregunta = false;

var listaPreguntas = [];
var listaRespuestas = [];
var listaRespuestasCorrectas = [];
var listaExplicaciones = [];
var listaDificultad = [];

var codigo;
const usuario = sessionStorage.getItem("usuario");

var listaComodines = ["50/50"];

/* 
   =====================================================
   Aqui acaba el apartado: Variables globales
   ===================================================== 
*/


$(function () {

    comprobarChecks();
    $(`.mensajeError, .mensajeAdvertencia`).hide();

    /* 
       =====================================================
       Apartado: Crear Quizz
       ===================================================== 
   */

    $("#crearQuizz").click(async function () {
        var camposRellenados = true;
        var i = 1;
        var preguntaComprobar = 1;
        $(".contenedorRespuestas input").each(function () {
            if ($(this).val() == "" || $(`input.pregunta-${preguntaComprobar}`).val() == "") {
                camposRellenados = false;
            }

            if (i > 4) {
                i = 1;
                preguntaComprobar++;
            }

            i++;
        });

        if (camposRellenados) {
            mensaje("Creando partida...", "Correcto");
            $(".contenedorPregunta").each(function () {
                listaPreguntas.push($(this).val());
            });

            $(".respuestaCorrecta").each(async function () {
                var respuestaHasheada = await hashear($(this).val());
                listaRespuestasCorrectas.push(respuestaHasheada);
            });

            $(".respuestas").each(function () {
                listaRespuestas.push($(this).val());
            });
            listaRespuestas = mezclarListaRespuestas(listaRespuestas);

            if (explicacionPregunta) {
                $(".explicacion").each(function () {
                    listaExplicaciones.push($(this).val());
                });
            }

            else {
                for (var i = 0; i < listaPreguntas.length; i++) {
                    listaExplicaciones.push("");

                }
            }

            if (dificultadPregunta) {
                $(".dificultad").each(function () {
                    listaDificultad.push($(this).val());
                });
            }

            else {
                for (var i = 0; i < listaPreguntas.length; i++) {
                    listaDificultad.push("");
                }
            }

            if (desordenarPreguntas) {
                [listaPreguntas, listaRespuestasCorrectas, listaRespuestas, listaExplicaciones, listaDificultad] = mezclarLista(listaPreguntas, listaRespuestasCorrectas, listaRespuestas, listaExplicaciones, listaDificultad);
            }

            var tiempoPorCadaPregunta = Number($("#tiempoPregunta").val());

            codigo = await crearSala(listaPreguntas, listaRespuestas, listaRespuestasCorrectas, listaExplicaciones, listaDificultad, tiempoPorCadaPregunta);

            sessionStorage.setItem("codigoPartida", codigo);
            window.location.href = "salaEspera.html";
        }

        else {
            mensaje("Tienes que rellenar todos los campos, no puedes dejar ni uno vacio", "Error");
        }
    });

    /* 
       =====================================================
       Aqui acaba el apartado: Crear Quizz
       ===================================================== 
    */

    /* 
       =====================================================
       Apartado: Crear y eliminar preguntas
       ===================================================== 
    */

    $("#añadirPregunta").click(function () {
        alladirPregunta();
    });

    $("body").on("click", ".eliminar", function () {
        if ($("#preguntasQuizz div.pregunta").length > 1) {
            var clase = $(this).attr("class");
            clase = clase.split("-");
            var pregunta = clase[1];
            eliminarPregunta(pregunta);
        }

        else {
            mensaje("Tiene que haber minimo una pregunta", "Error");
        }
    });

    /* 
       =====================================================
       Aqui acaba el apartado: Crear y eliminar preguntas
       ===================================================== 
    */

    /* 
       =====================================================
       Apartado: Mirar los checks
       ===================================================== 
    */

    $("#checks li input").click(function () {
        comprobarChecks();
    });

    /* 
       =====================================================
       Aqui acaba el apartado: Mirar los checks
       ===================================================== 
    */

    /*
      =====================================================
      Apartado: Entrar a una partida
      ===================================================== 
    */

    $("#buscar").click(function () {
        buscarSala();
    });

    /*
       =====================================================
       Aqui acaba el apartado: Entrar a una partida
       ===================================================== 
    */

    function alladirPregunta() {
        var preguntaNumero = $("#preguntasQuizz div.pregunta").length + 1;
        $("#preguntasQuizz").append(`
            <div id="pregunta-${preguntaNumero}" class="pregunta">
                    <h3>Pregunta ${preguntaNumero}</h3>
                    <input class="contenedorPregunta pregunta-${preguntaNumero}" type="text" placeholder="Indica la pregunta">
                    <div class ="contenedorRespuestas">
                        <input class="respuestas respuestaCorrecta" type="text" placeholder="Indica la respuesta correcta">
                        <input class="respuestas" type="text" placeholder="Escribe una respuesta">
                        <input class="respuestas" type="text" placeholder="Escribe una respuesta">
                        <input class="respuestas" type="text" placeholder="Escribe una respuesta">
                    </div>
                    <div>
                        <input class="explicacion" type="text"
                            placeholder="Da una explicacion de porque esa es la respuesta correcta">
                        <select name="" id="DificultadPregunta-${preguntaNumero}" class="dificultad">
                            <option value="Facil">Facil</option>
                            <option value="Medio">Medio</option>
                            <option value="Dificil">Dificil</option>
                        </select>
                        <button class="eliminar pregunta-${preguntaNumero}">Eliminar pregunta</button>
                    </div>
                <hr>
            </div>
        `);
        comprobarChecks();
    }

    function eliminarPregunta(preguntaEliminar) {
        $(`#pregunta-${preguntaEliminar}`).remove();
        var i = 1;
        var contador = preguntaEliminar;

        $("#preguntasQuizz div.pregunta h3").each(function () {
            $(this).text(`Pregunta ${i}`);
            if (i >= contador) {
                $(`#pregunta-${i + 1}`).attr("id", `pregunta-${i}`);
                $(`#DificultadPregunta-${i + 1}`).attr("id", `DificultadPregunta-${i}`);
                $(`button.pregunta-${i + 1}`).attr("class", `eliminar pregunta-${i}`);
            }
            i++;
        });
    }

    function comprobarChecks() {
        desordenarPreguntas = $("#desordenarPreguntas").is(":checked");
        permitirComodines = !$("#prohibirComodines").is(":checked");
        explicacionPregunta = $("#expliacionPregunta").is(":checked");
        dificultadPregunta = $("#dificultadPregunta").is(":checked");
        tiempoPregunta = $("#tiempoParaContestar").is(":checked");

        if (explicacionPregunta) {
            mensaje("Si dejas vacio la explicacion no se pondra despues de la pregunta", "Advertencia");
        }

        $(".explicacion").toggle(explicacionPregunta);
        $(".dificultad").toggle(dificultadPregunta);
        $("#tiempoPregunta").toggle(tiempoPregunta);

    }

    function mezclarLista(lista1, lista2, lista3, lista4, lista5) {
        console.log(lista1);
        console.log(lista2);
        console.log(lista4);
        console.log(lista5);
        if (lista1.length == lista2.length && lista1.length == lista4.length && lista1.length == lista5.length) {
            var listaBarrejada1 = []; //Lista de las preguntas
            var listaBarrejada2 = []; //Lista de las respuestas correctas
            var listaBarrejada3 = []; //Lista de las respuestas
            var listaBarrejada4 = []; // Lista de las explicaciones
            var listaBarrejada5 = []; // Lista de las dificultades

            while (lista1.length > 0) {
                var posicionAleatoria = numeroAleatorio(0, lista1.length - 1);
                listaBarrejada1.push(lista1[posicionAleatoria]);
                listaBarrejada2.push(lista2[posicionAleatoria]);
                listaBarrejada4.push(lista4[posicionAleatoria]);
                listaBarrejada5.push(lista5[posicionAleatoria]);
                lista1.splice(posicionAleatoria, 1);
                lista2.splice(posicionAleatoria, 1);
                lista4.splice(posicionAleatoria, 1);
                lista5.splice(posicionAleatoria, 1);
                for (var i = 0; i <= 4; i++) {
                    listaBarrejada3.push(lista3[posicionAleatoria]);
                    lista3.splice(posicionAleatoria, 1);
                }
            }

            return [listaBarrejada1, listaBarrejada2, listaBarrejada3, listaBarrejada4, listaBarrejada5];
        }

        else {
            mensaje("Ha ocurrido un error, vuelve a intentalo y si sigue fallando no dude en reportal el error", "Error");
        }
    }

    async function crearSala(preguntas, respuestas, respuestasCorrectas, explicaciones, dificultades, tiempoContestar) {
        var salaExiste = true;
        var codigoGenerar;
        while (salaExiste) {
            codigoGenerar = numeroAleatorio(100000, 999999);
            codigoGenerar = String(codigoGenerar);
            salaExiste = await comprobarPartidaExiste(codigoGenerar);
        }
        /*
        console.log(permitirComodines);
        console.log(explicacionPregunta);
        console.log(dificultadPregunta);
        console.log(tiempoPregunta);
        console.log(tiempoContestar);
        console.log(preguntas);
        console.log(respuestas);
        console.log(respuestasCorrectas);
        console.log(explicaciones);
        console.log(dificultades);
        console.log(usuario);
        */
        var referencia = doc(db, "quizz", codigoGenerar);
        await setDoc(referencia, {
            fechaCreacion: serverTimestamp(),
            permitirComodines: permitirComodines,
            explicarPregunta: explicacionPregunta,
            mostrarDificultadPregunta: dificultadPregunta,
            existeTiempoContestar: tiempoPregunta,
            tiempoParaContestar: tiempoContestar,
            cronometro: tiempoContestar,
            estadoJuego: "esperando",
            preguntas: preguntas,
            respuestas: respuestas,
            respuestasCorrectas: respuestasCorrectas,
            explicaciones: explicaciones,
            dificultades: dificultades,
            jugadores: [],
            puntaje: {},
            aciertos: {},
            aciertosSeguidos: {},
            puedenEntrarJugadores: true,
            admin: usuario,
            preguntaActual: 0,
            haCambiadoAFinalizado: false,
            personasRespondido: [],
            personasPuntuadas: [],
            puntuadoPersonaRacha: false,
            revelarRespuesta: false,
            jugadorConRacha: "",
            jugadoresMal: [],
            respuestaJugador: {}
        });

        var documento = await getDoc(referencia);
        var informacion = documento.data();
        var fechaCreacion = informacion.fechaCreacion.toDate();
        var borrarDocumento = new Date(fechaCreacion);
        borrarDocumento.setHours(borrarDocumento.getHours() + 24);
        await updateDoc(referencia, {
            fechaEliminacion: borrarDocumento,
        });
        var fechaActual = new Date();
        var salasVencidas = query(
            collection(db, "quizz"),
            where("fechaEliminacion", "<=", fechaActual)
        );
        var documentosBorrar = await getDocs(salasVencidas);
        documentosBorrar.forEach((documento) => {
            deleteDoc(doc(db, "quizz", documento.id));
        });

        return codigoGenerar;
    }

    async function buscarSala() {
        var codigoBuscar = String($("#codigoBuscar").val());
        var existePartida = await comprobarPartidaExiste(codigoBuscar);

        if (existePartida) {
            if (existePartida.puedenEntrarJugadores) {
                mensaje("Entrando a la partida...", "Correcto");
                if (!existePartida.jugadores.includes(usuario)) {
                    var referencia = doc(db, "quizz", codigoBuscar);
                    await updateDoc(referencia, {
                        jugadores: arrayUnion(usuario),
                        [`puntaje.${usuario}`]: 0,
                        [`aciertos.${usuario}`]: 0,
                        [`aciertosSeguidos.${usuario}`]: 0,
                        [`comodin.${usuario}`]: listaComodines[numeroAleatorio(0, listaComodines.length - 1)],
                        [`comodinUsado.${usuario}`]: false,
                        [`respuestaJugador.${usuario}`]: ""
                    });
                }
                sessionStorage.setItem("codigoPartida", codigoBuscar);
                window.location.href = "salaEspera.html";
            }

            else if (existePartida.jugadores.includes(usuario) && !existePartida.puedenEntrarJugadores) {
                mensaje("Entrando a la partida...", "Correcto");
                window.location.href = "quizz.html";
            }

            else {
                mensaje("Lo sentimos, esta partida ya ha comenzado", "Error");
            }
        }

        else {
            mensaje("La partida no existe o el codigo no esta bien escrito, recuerde no poner ningun espacio", "Error");
        }
    }

    function mezclarListaRespuestas(lista) {
        var listaMezclada = [];
        while (lista.length > 0) {
            var listaTemporal = lista.splice(0, 4);
            while (listaTemporal.length > 0) {
                var posicionAleatoria = numeroAleatorio(0, listaTemporal.length - 1);
                listaMezclada.push(listaTemporal[posicionAleatoria]);
                listaTemporal.splice(posicionAleatoria, 1);
            }
        }
        return listaMezclada;
    }

});