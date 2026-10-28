# ADR-003: Estado compartido entre pantallas durante el registro de una lectura

## Estado
Aceptado

## Fecha
2026-10-27

## Requisitos relacionados
R1, R3, R4, R8

## Contexto
Varias pantallas deben conocer la sesión, los medidores, las lecturas locales, el borrador activo, el estado de conexión y los mensajes de operación. Además, el formulario puede abrirse desde distintas rutas y debe seguir usando la misma información sin mezclar un borrador de un medidor con otro.

## Alternativas consideradas

| Alternativa | Ventajas en este proyecto | Desventajas en este proyecto |
| :--- | :--- | :--- |
| **Opción A — Context API de React, alternativa seleccionada (API interna de React)** | Permite compartir estado en todo el árbol sin dependencia externa y integrar una única instancia compartida con Expo Router. | Cada actualización vuelve a evaluar los consumidores y requiere una memoización cuidadosa; no incorpora herramientas de depuración o persistencia propias. |
| **Opción B — Zustand (librería externa)** | API pequeña, permite selectores granulares y almacena lógica de sincronización sin envolver toda la aplicación. | Añade una dependencia y exigiría adoptar un patrón nuevo de estado cuya complejidad no está justificada por el número de estados compartidos. |
| **Opción C — Redux Toolkit (librería externa)** | Estructura estricta, mensajes tipados y herramientas de depuración para flujos complejos. | Es una solución sobredimensionada para un contexto móvil pequeño y obliga a escribir más capas (slices, acciones y selectores). |
| **Opción D — Paso de props por Expo Router / React (API interna)** | Hace explícito el flujo de datos y no necesita estado global. | Pasar sesión, caché, borrador y acciones por todas las rutas y componentes incrementaría acoplamiento y duplicaría fuentes de verdad. |

## Decisión
Se decide usar la **Context API de React** mediante un proveedor global y un hook compartido. El proveedor expondrá el estado de sesión, datos, borrador, conexión y las operaciones de consulta y envío de lecturas.

Este contexto coordinará la persistencia definida en el ADR-001 y expondrá únicamente el contrato necesario a las pantallas. Se empleará memoización para evitar reconstrucciones innecesarias y referencias para consultar el estado local más reciente dentro de operaciones asincrónicas.

## Consecuencias
* **Lo que gana el proyecto:** Las pantallas podrán leer los mismos datos sin propiedades encadenadas y las acciones sobre caché, borradores y sincronización tendrán una única implementación central. React y Expo Router mantienen el mismo modelo de navegación y componentes que el resto de la aplicación.
* **Lo que pierde o arriesga:** El contexto puede crecer si se agregan dominios independientes. Las actualizaciones globales pueden volver a renderizar consumidores que no usan todo el estado.
* **Obligaciones para el código:** Las pantallas deberán consumir el hook compartido dentro del proveedor. Las mutaciones persistentes deberán usar las operaciones expuestas y ningún componente podrá modificar la caché sin pasar por ese contrato.

## Verificación
* **Qué archivo revisar:** El proveedor compartido, el diseño de navegación y las pantallas que consumen el estado.
* **Qué prueba ejecutar:** Estado consistente, restauración del borrador y actualización del contador de pendientes.
* **Qué comportamiento observar en el teléfono:** Al navegar entre medidor, registro y historial, el borrador, la sesión y el contador de lecturas pendientes deberán conservarse sin perder datos.