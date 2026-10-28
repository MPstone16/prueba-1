# Informe de Observaciones y Correcciones del Sistema

Este documento recopila las observaciones recientes sobre el funcionamiento de la aplicación, estructurándolas como requisitos técnicos y añadiendo un análisis de posibles incongruencias con normas o especificaciones anteriores.

## 1. Listado de Observaciones y Nuevos Requisitos

### 1.1. Control de Notificaciones de Sincronización en Inicio de Sesión
* **Descripción actual:** Al iniciar la aplicación, se muestran notificaciones de lecturas pendientes por sincronizar antes de que el usuario haya iniciado sesión.
* **Requisito corregido:** Las notificaciones y alertas sobre lecturas pendientes de sincronización **solo deben mostrarse** una vez que el usuario haya autenticado su sesión exitosamente en el sistema.

### 1.2. Codificación de Caracteres (Tildes y Símbolos)
* **Descripción actual:** Existen problemas visuales o de procesamiento en la representación de letras con tildes y otros símbolos especiales.
* **Requisito corregido:** Asegurar el uso estricto de codificación UTF-8 en toda la interfaz de usuario, almacenamiento local y transmisión de datos para garantizar la correcta visualización de tildes, eñes y caracteres especiales.

### 1.3. Visibilidad y Obligatoriedad de Carga de Fotografías
* **Descripción actual:** La opción de subir una foto se restringe o se confunde con su obligatoriedad.
* **Requisito corregido:** 
  * La opción para subir una foto **siempre debe estar habilitada** en la interfaz.
  * La obligatoriedad de la carga se aplicará únicamente en los casos establecidos por la regla de negocio.
  * En los casos donde sea estrictamente obligatorio, se añadirá un recuadro o indicador visual rojo para recalcar dicho requisito al usuario.

### 1.4. Sincronización de Mediciones Pendientes con Indicador en Línea
* **Descripción actual:** El indicador visual muestra que el dispositivo está en línea, pero las mediciones pendientes no se suben automáticamente.
* **Requisito corregido:** Sincronizar el estado lógico de conectividad con el servicio de sincronización en segundo plano. El indicador en línea debe reflejar una conexión real y activa con el servidor que dispare o permita reintentar la cola de envíos pendientes.

---

## 2. Análisis de Incongruencias con Normas Anteriores

Al integrar estas nuevas directrices, se deben tener en cuenta las siguientes posibles contradicciones con normativas o diseños previos:

1. **Norma de Experiencia de Usuario (UX) / Flujo de Autenticación:**
   * *Incongruencia:* Si las normas de seguridad anteriores exigían ocultar por completo cualquier dato del usuario antes del login, mostrar notificaciones de "lecturas pendientes" (aunque no muestren datos sensibles) podría violar principios de privacidad si la pantalla de bienvenida es pública.
   * *Condición:* Validar que las notificaciones previas al inicio de sesión no revelen información identificable del usuario anterior o del dispositivo sin una sesión activa.

2. **Norma de Validación de Formularios (UI/UX):**
   * *Incongruencia:* Las guías de diseño anteriores dictaban ocultar los campos opcionales o restringir acciones no permitidas en ciertos estados. 
   * *Condición:* La nueva directriz de mantener *siempre* visible y habilitado el botón de subir foto modifica esta norma; por tanto, se debe actualizar el manual de componentes para reflejar que la disponibilidad de la acción y su obligatoriedad son independientes (un elemento puede estar activo/disponible para uso voluntario aunque no sea obligatorio).

3. **Norma de Gestión de Red y Conectividad:**
   * *Incongruencia:* Los protocolos anteriores confiaban en que la detección de red por parte del sistema operativo iniciaba la sincronización de manera síncrona.
   * *Condición:* Dado que el indicador se enciende pero no sube los datos, existe una discrepancia entre la conectividad de red local (capa física/enlace) y la disponibilidad real del servidor backend (capa de aplicación). Se debe condicionar la sincronización a una verificación de *ping* o respuesta exitosa del servidor, y no solo a la señal de red del dispositivo.