# Skill de Diseño: Paleta de Colores

## Objetivo

Aplicar de forma consistente la paleta de colores definida para la
aplicación, respetando estrictamente el orden de prioridad indicado.

## Paleta oficial

Usa estos colores en el siguiente orden, del más importante al más
secundario:

  -----------------------------------------------------------------------
  Prioridad         Color             Código HEX        Uso orientativo
  ----------------- ----------------- ----------------- -----------------
  1 --- Principal   Rojo              `#D92534`         Color principal
                                                        para elementos
                                                        visuales que ya
                                                        utilicen el color
                                                        de marca o para
                                                        destacar acciones
                                                        existentes.

  2 --- Secundario  Azul oscuro       `#263973`         Color secundario
                                                        para elementos
                                                        que necesiten una
                                                        alternativa
                                                        visual sobria.

  3 --- Terciario   Azul              `#117DBF`         Color de apoyo
                                                        para elementos
                                                        que ya empleen
                                                        colores de acento
                                                        o información.

  4 --- Acento      Dorado            `#D9B64E`         Acentos visuales
                                                        puntuales,
                                                        siempre que el
                                                        diseño existente
                                                        ya contemple ese
                                                        tipo de énfasis.

  5 --- Neutro      Gris muy claro    `#F2F2F2`         Fondos claros,
                                                        superficies o
                                                        elementos neutros
                                                        cuando
                                                        corresponda al
                                                        diseño existente.
  -----------------------------------------------------------------------

Los usos de la tabla son orientativos: no autorizan a crear, eliminar o
reestructurar componentes.

## Instrucción obligatoria: solo cambios de color

**Puedes modificar únicamente valores de color existentes en el código o
los estilos. No hagas ningún otro tipo de cambio.**

### Cambios permitidos

-   Sustituir colores existentes por colores de la paleta oficial.
-   Actualizar valores de color en CSS, SCSS, variables de tema, estilos
    en línea o archivos de configuración visual.
-   Ajustar únicamente propiedades cuyo propósito directo sea definir
    color, por ejemplo `color`, `background-color`, `border-color`,
    `fill`, `stroke` o sombras que contengan un color.
-   Reutilizar variables de color existentes si el cambio afecta
    exclusivamente sus valores cromáticos.

### Cambios prohibidos

-   No modificar la estructura, arquitectura ni lógica de la aplicación.
-   No cambiar HTML, JSX, componentes, jerarquía visual ni marcado,
    excepto si fuera estrictamente necesario editar solo un valor de
    color en una línea existente.
-   No cambiar nombres de clases, selectores, identificadores,
    variables, funciones, rutas ni nombres de archivos.
-   No modificar tamaños, dimensiones, espaciados, márgenes, rellenos,
    tipografías, pesos, alineación, distribución, bordes por sus
    dimensiones, radios, opacidad, animaciones, transiciones ni puntos
    de quiebre.
-   No agregar ni eliminar componentes, elementos, reglas, propiedades o
    dependencias.
-   No modificar textos, contenido, accesibilidad, comportamiento,
    validaciones, datos, autenticación, llamadas a API ni ninguna lógica
    de negocio.
-   No reformatear, refactorizar ni limpiar código que no esté
    relacionado directamente con el valor de color.
-   No introducir colores fuera de la paleta, salvo que un color
    existente deba conservarse para evitar alterar una funcionalidad o
    un estado que no pueda representarse de forma segura con la paleta.

## Reglas de aplicación

1.  Antes de editar, identifica los valores de color existentes y dónde
    se utilizan.
2.  Asigna los colores según su prioridad: `#D92534`, `#263973`,
    `#117DBF`, `#D9B64E` y `#F2F2F2`.
3.  Conserva el propósito y la función visual de cada elemento; cambia
    el color, no su comportamiento.
4.  No fuerces un cambio si no existe una equivalencia clara dentro de
    la paleta. En ese caso, conserva el valor original y reporta la
    excepción.
5.  No cambies colores de estados funcionales o semánticos ---como
    error, éxito, advertencia o deshabilitado--- si sustituirlos puede
    confundir al usuario o reducir la comprensión de la interfaz.
6.  Mantén intactos todos los valores que no sean colores.
7.  Al finalizar, revisa el diff y confirma que cada modificación
    corresponde exclusivamente a un valor de color. Revierte cualquier
    cambio ajeno a los colores.

## Criterios de aceptación

-   [ ] La paleta se respeta en el orden de prioridad indicado.
-   [ ] Los cambios realizados se limitan exclusivamente a valores de
    color.
-   [ ] No se altera la lógica, estructura, contenido ni comportamiento
    de la aplicación.
-   [ ] No se agregan dependencias, componentes, selectores ni
    propiedades ajenas al objetivo cromático.
-   [ ] Los cambios se revisan mediante un diff y no contienen
    modificaciones accidentales.
-   [ ] Cualquier color que no se haya podido reemplazar de forma segura
    queda explicado, sin realizar cambios adicionales.

## Regla final

Si una tarea de diseño requiere modificar algo distinto de un valor de
color, **no la realices**. Conserva el código tal como está y limita el
trabajo a la paleta cromática.
