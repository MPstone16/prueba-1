# ADR-007: Detección de conexión y envío de lecturas pendientes

## Estado
Aceptado

## Fecha
2026-10-27

## Requisitos relacionados
R2, R3, R4, R8

## Contexto
La aplicación debe distinguir entre una red disponible y un servidor realmente alcanzable. Al recuperar la señal debe subir las lecturas pendientes y actualizar caché sin duplicar datos. Para evitar intentos inútiles, el estado de conexión necesita reaccionar a cambios de red y también cuando la aplicación vuelve a primer plano.

## Alternativas consideradas

| Alternativa | Ventajas en este proyecto | Desventajas en este proyecto |
| :--- | :--- | :--- |
| **Opción A — Expo Network + AppState de React Native, alternativa seleccionada (Expo y React Native internos al ecosistema)** | `expo-network` informa conectividad y alcance de internet; `AppState` permite reevaluar al volver a primer plano. Se complementa con una llamada real a la API. | Puede realizar comprobaciones duplicadas y necesita evitar sincronizaciones concurrentes mediante los estados y callbacks del contexto. |
| **Opción B — @react-native-community/netinfo (librería externa)** | Ofrece suscripción detallada a cambios de red y disponibilidad típica en aplicaciones React Native. | Añade una dependencia externa y no verifica por sí sola que la API objetivo esté alcanzable. |
| **Opción C — Sondeo periódico con `setInterval` (API interna de JavaScript)** | Permite revisar el backend incluso si no llegan eventos de red. | Consume batería y tráfico, puede generar solicitudes simultáneas y no aporta información inmediata sobre el cambio de red. |
| **Opción D — Sincronización manual exclusiva por botón** | El usuario decide cuándo consumir datos y no se ejecutan solicitudes en segundo plano. | Puede olvidar lecturas pendientes, extiende la espera y no satisface el envío automático esperado al recuperar conexión. |

## Decisión
Se decide usar **Expo Network** para detectar la red y **AppState de React Native** para reevaluar al activar la aplicación. El estado de conexión deberá considerarse disponible únicamente si existe conectividad, el alcance de internet no es negativo y una comprobación real confirma que el servidor responde.

Al recuperar conexión, el coordinador actualizará caché y lecturas remotas y luego procesará la cola local. La cola incluirá solo registros pendientes, conservará las fotos locales y evitará enviar de nuevo un registro si el servidor contiene una lectura equivalente.

## Consecuencias
* **Lo que gana el proyecto:** El usuario no debe presionar sincronizar y evita enviar datos mientras solo existe una red sin acceso al backend. La combinación de eventos, llamada real y reintentos al activar la app reduce estados falsos.
* **Lo que pierde o arriesga:** Las comprobaciones pueden consumir solicitudes adicionales y el cambio rápido de conectividad puede disparar varias evaluaciones. Existe una ventana mínima antes de iniciar la sincronización automática.
* **Obligaciones para el código:** No se deberá usar únicamente el indicador de red; se confirmarán también el alcance de internet y la disponibilidad del servidor. Toda sincronización será idempotente por medidor y mes, conservará los fallos en pendientes y mostrará su resultado al usuario.

## Verificación
* **Qué archivo revisar:** El coordinador de sincronización, el servicio HTTP y el almacenamiento local.
* **Qué prueba ejecutar:** Sin red, recuperación de señal, cola pendiente, fallo parcial y servidor inaccesible.
* **Qué comportamiento observar en el teléfono:** Sin conexión, las lecturas nuevas deberán guardarse en local y el contador pendiente deberá aumentar. Al volver la conexión y confirmar el servidor, el estado cambiará a disponible y las pendientes se marcarán como enviadas sin duplicarlas.