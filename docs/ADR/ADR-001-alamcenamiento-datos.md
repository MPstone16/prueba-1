# ADR-001: Almacenamiento local de datos en el dispositivo

## Estado
Aceptado

## Fecha
2026-10-27

## Requisitos relacionados
R1, R3, R4, R8

## Contexto
La aplicación móvil está diseñada para técnicos de campo en zonas rurales donde la conectividad a internet puede ser intermitente o inexistente. El sistema exige que el técnico pueda iniciar sesión una sola vez y mantenerla activa, consultar los detalles de los medidores en caché sin señal, registrar lecturas y conservar borradores de formularios ante cierres inesperados de la aplicación.

## Alternativas consideradas

| Alternativa | Ventajas en este proyecto | Desventajas en este proyecto |
| :--- | :--- | :--- |
| **Opción A: AsyncStorage para todo (incluyendo sesión), alternativa descartada** | API sencilla y unificada para almacenar todos los estados y datos en formato de texto plano. | Inseguro para credenciales o tokens de sesión, ya que los datos no se cifran en el almacenamiento del dispositivo. |
| **Opción B: SQLite / WatermelonDB** | Permite consultas SQL complejas y relaciones avanzadas para grandes volúmenes de datos locales. | Sobreingeniería y complejidad innecesaria para el volumen acotado de medidores y lecturas de la demostración. |
| **Opción C: SecureStore + AsyncStorage, alternativa seleccionada (Expo y librería externa)** | Protege la sesión con cifrado de plataforma y mantiene caché, cola y borradores en una API de persistencia sencilla. | Exige operar dos mecanismos de almacenamiento y manejar serialización JSON de forma asíncrona. |

## Decisión
Se decide utilizar una estrategia híbrida empleando **Expo SecureStore** exclusivamente para conservar la sesión del empleado de forma cifrada en el dispositivo, y **AsyncStorage** para almacenar el caché de medidores, la cola de lecturas pendientes, los borradores del asistente de tres pasos y la preferencia de tema visual.

## Consecuencias
* **Lo que gana el proyecto:** Se garantiza la seguridad básica de la sesión mediante cifrado de plataforma y se asegura la disponibilidad completa de la aplicación sin conexión, permitiendo registrar lecturas y recuperar borradores sin pérdida de datos.
* **Lo que pierde o arriesga:** Se deben gestionar operaciones asíncronas adicionales al leer y escribir en el almacenamiento local, y se requiere lógica explícita para serializar y deserializar objetos JSON en AsyncStorage.
* **Obligaciones para el código:** Toda lectura o escritura de sesión deberá enrutarse a través de SecureStore, o usar AsyncStorage en plataformas sin soporte seguro. El caché y los borradores deberán manejarse mediante funciones auxiliares tipadas y valores predeterminados seguros.

## Verificación
* **Qué archivo revisar:** El servicio de persistencia y el coordinador del estado global.
* **Qué prueba ejecutar:** Persistencia de sesión, conservación de lecturas y fotos tras reiniciar y recuperación de borradores.
* **Qué comportamiento observar en el teléfono:** Al reiniciar la aplicación sin conexión, la sesión deberá permanecer activa si no fue cerrada y los borradores o lecturas pendientes deberán seguir disponibles.
