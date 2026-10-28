# ADR-002: Comunicación con la API y manejo de caché

## Estado
Aceptado

## Fecha
2026-10-27

## Requisitos relacionados
R2, R3, R4, R8

## Contexto
La aplicación deberá consultar medidores y lecturas desde una API remota y seguir mostrando información útil cuando no exista conexión. Se requiere una cola local de lecturas pendientes, evitar duplicados mensuales y combinar datos remotos con cambios locales sin perder información.

## Alternativas consideradas

| Alternativa | Ventajas en este proyecto | Desventajas en este proyecto |
| :--- | :--- | :--- |
| **Opción A — Axios, alternativa seleccionada (librería externa)** | `axios` ofrece configuración central de URL, tiempo de espera y cabeceras; permite tipar respuestas y observar errores HTTP de forma uniforme. | Añade una dependencia externa y una instancia HTTP propia, aunque el resultado es mantenible para un volumen pequeño de recursos. |
| **Opción B — Fetch de React Native (API interna de React Native)** | Está disponible sin una dependencia adicional y satisface las solicitudes básicas de JSON. | Se necesita implementar manualmente la transformación de errores HTTP, el control de `timeout`, la reutilización de cabeceras y el parseo tipado. |
| **Opción C — TanStack Query con caché remota** | Resuelve caché, reintentos, invalidación y sincronización en segundo plano con una API declarativa. | Introduce estado derivado adicional y no reemplaza por sí solo la cola local persistente ni las reglas de conflicto mensual del proyecto. |
| **Opción D — SDK de base remota como Firebase** | Simplifica autenticación, persistencia y suscripción a datos en tiempo real. | Introduce un modelo de datos y servicios propios que condicionan el diseño de la aplicación y exigen una configuración externa adicional. |

## Decisión
Se decide usar **Axios** como cliente HTTP externo para consultar y crear los recursos `MEDIDOR` y `LECTURA`. Las llamadas deberán compartir configuración de URL, timeout y cabeceras en un módulo de servicios.

La caché local se administrará según el ADR-001. Antes de sincronizar, se combinarán las lecturas locales y remotas por medidor y mes. Una lectura pendiente conservará su estado local si entra en conflicto con una lectura distinta del servidor; si coincide con una ya enviada, se marcará como sincronizada sin duplicarla.

## Consecuencias
* **Lo que gana el proyecto:** Se podrían reutilizar timeout y cabeceras comunes, separar el acceso HTTP de las pantallas y presentar una caché recuperable aun sin conexión. La combinación de datos permitiría evitar duplicados y preservar lecturas pendientes.
* **Lo que pierde o arriesga:** Axios requiere una dependencia externa y cada respuesta sigue necesitando validación. El flujo de caché y sincronización es custom, por lo que las estrategias de reintento deben mantenerse en la aplicación.
* **Obligaciones para el código:** Toda operación remota deberá pasar por un único servicio HTTP; cada respuesta deberá validar su forma antes de utilizarla. La sincronización deberá conservar la fotografía local y las lecturas pendientes hasta recibir una confirmación válida.

## Verificación
* **Qué archivo revisar:** El módulo de servicios HTTP, el almacenamiento local y el coordinador de sincronización.
* **Qué prueba ejecutar:** Respuestas válidas, lectura desde caché, cola pendiente y sincronización sin duplicados.
* **Qué comportamiento observar en el teléfono:** Con conexión, los datos remotos deberán actualizar la caché; sin conexión, la información local seguirá disponible y una lectura creada fuera de línea no deberá enviarse de nuevo si el servidor confirma una coincidencia equivalente.