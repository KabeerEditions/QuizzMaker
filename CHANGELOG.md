# Changelog

Todas las versiones importantes de QuizzMaker serán documentadas aquí.

## [1.2.3] - 2025-08-27

### Añadido
- Se muestra la cantidad de jugadores que han respondido cada pregunta.

### Arreglado
- La opción de **mezclar preguntas** ya se puede activar correctamente.
- La pantalla final del podio fue arreglada: ahora los jugadores se muestran de forma horizontal.

---

## [1.2.2] - 2025-08-27

### Arreglado
- El mensaje de acierto o fallo se mostraba varias, ahora se muestra 1 vez.
- Ahora se pueden usar los comodines, antes no se podia correctamente y si usabas algunos comodines no funcionaban correctamente.

---

## [1.2.1] - 2025-08-24
### Añadido
- Nuevos comodines:
  - **Sabotaje**: Permite eliminar 100 puntos a los demas jugadores.

### Cambiado
- La pantalla final de los ganadores tiene otro estilo.

### Arreglado
- Al generar los comodines ponia 1 menos, ahora pone todos los comodines que tienes.

---

## [1.2.0] - 2025-08-19
### Añadido
- Sistema de uso de comodines dentro de las partidas.
- Nueva dificultad: **Extremo**.
- Dos nuevos comodines:
  - **50/50**: elimina dos respuestas incorrectas.
  - **Todo o nada**: si aciertas te da el triple de puntos, pero si fallas te resta 100 puntos.

### Cambiado
- El bono por racha ya no es fijo (+20 puntos).  
  Ahora la cantidad de puntos obtenidos varía según el número de respuestas consecutivas correctas.

---

## [1.1.0] - 2025-07-18
### Añadido
- Página README con descripción, enlace a la app y advertencias importantes.
- Licencia personalizada que impide uso comercial y obliga a atribución.
- Reglas con firebase donde permiten a cualquiera leer y escribir datos

### Cambiado
- Estilo y redacción del texto en la página de inicio.

### Eliminado
- Configuración de Firebase con reglas en modo prueba.

---

## [1.0.0] - 2025-07-16
### Añadido
- Sistema de login con Firebase Authentication.
- Creación de quizzes personalizados.
- Generación de código único para compartir el quizz.
- Sala de espera para los jugadores hasta que el host inicie el juego.
- Contador de respuestas correctas y resultados finales.

