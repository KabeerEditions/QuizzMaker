import {
    getDoc,
    setDoc,
    doc,
    db
} from './firebase.js';

import {
    mensaje,
    hashear
} from './utils.js';

$(function () {
    $(`.mensajeError, .mensajeAdvertencia`).hide();
    // =========================
    //APARTADO: Registrarse
    // =========================
    var caracteresProhibidos = ["/", ".", ":", "*", "[", "]", "`", "'", " "];
    $("#Registrarse").click(async function () {
        var usuarioRegistro = $("#usuarioRegistro").val().toLowerCase();
        var usuarioOriginal = $("#usuarioRegistro").val();
        var contrasenyaRegistro = $("#contrasenyaRegistro").val();
        var usuarioDivididoCaracteres = usuarioRegistro.split("");
        var usuarioValido = comprobarCaracteresUsuario(usuarioDivididoCaracteres);
        var contrasenyaValida = true;
        if ($("#usuarioRegistro").val() == "" || $("#contrasenyaRegistro").val() == "") {
            mensaje("Tienes que rellenar todos los campos, no los puedes dejar vacios", "Error");
        }

        else {
            if (contrasenyaRegistro.length < 8) {
                contrasenyaValida = false;
            }

            if (!usuarioValido) {
                mensaje("El usuario no tiene los caracteres permitidos o tiene menos de 4 caracteres", "Error");
            }

            else {
                var usuarioExiste = await comprobarUsuarioExiste(usuarioRegistro);
                if (usuarioExiste) {
                    mensaje("El usuario ya existe, si eres tú inicia sesión", "Error");
                }

                else if (!contrasenyaValida) {
                    mensaje("La contraseña no tiene 8 caracteres o más", "Error");
                }
            }
        }

        if (contrasenyaValida && usuarioValido && !usuarioExiste) {
            await crearusuario(usuarioRegistro, contrasenyaRegistro, usuarioOriginal);
            $("#pantallaRegistro").hide();
            $("#pantallaInicioSesion").show();
            mensaje("Usuario creado con exito", "Correcto");
        }
    });
    // =========================
    //AQUI ACABA EL APARTADO: Registrarse
    // =========================

    // =========================
    //APARTADO: Iniciar sesion
    // =========================

    $("#usuarioLogin, #contrasenyaLogin").keydown(function(e) {
        var tecla = e.key;
        if (tecla == "Enter") {
            iniciarSesion();
        }
    });

    $("#IniciarSesion").click(function () {
        iniciarSesion();
    });

    async function iniciarSesion() {
        var usuarioLogin = $("#usuarioLogin").val().toLowerCase();
        var contrasenyaLogin = $("#contrasenyaLogin").val();
        if ($("#usuarioLogin").val() == "" || $("#contrasenyaLogin").val() == "") {
            mensaje("Tienes que rellenar todos los campos, no los puedes dejar vacios", "Error");
        }

        else {
            var usuarioExiste = await comprobarUsuarioExiste(usuarioLogin);
            if (!usuarioExiste) {
                mensaje("El usuario no existe, si no tiene cuenta registrese", "Error");
            }

            else {
                var { contrasenyaCorrecta, usuario } = await comprobarContrasenya(contrasenyaLogin, usuarioLogin);

                if (contrasenyaCorrecta) {
                    //Cambiar de pantalla
                    sessionStorage.setItem("usuario", usuario);
                    window.location.href = "home.html";
                }

                else {
                    mensaje("La contraseña es incorrecta", "Error");
                }
            }
        }
    }

    // =========================
    //AQUI ACABA EL APARTADO: Iniciar sesion
    // =========================

    // =========================
    //APARTADO: Cambio de pantallas
    // =========================

    $("#Registrarse_InicioSesion").click(function () {
        $("#pantallaInicioSesion").hide();
        $("#pantallaRegistro").show();
    });

    $("#IniciarSesion_Registro").click(function () {
        $("#pantallaRegistro").hide();
        $("#pantallaInicioSesion").show();
    });

    // =========================
    //AQUI ACABA EL APARTADO: Cambio de pantallas
    // =========================

    function comprobarCaracteresUsuario(usuarioComprobar) {
        if (usuarioComprobar.length < 4) {
            return false;
        }

        for (var i = 0; i < usuarioComprobar.length; i++) {
            if (caracteresProhibidos.includes(usuarioComprobar[i])) {
                return false;
            }

            if (usuarioComprobar[i] == "_" && usuarioComprobar[i + 1] == "_" && usuarioComprobar[usuarioComprobar.length - 1] == "_" && usuarioComprobar[usuarioComprobar.length - 2] == "_") {
                return false;
            }
        }
        return true;
    }

    async function comprobarUsuarioExiste(usuarioComprobar) {
        var referencia = doc(db, "usuarios", usuarioComprobar);
        var documento = await getDoc(referencia);
        return documento.exists();
    }

    async function crearusuario(usuario, contrasenya, nombreOriginal) {
        var referencia = doc(db, "usuarios", usuario);
        contrasenya = await hashear(contrasenya);
        await setDoc(referencia, {
            contrasenya: contrasenya,
            usuario: nombreOriginal,
        });
    }

    async function comprobarContrasenya(contrasenya, usuario) {
        var referencia = doc(db, "usuarios", usuario);
        var usuarioBaseDatos = await getDoc(referencia);
        var datos = usuarioBaseDatos.data();
        var contrasenyaHasheada = await hashear(contrasenya);
        return {
            contrasenyaCorrecta: contrasenyaHasheada == datos.contrasenya,
            usuario: datos.usuario
        };
    }
});