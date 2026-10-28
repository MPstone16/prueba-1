# ADR-005: Manejo de formularios

## Estado
Aceptado

## Fecha
2026-10-27

## Requisitos relacionados
R3, R4, R5, R8

## Contexto
El registro de una lectura utiliza tres pasos: estado y lectura, evidencia y confirmación. El avance debe estar limitado por validaciones, pero cada cambio debe conservarse para que un cierre inesperado o una navegación no elimine el progreso. También existen campos dinámicos según si el medidor está normal, inaccesible o dañado.

## Alternativas consideradas

| Alternativa | Ventajas en este proyecto | Desventajas en este proyecto |
| :--- | :--- | :--- |
| **Opción A — useState de React y componentes internos, alternativa seleccionada (API interna de React y React Native)** | Permite un estado serializable y tipado por `ReadingDraft`, facilita persistir el borrador completo y muestra cada paso sin mover datos a una librería externa. | El componente contiene reglas de navegación y renderizado, por lo que puede volverse extenso si el formulario crece mucho. |
| **Opción B — React Hook Form (librería externa)** | Automatiza registro de campos, validación, estados de modificación y controles no controlados. | Para este alcance pequeño, introduciría una abstracción adicional y requeriría integración explícita con el borrador tipado y el flujo persistente de tres pasos. |
| **Opción C — Formik (librería externa)** | Centraliza valores, errores y navegaciones de formularios con una API declarativa y conocida. | Añadiría una dependencia para dependencias internas simples y requeriría una estrategia adicional para guardar y restaurar valores por paso. |
| **Opción D — Formulario nativo de múltiples pantallas (API interna de Expo Router)** | Separaría claramente cada paso en rutas independientes y permitiría reconstruir el historial. | Dividiría el borrador y la navegación en varias pantallas, duplicaría el uso de parámetros y dificultaría volver al mismo estado compartido. |

## Decisión
Se decide administrar el formulario con **`useState` de React** y componentes internos. La información se modelará mediante un tipo `ReadingDraft` y se persistirá inmediatamente desde el contexto compartido.

El formulario tendrá los pasos `0`, `1` y `2`, aplicará validación antes de avanzar y podrá restaurarse desde una lectura pendiente o desde el borrador guardado. Los cambios de texto, estado, fotografía, confirmación y paso actual actualizarán el mismo objeto tipado.

## Consecuencias
* **Lo que gana el proyecto:** El formulario es fácil de inspeccionar, puede recuperarse después de reiniciar y no requiere dependencias de formularios externas. Los campos dinámicos se representan con un único modelo que también puede guardarse en AsyncStorage.
* **Lo que pierde o arriesga:** React podría realizar renderizados completos del objeto al cambiar campos y el componente concentraría más lógica que una abstracción dedicada. No habría validadores declarativos ni esquemas reutilizables automáticos.
* **Obligaciones para el código:** Cada cambio deberá pasar por una operación única que limpie errores y persista el borrador. Antes de continuar se ejecutará la validación del paso; la navegación solo permitirá avanzar o retroceder si el paso conserva datos válidos.

## Verificación
* **Qué archivo revisar:** El formulario, el contexto compartido y el modelo de borrador.
* **Qué prueba ejecutar:** Avance por pasos, campos dinámicos, cierre y restauración, y bloqueo de datos incompletos.
* **Qué comportamiento observar en el teléfono:** Los tres pasos deberán ser navegables y los campos deberán cambiar según el estado elegido. Después de cerrar o cambiar de pantalla, el progreso deberá aparecer en el mismo paso y con los mismos datos.

