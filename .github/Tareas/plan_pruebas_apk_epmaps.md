# Plan de pruebas y validación para APK

## EPMAPS Field Water Meter Reader

**Objetivo:** ejecutar una validación reproducible de la aplicación
antes de aprobar la generación y entrega de un APK Android. Este
documento es una lista de ejecución para el agente de desarrollo; debe
registrar resultados reales y no marcar como aprobada una prueba que no
haya ejecutado.

------------------------------------------------------------------------

## 1. Instrucciones obligatorias para el agente

1.  Lee primero `README.md`, `app.json`, `.github/MEMORY.md`,
    `.github/Tareas/task_breakdown_for_multiple_agents.md`, las reglas
    de agente disponibles en `.github/Agents/` y el código de `src/`.
2.  Comprueba el estado del repositorio y no sobrescribas cambios del
    usuario. No elimines datos remotos de MockAPI ni de Cloudinary.
3.  Ejecuta primero las comprobaciones automatizadas de la sección 2.
4.  Después ejecuta las pruebas funcionales de las secciones 3--10. Usa
    datos de demostración y registra claramente qué pruebas requieren
    dispositivo Android, cámara o conexión real.
5.  **No simules resultados.** Si una prueba requiere hardware, una
    cuenta o una condición que no está disponible, márcala `BLOQUEADA` y
    explica qué falta.
6.  Si encuentras una contradicción de requisitos, una regla de negocio
    no especificada o necesitas un cambio estructural importante,
    detente y consulta al usuario antes de decidir por tu cuenta.
7.  No cambies el diseño, la arquitectura, las reglas de negocio ni
    dependencias como parte de una prueba sin autorización. Puedes
    corregir errores pequeños solo si las reglas del repositorio lo
    permiten; documenta cada cambio.
8.  Cada modificación del código o configuración debe registrarse en
    `.github/MEMORY.md`, siguiendo las reglas existentes del proyecto:
    archivo modificado, cambio, motivo y estado.
9.  No guardes claves, tokens, contraseñas privadas ni datos personales
    en el reporte.
10. Al terminar, genera un informe con: comandos ejecutados, resultados,
    pruebas aprobadas/fallidas/bloqueadas, defectos encontrados, cambios
    realizados y decisión final sobre el APK.

### Estados permitidos

-   `APROBADA`: ejecutada y cumple el resultado esperado.
-   `FALLIDA`: ejecutada y no cumple.
-   `BLOQUEADA`: no se pudo ejecutar por falta de dispositivo, permisos,
    acceso, servicio o dato.
-   `NO EJECUTADA`: aún no se intentó.

No marques una prueba como aprobada basándote únicamente en leer el
código.

------------------------------------------------------------------------

## 2. Validaciones automatizadas iniciales

Ejecuta desde la raíz del proyecto:

``` bash
npm install
npx expo-doctor
npx tsc --noEmit
npm run lint
npx expo config --type public
npx expo export --platform android
```

Si el entorno y los scripts lo permiten, ejecuta también:

``` bash
npx expo export --platform web
git diff --check
```

### Criterios

-   [ ] Dependencias instaladas sin errores.
-   [ ] `expo-doctor` no reporta problemas bloqueantes. Investiga y
    documenta cada advertencia.
-   [ ] TypeScript termina sin errores.
-   [ ] Lint ejecutado y resultado registrado.
-   [ ] Configuración pública de Expo se puede resolver.
-   [ ] El bundle Android se exporta correctamente.
-   [ ] Exportación web y `git diff --check`, si se ejecutan, terminan
    correctamente.

**Importante:** `npx expo export --platform android` genera el bundle de
JavaScript, **no un APK nativo**.

### Incidencia conocida que debe verificarse

El estado anterior del proyecto reportó un error de lint preexistente en
`src/hooks/use-color-scheme.web.ts` (`react-hooks/set-state-in-effect`),
mientras que los archivos de implementación modificados pasaban un lint
focalizado. Vuelve a ejecutar el lint completo y confirma el estado
actual. No ocultes el error ni lo marques como corregido sin evidencia.
Si sigue presente, separa el resultado del lint completo del resultado
del lint focalizado.

------------------------------------------------------------------------

## 3. US-01 --- Inicio de sesión, sesión y navegación protegida

Credenciales de práctica documentadas: empleado `DEMO-001`, PIN `1234`.
Son credenciales públicas de demostración, no adecuadas para
autenticación de producción.

  -----------------------------------------------------------------------------
  ID             Prueba         Pasos           Resultado        Estado
                                                esperado         
  -------------- -------------- --------------- ---------------- --------------
  AUTH-01        Acceso válido  Ingresar        Se inicia sesión NO EJECUTADA
                                `DEMO-001` y    y se muestra la  
                                `1234`.         pantalla         
                                                principal.       

  AUTH-02        Código         Ingresar un     Se rechaza el    NO EJECUTADA
                 incorrecto     código de       acceso con       
                                empleado        mensaje          
                                distinto.       entendible.      

  AUTH-03        PIN incorrecto Ingresar        Se rechaza el    NO EJECUTADA
                                `DEMO-001` con  acceso.          
                                PIN incorrecto.                  

  AUTH-04        Campos vacíos  Enviar el       Se valida el     NO EJECUTADA
                                formulario sin  dato requerido y 
                                código o sin    no se inicia     
                                PIN.            sesión.          

  AUTH-05        Persistencia   Iniciar sesión, La sesión se     NO EJECUTADA
                                cerrar          comporta según   
                                completamente y la persistencia  
                                volver a abrir  implementada,    
                                la aplicación.  sin pantalla     
                                                bloqueada ni     
                                                fallo.           

  AUTH-06        Cierre de      Cerrar sesión y La sesión se     NO EJECUTADA
                 sesión         tratar de       elimina y no se  
                                volver a una    permite acceder  
                                ruta protegida. a pantallas      
                                                protegidas sin   
                                                autenticación.   

  AUTH-07        Estado inicial Limpiar datos   Se presenta un   NO EJECUTADA
                 limpio         de la app o     estado inicial   
                                instalarla de   consistente y se 
                                nuevo y         puede iniciar    
                                abrirla.        sesión.          
  -----------------------------------------------------------------------------

**Riesgo de publicación:** confirmar con el responsable si el APK es
solo una demo académica. Si se usará en producción, la autenticación
hardcodeada debe reemplazarse por un mecanismo autorizado antes de
aprobar la publicación.

------------------------------------------------------------------------

## 4. US-02 --- Validación estricta del código de medidor

Formato permitido: `MED-` seguido exactamente de seis dígitos, por
ejemplo `MED-000001`.

  -----------------------------------------------------------------------------------
  ID             Prueba                Entrada/acción   Resultado      Estado
                                                        esperado       
  -------------- --------------------- ---------------- -------------- --------------
  MTR-01         Código válido         `MED-000001`     Se intenta     NO EJECUTADA
                                                        consultar el   
                                                        medidor.       

  MTR-02         Otro código válido    `MED-123456`     Pasa la        NO EJECUTADA
                                                        validación de  
                                                        formato; la    
                                                        existencia se  
                                                        verifica por   
                                                        separado.      

  MTR-03         Cinco dígitos         `MED-12345`      Se rechaza     NO EJECUTADA
                                                        antes de       
                                                        consultar la   
                                                        API.           

  MTR-04         Siete dígitos         `MED-1234567`    Se rechaza     NO EJECUTADA
                                                        antes de       
                                                        consultar la   
                                                        API.           

  MTR-05         Prefijo incorrecto    `ABC-123456`     Se rechaza.    NO EJECUTADA

  MTR-06         Letras en los dígitos `MED-12A456`     Se rechaza.    NO EJECUTADA

  MTR-07         Espacios/caracteres   Probar espacios  Se aplica la   NO EJECUTADA
                 extra                 al inicio/final, regla estricta 
                                       guion incorrecto definida por   
                                       y caracteres     el código; no  
                                       adicionales.     se consulta un 
                                                        formato        
                                                        inválido.      

  MTR-08         Campo vacío           Enviar sin       No consulta y  NO EJECUTADA
                                       código.          muestra        
                                                        validación.    

  MTR-09         Formato válido,       Usar un código   Mensaje de no  NO EJECUTADA
                 medidor inexistente   válido que no    encontrado,    
                                       exista en la     sin bloqueo ni 
                                       colección ni en  cierre         
                                       caché.           inesperado.    

  MTR-10         Medidor no cacheado   Desconectar red  Explica que no NO EJECUTADA
                 sin conexión          e ingresar un    está           
                                       código válido    disponible sin 
                                       que no esté      conexión.      
                                       guardado                        
                                       localmente.                     
  -----------------------------------------------------------------------------------

No elimines ni modifiques medidores reales para ejecutar estos casos.
Usa un código de prueba acordado o un entorno de demostración.

------------------------------------------------------------------------

## 5. US-03 y US-04 --- Registro de lectura y condición del medidor

Probar el flujo completo del asistente de tres pasos. Confirmar en la
interfaz cuáles campos son obligatorios y respetar la
implementación/documentación. No inventar reglas de negocio que no estén
especificadas.

### Condición normal

  ------------------------------------------------------------------------------
  ID             Prueba         Pasos          Resultado esperado Estado
  -------------- -------------- -------------- ------------------ --------------
  READ-01        Lectura normal Seleccionar    La lectura se      NO EJECUTADA
                 válida         condición      guarda y aparece   
                                normal e       en registros con   
                                ingresar una   su estado          
                                lectura        correspondiente.   
                                numérica                          
                                válida.                           
                                Completar y                       
                                confirmar.                        

  READ-02        Lectura vacía  Seleccionar    No permite         NO EJECUTADA
                                normal y dejar confirmar una      
                                la lectura     lectura normal     
                                vacía.         incompleta.        

  READ-03        Valor negativo Ingresar un    Se rechaza si la   NO EJECUTADA
                                número         regla de dominio   
                                negativo.      exige lecturas no  
                                               negativas;         
                                               documentar el      
                                               comportamiento     
                                               real.              

  READ-04        Texto no       Intentar       No se guarda un    NO EJECUTADA
                 numérico       introducir     valor numérico     
                                letras o       inválido.          
                                símbolos en la                    
                                lectura.                          

  READ-05        Menor que      Introducir un  Verificar la regla NO EJECUTADA
                 lectura        valor menor    implementada y     
                 anterior       que la lectura registrar el       
                                anterior.      resultado. Si no   
                                               existe regla       
                                               clara, marcar      
                                               bloqueada por      
                                               ambigüedad y       
                                               consultar.         

  READ-06        Igual a        Introducir el  Registrar el       NO EJECUTADA
                 lectura        mismo valor    comportamiento;    
                 anterior       anterior.      confirmar la regla 
                                               de negocio si no   
                                               está definida.     

  READ-07        Decimales      Probar un      Registrar si se    NO EJECUTADA
                                valor decimal, acepta o rechaza y 
                                si el campo lo confirmar la regla 
                                permite.       esperada antes de  
                                               modificar código.  
  ------------------------------------------------------------------------------

### Medidor inaccesible

  -----------------------------------------------------------------------------
  ID             Prueba         Pasos          Resultado         Estado
                                               esperado          
  -------------- -------------- -------------- ----------------- --------------
  READ-08        Sin motivo     Seleccionar    No permite        NO EJECUTADA
                                inaccesible y  finalizar sin el  
                                dejar vacío el motivo requerido. 
                                motivo.                          

  READ-09        Con motivo     Introducir un  Se registra la    NO EJECUTADA
                                motivo y       condición y el    
                                completar el   motivo; no exige  
                                flujo.         una lectura       
                                               numérica si así   
                                               lo define la      
                                               implementación.   
  -----------------------------------------------------------------------------

### Medidor dañado

  --------------------------------------------------------------------------
  ID             Prueba         Pasos          Resultado      Estado
                                               esperado       
  -------------- -------------- -------------- -------------- --------------
  READ-10        Sin            Seleccionar    No permite     NO EJECUTADA
                 descripción    dañado y dejar finalizar sin  
                                la descripción la descripción 
                                vacía.         requerida.     

  READ-11        Sin fotografía Intentar       Debe impedir   NO EJECUTADA
                                completar sin  el envío si la 
                                fotografía.    regla de daño  
                                               exige          
                                               evidencia      
                                               fotográfica.   

  READ-12        Con            Completar los  Se guarda el   NO EJECUTADA
                 descripción y  datos y        reporte con la 
                 fotografía     capturar       descripción y  
                                evidencia.     la referencia  
                                               a la           
                                               fotografía.    
  --------------------------------------------------------------------------

------------------------------------------------------------------------

## 6. US-05 --- Consumo anómalo, confirmación y fotografías

El criterio documentado es advertir cuando el consumo es **estrictamente
mayor que 3 veces el consumo promedio**. La fórmula que debe verificarse
es:

`consumo = lectura actual - lectura anterior`

Pruebas de frontera con lectura anterior `120` y promedio `10`:

  ---------------------------------------------------------------------------
  ID             Lectura actual          Consumo Resultado       Estado
                                       calculado esperado        
  ------------ ---------------- ---------------- --------------- ------------
  ANOM-01                   140               20 No superar el   NO EJECUTADA
                                                 umbral de 30;   
                                                 no debería      
                                                 disparar la     
                                                 alerta por esta 
                                                 regla.          

  ANOM-02                   150               30 Igual al        NO EJECUTADA
                                                 umbral: no debe 
                                                 alertar si la   
                                                 condición es    
                                                 estrictamente   
                                                 `> 3×`.         

  ANOM-03                   151               31 Debe mostrar    NO EJECUTADA
                                                 advertencia de  
                                                 anomalía y      
                                                 requerir        
                                                 confirmación    
                                                 explícita.      

  ANOM-04          Anomalía sin   Introducir una No permite      NO EJECUTADA
                   confirmación  lectura anómala terminar el     
                                      e intentar flujo.          
                                   finalizar sin                 
                                      confirmar.                 

  ANOM-05              Anomalía        Confirmar No permite      NO EJECUTADA
                 confirmada sin anomalía pero no finalizar si la 
                           foto         adjuntar anomalía        
                                     fotografía. requiere        
                                                 fotografía.     

  ANOM-06              Anomalía      Confirmar y Se puede        NO EJECUTADA
                 confirmada con   adjuntar foto. completar según 
                           foto                  las             
                                                 validaciones;   
                                                 la confirmación 
                                                 y evidencia     
                                                 quedan          
                                                 registradas.    
  ---------------------------------------------------------------------------

Verifica también promedios cero, valores inválidos y lectura actual
menor que la anterior. Si el comportamiento esperado no está definido,
no inventes la regla: documenta el caso y consulta al usuario.

### Cámara y persistencia local de fotografías

  ------------------------------------------------------------------------------------
  ID             Prueba         Pasos            Resultado esperado     Estado
  -------------- -------------- ---------------- ---------------------- --------------
  PHOTO-01       Permiso        Abrir captura y  Se abre la cámara y se NO EJECUTADA
                 concedido      conceder permiso puede tomar una foto.  
                                de cámara.                              

  PHOTO-02       Permiso        Denegar permiso  La app informa del     NO EJECUTADA
                 denegado       y tratar de      problema y no se       
                                capturar.        cierra                 
                                                 inesperadamente.       

  PHOTO-03       Cancelar       Abrir cámara y   Se regresa al flujo    NO EJECUTADA
                 cámara         cancelar.        sin guardar una foto   
                                                 falsa ni perder el     
                                                 borrador.              

  PHOTO-04       Vista previa   Capturar una     La vista previa        NO EJECUTADA
                                fotografía.      aparece y corresponde  
                                                 a la imagen capturada. 

  PHOTO-05       Persistencia   Capturar foto,   La foto local sigue    NO EJECUTADA
                                cerrar/reabrir   accesible.             
                                la app y                                
                                recuperar el                            
                                borrador.                               

  PHOTO-06       Error          Provocar un      La foto local y la     NO EJECUTADA
                 Cloudinary     fallo de red o   lectura pendiente se   
                                de subida en un  conservan; se puede    
                                entorno          reintentar.            
                                controlado.                             

  PHOTO-07       Subida         Con red          Se obtiene una URL     NO EJECUTADA
                 correcta       disponible,      pública válida y la    
                                completar la     lectura sincronizada   
                                subida.          contiene la URL        
                                                 esperada.              

  PHOTO-08       Galería        Comprobar si el  El código observado    NO EJECUTADA
                                requisito        usa                    
                                incluye          `launchCameraAsync`;   
                                seleccionar de   no dar por             
                                galería.         implementada la        
                                                 galería sin verificar  
                                                 el flujo real. Si se   
                                                 exige y no existe,     
                                                 reportar defecto.      
  ------------------------------------------------------------------------------------

No incluyas secretos de Cloudinary en el cliente. El proyecto documenta
un preset unsigned; verifica que solo se utilicen el nombre público de
cloud y el preset público, nunca una API secret.

------------------------------------------------------------------------

## 7. US-03 y US-06 --- Trabajo sin conexión y borradores

Realizar esta sección en un dispositivo o emulador Android cuando sea
posible. Primero sincroniza los medidores de prueba para que exista
caché local.

  -------------------------------------------------------------------------------
  ID             Prueba           Pasos            Resultado       Estado
                                                   esperado        
  -------------- ---------------- ---------------- --------------- --------------
  OFF-01         Preparar caché   Con conexión,    Los medidores   NO EJECUTADA
                                  iniciar sesión y consultados     
                                  consultar        quedan          
                                  medidores.       disponibles en  
                                                   caché según el  
                                                   diseño.         

  OFF-02         Activar modo sin Desactivar Wi-Fi La app refleja  NO EJECUTADA
                 conexión         y datos móviles. que no hay      
                                                   conexión.       

  OFF-03         Consultar        Buscar uno de    Permite         NO EJECUTADA
                 medidor cacheado los medidores    continuar con   
                                  descargados      los datos       
                                  previamente.     locales.        

  OFF-04         Registrar        Crear una        Se guarda       NO EJECUTADA
                 lectura offline  lectura válida   localmente como 
                                  sin red.         pendiente, sin  
                                                   pérdida de      
                                                   datos.          

  OFF-05         Fotografía       Capturar foto y  La fotografía   NO EJECUTADA
                 offline          completar una    se guarda       
                                  lectura que      localmente y el 
                                  requiera         registro queda  
                                  evidencia.       pendiente.      

  OFF-06         Cerrar y reabrir Con lecturas     Las lecturas,   NO EJECUTADA
                                  pendientes,      fotos y         
                                  cerrar por       borrador siguen 
                                  completo y abrir disponibles.    
                                  de nuevo.                        

  OFF-07         Recuperar        Avanzar          Se ofrece       NO EJECUTADA
                 borrador         parcialmente en  continuar o     
                                  el asistente,    descartar el    
                                  cerrar la app y  borrador y los  
                                  abrirla.         datos           
                                                   recuperados son 
                                                   correctos.      

  OFF-08         Descartar        Elegir descartar Se elimina      NO EJECUTADA
                 borrador         y volver al      únicamente el   
                                  flujo.           borrador        
                                                   elegido; no se  
                                                   borran lecturas 
                                                   distintas.      

  OFF-09         Reconectar       Reactivar red y  Los pendientes  NO EJECUTADA
                                  esperar la       comienzan a     
                                  sincronización   sincronizarse y 
                                  automática o     su estado se    
                                  usar el control  actualiza.      
                                  disponible.                      

  OFF-10         Pérdida de red   Interrumpir la   No se pierden   NO EJECUTADA
                 durante          red durante una  pendientes; se  
                 sincronización   sincronización   puede           
                                  controlada.      reintentar y no 
                                                   se generan      
                                                   duplicados.     
  -------------------------------------------------------------------------------

------------------------------------------------------------------------

## 8. US-07 --- Sincronización con MockAPI y Cloudinary

Usa solo los endpoints de demostración configurados en el proyecto.
Antes de empezar, registra el número de elementos de prueba existente
para distinguir los creados durante esta ejecución. No borres
colecciones.

  ------------------------------------------------------------------------------------------------
  ID             Prueba           Pasos                        Resultado esperado   Estado
  -------------- ---------------- ---------------------------- -------------------- --------------
  SYNC-01        API accesible    Verificar las colecciones    Se puede consultar   NO EJECUTADA
                                  `MEDIDOR` y `LECTURA`        `MEDIDOR` y el       
                                  configuradas en              endpoint `LECTURA`   
                                  `src/constants/config.ts`.   responde.            

  SYNC-02        Carga de         Iniciar la app con conexión. Los medidores demo   NO EJECUTADA
                 medidores demo                                que falten se crean  
                                                               de forma             
                                                               idempotente, sin     
                                                               duplicar los         
                                                               existentes.          

  SYNC-03        Lectura online   Guardar una lectura con      El registro aparece  NO EJECUTADA
                                  conexión.                    en la colección      
                                                               remota               
                                                               correspondiente      
                                                               después de           
                                                               sincronizar.         

  SYNC-04        Cola múltiple    Crear tres lecturas de       Las tres se          NO EJECUTADA
                 offline          prueba sin conexión y        sincronizan          
                                  reconectar.                  correctamente.       

  SYNC-05        URL de foto      Sincronizar una lectura con  La URL de foto       NO EJECUTADA
                                  foto.                        guardada se puede    
                                                               abrir y corresponde  
                                                               a la evidencia       
                                                               cargada.             

  SYNC-06        Fallo de API     Simular una respuesta        La lectura conserva  NO EJECUTADA
                                  fallida o desconectar red.   estado pendiente y   
                                                               muestra un error     
                                                               recuperable.         

  SYNC-07        Reintento        Recuperar conexión y         La lectura se envía  NO EJECUTADA
                                  reintentar.                  sin perder sus       
                                                               datos.               

  SYNC-08        Repetir          Ejecutar sincronización      No se crean          NO EJECUTADA
                 sincronización   varias veces para el mismo   registros            
                                  registro.                    duplicados.          

  SYNC-09        Interrupción y   Interrumpir el proceso,      Los pendientes       NO EJECUTADA
                 reinicio         cerrar y abrir la app.       sobreviven y pueden  
                                                               reintentarse sin     
                                                               duplicados.          

  SYNC-10        Indicadores      Comparar pendientes locales  Los                  NO EJECUTADA
                                  y registros enviados.        contadores/estados   
                                                               de la interfaz       
                                                               corresponden con los 
                                                               datos reales.        
  ------------------------------------------------------------------------------------------------

No hagas pruebas destructivas contra datos de terceros. Si no existe un
entorno separado de prueba, usa registros identificables como pruebas y
no alteres los registros preexistentes.

------------------------------------------------------------------------

## 9. US-08 --- Edición, bloqueo y duplicados por mes

  -------------------------------------------------------------------------------
  ID             Prueba         Pasos            Resultado         Estado
                                                 esperado          
  -------------- -------------- ---------------- ----------------- --------------
  REC-01         Lectura        Abrir una        Se permiten los   NO EJECUTADA
                 pendiente      lectura          cambios y se      
                 editable       pendiente y      conservan al      
                                editarla.        guardar.          

  REC-02         Lectura        Abrir una        No se puede       NO EJECUTADA
                 enviada        lectura ya       editar.           
                 bloqueada      enviada.                           

  REC-03         Duplicado en   Enviar una       Se bloquea el     NO EJECUTADA
                 el mismo mes   lectura de un    segundo envío.    
                                medidor y tratar                   
                                de registrar                       
                                otra del mismo                     
                                medidor durante                    
                                el mes actual.                     

  REC-04         Borrador de    Tener un         Se solicita       NO EJECUTADA
                 otro medidor   borrador abierto continuar o       
                                e intentar       descartar el      
                                iniciar otro     borrador          
                                medidor.         existente según   
                                                 el comportamiento 
                                                 documentado.      

  REC-05         Distinto mes   Verificar el     La regla mensual  NO EJECUTADA
                                comportamiento   funciona conforme 
                                al cambiar       al requisito. No  
                                `monthKey` en un alterar la fecha  
                                entorno          real del          
                                controlado o con dispositivo de    
                                pruebas          uso cotidiano sin 
                                unitarias.       control.          

  REC-06         Identidad de   Editar un        Se                NO EJECUTADA
                 registro       pendiente y      actualiza/envía   
                                sincronizarlo.   el registro       
                                                 correcto, sin     
                                                 generar una       
                                                 segunda lectura   
                                                 accidental.       
  -------------------------------------------------------------------------------

------------------------------------------------------------------------

## 10. Interfaz, navegación y estabilidad

  ------------------------------------------------------------------------------------
  ID             Prueba         Pasos                  Resultado        Estado
                                                       esperado         
  -------------- -------------- ---------------------- ---------------- --------------
  UI-01          Inicio sin     Abrir en instalación   No hay pantalla  NO EJECUTADA
                 datos          limpia.                en blanco, error 
                                                       fatal ni         
                                                       indicador        
                                                       infinito.        

  UI-02          Flujo de tres  Completar y retroceder Navegación       NO EJECUTADA
                 pasos          entre los pasos del    coherente y      
                                asistente.             datos            
                                                       introducidos     
                                                       conservados al   
                                                       volver.          

  UI-03          Teclado        Introducir lectura.    Teclado y        NO EJECUTADA
                 numérico                              formato de       
                                                       entrada son      
                                                       adecuados al     
                                                       tipo de dato.    

  UI-04          Pantalla       Probar un              Los botones,     NO EJECUTADA
                 pequeña        dispositivo/emulador   campos y textos  
                                de tamaño reducido.    siguen siendo    
                                                       utilizables y no 
                                                       quedan           
                                                       inaccesibles.    

  UI-05          Botón Atrás    Usar el botón/gesto    No se pierden    NO EJECUTADA
                 Android        atrás en cada          datos sin aviso  
                                pantalla.              ni se accede a   
                                                       rutas            
                                                       incorrectas.     

  UI-06          Segundo plano  Minimizar la app y     La app recupera  NO EJECUTADA
                                volver después.        el estado sin    
                                                       bloquearse; la   
                                                       sincronización   
                                                       sigue las reglas 
                                                       previstas.       

  UI-07          Orientación    Confirmar la           La app se        NO EJECUTADA
                                orientación            comporta         
                                configurada en         conforme a la    
                                `app.json`.            orientación      
                                                       definida.        

  STAB-01        Varias         Crear al menos 20      No hay cierres,  NO EJECUTADA
                 lecturas       lecturas de prueba,    corrupción local 
                                incluyendo algunas     ni pérdidas de   
                                pendientes, si el      datos.           
                                entorno lo permite.                     

  STAB-02        Varias         Capturar varias fotos  No hay           NO EJECUTADA
                 fotografías    de prueba y revisar su referencias      
                                persistencia.          rotas ni pérdida 
                                                       de evidencia.    

  STAB-03        Errores de red Probar timeout,        Mensajes         NO EJECUTADA
                                desconexión y          comprensibles,   
                                recuperación.          controles        
                                                       recuperables y   
                                                       sin bloqueo      
                                                       indefinido.      
  ------------------------------------------------------------------------------------

------------------------------------------------------------------------

## 11. Verificación de configuración antes del APK

Revisa `app.json`, configuración de Expo y variables/constantes del
proyecto.

-   [ ] El nombre visible de la app es el nombre final aprobado;
    actualmente el contexto del proyecto reporta `prueba-1`.
-   [ ] El `slug` y el `scheme` son intencionales.
-   [ ] Existe un `android.package` único y aprobado antes de crear una
    versión distribuible. No inventar uno ni cambiarlo si ya se publicó
    una app con ese identificador.
-   [ ] El icono y los recursos Android existen y se ven correctamente.
-   [ ] Los permisos de cámara están configurados y la aplicación no
    solicita permisos innecesarios.
-   [ ] No se incluyen secretos privados en el bundle.
-   [ ] API base, nombres de colecciones y preset público de Cloudinary
    apuntan al entorno deseado.
-   [ ] Se ha confirmado si el APK es para demostración o para uso real.
    La autenticación hardcodeada solo es aceptable para la demo.
-   [ ] No hay información personal real en los datos de prueba ni en
    capturas/logs de diagnóstico.

Si algún punto implica un cambio de identidad de aplicación, backend,
credenciales o arquitectura, consulta antes de realizarlo.

------------------------------------------------------------------------

## 12. Construcción del APK nativo

La exportación de JavaScript no demuestra que el APK compile. Tras
aprobar las comprobaciones anteriores:

1.  Inspecciona la configuración actual de Expo/EAS y las instrucciones
    del proyecto.
2.  Comprueba si el proyecto tiene `eas.json` y un perfil Android que
    genere **APK instalable**. No asumas que el perfil por defecto
    produce APK; puede producir AAB.
3.  Si falta configuración, prepara una propuesta mínima y solicita
    confirmación antes de hacer cambios estructurales o que definan la
    identidad de la aplicación.
4.  Genera el APK usando el flujo de compilación disponible y
    autorizado. Si el entorno no tiene credenciales o acceso de build,
    marca la tarea `BLOQUEADA`; no afirmes que existe un APK.
5.  Conserva el enlace/ruta y los logs reales del artefacto generado.

Documentación de referencia: https://docs.expo.dev/build/introduction/

### Instalación y prueba en Android real

-   [ ] Instalar el APK en un dispositivo Android compatible.
-   [ ] Confirmar que abre sin depender de Expo Go ni del servidor
    Metro.
-   [ ] Repetir inicio de sesión, validación de medidor, registro,
    cámara y recuperación de borrador.
-   [ ] Repetir registro offline y sincronización al recuperar la
    conexión.
-   [ ] Confirmar que los permisos de cámara funcionan en la instalación
    nativa.
-   [ ] Cerrar la app desde el selector de aplicaciones y volver a
    abrirla.
-   [ ] Confirmar que no hay cierres inesperados ni pantallas en blanco.
-   [ ] Probar al menos un flujo completo de lectura normal y uno de
    lectura que requiera evidencia.
-   [ ] Registrar modelo del dispositivo, versión Android, versión de la
    app y resultado.

**No aprobar la entrega final del APK solo porque el build terminó:** la
instalación y las pruebas nativas deben ejecutarse.

------------------------------------------------------------------------

## 13. Registro de resultados

El agente debe completar esta tabla durante la ejecución:

  Área                        Aprobadas   Fallidas   Bloqueadas Observaciones / evidencia
  ------------------------- ----------- ---------- ------------ ---------------------------
  Automatizadas                                                 
  Inicio de sesión                                              
  Validación de medidor                                         
  Registro de lectura                                           
  Anomalías y fotos                                             
  Offline y borradores                                          
  Sincronización                                                
  Edición y duplicados                                          
  UI y estabilidad                                              
  Build e instalación APK                                       

### Formato mínimo para cada defecto

-   **ID:**
-   **Severidad:** bloqueante / alta / media / baja
-   **Pasos para reproducir:**
-   **Resultado esperado:**
-   **Resultado obtenido:**
-   **Dispositivo/entorno:**
-   **Evidencia/log sin secretos:**
-   **Archivo(s) implicado(s), si se identificaron:**
-   **Estado:** abierto / corregido / pendiente de confirmación

------------------------------------------------------------------------

## 14. Criterio final de aprobación

### Apto para APK de prueba

Puede considerarse apto para un **APK de prueba** cuando: - Las
comprobaciones automatizadas principales pasan o sus excepciones están
justificadas y no bloquean Android. - No hay fallos bloqueantes en los
flujos de inicio de sesión, registro, almacenamiento local, fotos o
sincronización. - El APK nativo se construyó, se instaló y se probó en
un dispositivo Android real. - Los resultados y defectos conocidos están
documentados.

### Apto para publicación/uso real

No declararlo apto para producción mientras: - La autenticación siga
basada únicamente en credenciales hardcodeadas de demostración. -
Existan fallos bloqueantes o pérdida de lecturas/fotografías. - No se
haya verificado el comportamiento nativo de cámara, almacenamiento,
permisos y sincronización. - La configuración de identidad de app,
backend y datos de producción no esté aprobada.

### Decisión del agente

Al finalizar, elegir exactamente una opción y justificarla con
evidencias:

-   `APTO PARA APK DE PRUEBA`
-   `NO APTO: HAY FALLOS BLOQUEANTES`
-   `BLOQUEADO: FALTAN DISPOSITIVO, ACCESO O CONFIGURACIÓN`
-   `NO APTO PARA PRODUCCIÓN: PENDIENTES DE SEGURIDAD/OPERACIÓN`

No marcar `APTO PARA APK DE PRUEBA` si no existe un APK nativo instalado
y probado.
