# ADR-006: Captura y conservación de la foto del medidor

## Estado
Aceptado

## Fecha
2026-10-27

## Requisitos relacionados
R3, R4, R5, R8

## Contexto
La aplicación debe permitir tomar evidencia del medidor cuando existe daño o consumo anómalo. La fotografía debe sobrevivir reinicios y no perderse mientras una lectura espera conexión. La URI temporal entregada por la cámara no es una garantía suficiente de conservación y el archivo remoto debe quedar asociado a la lectura enviada.

## Alternativas consideradas

| Alternativa | Ventajas en este proyecto | Desventajas en este proyecto |
| :--- | :--- | :--- |
| **Opción A — Expo ImagePicker + Expo FileSystem + Cloudinary, alternativa seleccionada (Expo externo y servicio externo)** | `expo-image-picker` solicita permisos y captura imágenes; `expo-file-system` conserva una copia en el almacenamiento permanente; Cloudinary entrega una URL pública y segura para la lectura. | Involucra librerías externas a React Native y dos servicios diferentes; requiere mantener permisos, una plantilla de carga y la configuración remota de Cloudinary. |
| **Opción B — Expo Camera (librería externa del ecosistema Expo)** | Ofrece un componente de cámara completamente integrado y permite controlar la captura dentro de la interfaz. | Requiere implementar la presentación visual y el flujo de permisos manualmente; no aporta persistencia ni almacenamiento remoto adicional. |
| **Opción C — React Native Image Picker o APIs nativas (librería externa o API interna de React Native)** | Permite integrar selección o cámara desde componentes nativos. | La configuración nativa puede depender de módulos específicos y no está incluida de forma directa en el entorno Expo administrado del proyecto. |
| **Opción D — Firebase Storage (librería externa)** | Centraliza subida, autorización y descarga de archivos en una misma plataforma. | Condiciona el diseño a un proveedor específico, añade un SDK externo y no sustituye por sí solo la captura ni la copia local. |

## Decisión
Se decide usar **Expo ImagePicker** para solicitar permiso y abrir la cámara, **Expo FileSystem** para copiar la fotografía seleccionada a una ubicación permanente y **Cloudinary** para subirla al recuperar conexión.

Cuando el usuario tome una foto, el flujo persistirá una copia local antes de asociarla al borrador. Al sincronizarse, el URI local se utilizará para obtener una URL remota y ambas referencias se conservarán hasta confirmar el envío de la lectura.

## Consecuencias
* **Lo que gana el proyecto:** Las fotografías sobreviven al cierre de la aplicación y se pueden adjuntar a lecturas pendientes sin conexión. El almacenamiento temporal no queda como única fuente de evidencia y el servidor recibe una URL verificable.
* **Lo que pierde o arriesga:** Depende del espacio disponible en el dispositivo y de servicios externos. Una fotografía subida parcialmente debe conservar su URL remota para evitar cargas duplicadas y el borrado de la aplicación elimina las copias locales.
* **Obligaciones para el código:** Antes de guardar una lectura anómala o dañada deberá existir una URI. Cada foto deberá copiarse a almacenamiento permanente en dispositivos nativos. La sincronización solo reemplazará el estado pendiente después de recibir una URL remota y una lectura válida.

## Verificación
* **Qué archivo revisar:** El flujo de captura, el servicio de persistencia fotográfica y el coordinador de sincronización.
* **Qué prueba ejecutar:** Permiso denegado, captura, conservación tras reiniciar y subida sin duplicados.
* **Qué comportamiento observar en el teléfono:** La foto deberá aparecer en el formulario y seguir disponible después de reiniciar. En modo sin conexión permanecerá local; al recuperar señal se subirá una vez y quedará asociada a la lectura.