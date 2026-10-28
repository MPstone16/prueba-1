# ADR-004: Validación de datos que ingresa el técnico y de los datos recibidos

## Estado
Aceptado

## Fecha
2026-10-27

## Requisitos relacionados
R3, R4, R5, R6

## Contexto
El sistema debe impedir lecturas negativas o menores que la lectura anterior, exigir motivos y descripciones según el estado del medidor y solicitar confirmación y fotografía ante consumos anómalos. También debe rechazar respuestas remotas con campos o formas desconocidas antes de mezclarlas con la caché.

## Alternativas consideradas

| Alternativa | Ventajas en este proyecto | Desventajas en este proyecto |
| :--- | :--- | :--- |
| **Opción A — Validadores propios con TypeScript, alternativa seleccionada (API interna del lenguaje y React Native)** | Permiten validar exactamente las reglas del dominio sin agregar dependencias y producen errores visibles y controlados por la interfaz. | Las reglas pueden duplicarse entre formulario, contexto y transformación de API si no se mantienen en funciones claras. |
| **Opción B — Zod (librería externa)** | Define esquemas reutilizables y transforma datos desconocidos con inferencia de tipos. | Añadiría una dependencia para describir conjuntos de datos pequeños y requeriría definir y mantener tipos y mensajes separados de las reglas del dominio. |
| **Opción C — Yup (librería externa)** | Se integra bien con librerías de formularios y proporciona reglas declarativas y mensajes de validación. | Depende de otro componente de formulario y no valida por sí solo todas las reglas compartidas antes del guardado local. |
| **Opción D — Validación exclusiva en el servidor** | Centralizaría las reglas de integridad en un único origen. | No protege la aplicación contra fallos cuando está sin conexión y no ofrece retroalimentación inmediata al técnico. |

## Decisión
Se decide usar **validación propia y tipado en TypeScript** en dos fronteras. La interfaz deberá validar el paso visible y ofrecer mensajes inmediatos. Antes de crear una lectura local, el coordinador de la aplicación deberá repetir las reglas críticas para impedir que datos inválidos lleguen a la cola.

Las respuestas desconocidas del servicio HTTP deberán convertirse mediante validadores internos que acepten únicamente códigos, estados, meses y campos numéricos válidos. Este enfoque no utilizará Zod, Yup ni otros validadores externos.

## Consecuencias
* **Lo que gana el proyecto:** Los errores aparecen donde el técnico los puede corregir y las operaciones locales no confían en una respuesta remota. La validación puede ejecutarse sin conexión y comparte reglas de dominio con el estado tipado.
* **Lo que pierde o arriesga:** No existe un esquema único que genere automáticamente todas las validaciones ni documentación de contratos desde una dependencia. Los cambios de reglas deben mantenerse sincronizados en formulario, contexto y API.
* **Obligaciones para el código:** Toda lectura deberá validarse antes de guardar o enviar y toda respuesta remota deberá transformar datos desconocidos. Los valores ingresados se normalizarán y se compararán con los límites calculados del medidor.

## Verificación
* **Qué archivo revisar:** El formulario, el coordinador de aplicación y el servicio HTTP.
* **Qué prueba ejecutar:** Lectura negativa o menor, condición incompleta, consumo anómalo, respuesta mal formada y foto requerida.
* **Qué comportamiento observar en el teléfono:** El formulario no deberá avanzar ni guardar valores inválidos, explicará qué falta y conservará la entrada corregible. Una respuesta remota mal formada no deberá reemplazar los datos locales.