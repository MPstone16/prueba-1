# Informe de ejecucion — plan de pruebas APK EPMAPS

**Fecha:** 2026-10-27
**Entorno:** Windows, Node.js 25.3.0, Java 25.0.1.
**Alcance:** validaciones automatizadas, consultas GET de solo lectura y comprobacion de prerrequisitos. No se simularon interacciones de dispositivo.

## Resumen

| Area | Aprobadas | Fallidas | Bloqueadas | Observaciones |
|---|---:|---:|---:|---|
| Automatizadas | 8 | 1 | 0 | Lint completo falla en un hook web; TypeScript quedo aprobado tras corregir una ruta residual. |
| Inicio de sesion | 0 | 0 | 7 | Requiere ejecutar la app en un dispositivo o emulador. |
| Validacion de medidor | 0 | 0 | 10 | Requiere interaccion con la app. |
| Registro de lectura | 0 | 0 | 12 | Requiere completar el asistente en un dispositivo. |
| Anomalias y fotos | 0 | 0 | 14 | Requiere camara, persistencia local y/o carga real. |
| Offline y borradores | 0 | 0 | 10 | Requiere dispositivo, almacenamiento y control de conectividad. |
| Sincronizacion | 1 | 0 | 9 | SYNC-01 aprobado con GET; no se crearon ni borraron registros remotos. |
| Edicion y duplicados | 0 | 0 | 6 | Requiere usar la app y completar lecturas. |
| UI y estabilidad | 0 | 0 | 10 | Requiere dispositivo y ejecucion interactiva. |
| Build e instalacion APK | 0 | 0 | 1 | Sin SDK/ADB, sin `eas.json` y sin `android.package` aprobado. |

Las 79 pruebas funcionales de interfaz/dispositivo suman **1 aprobada y 78 bloqueadas**. `SYNC-01` es la unica prueba funcional ejecutada: comprobacion de acceso HTTP a las dos colecciones configuradas. Ninguna prueba se aprobo por inspeccion del codigo solamente.

## Validaciones automatizadas

| Comando | Resultado | Evidencia |
|---|---|---|
| `npm install` | APROBADA con advertencias | Termino sin error. npm reporto 6 avisos de vulnerabilidad (3 moderados y 3 altos) y un script de instalacion de `unrs-resolver` pendiente de aprobacion. No se ejecuto `npm audit fix`. |
| `npx expo-doctor` | APROBADA | 21/21 comprobaciones pasaron. |
| `npx tsc --noEmit` | APROBADA tras correccion | La primera ejecucion fallo porque `src/components/app-tabs.web.tsx` apuntaba a `/explore`, ruta eliminada. Se retiro la pestaña obsoleta en las variantes nativa y web; la repeticion termino sin errores. |
| `npm run lint` | FALLIDA | Un error `react-hooks/set-state-in-effect` en `src/hooks/use-color-scheme.web.ts:11`, al llamar `setHasHydrated(true)` sincronicamente desde un efecto. |
| `npx eslint src/app src/components src/context src/services src/constants src/types src/utils` | APROBADA | Lint focalizado sin errores tras la correccion. |
| `npx expo config --type public` | APROBADA con observacion | La configuracion publica se resolvio. Nombre `prueba-1`, slug `prueba-1`, scheme `prueba1`; no hay `android.package`. La salida incluye `android.permission.RECORD_AUDIO` ademas de la configuracion `blockedPermissions`; el permiso efectivo debe verificarse en el manifiesto nativo antes de distribuir. |
| `npx expo export --platform android` | APROBADA | Se genero el bundle JavaScript Android en `dist`; esto **no** es un APK nativo. |
| `npx expo export --platform web` | APROBADA | Exportacion estatica correcta; rutas `/`, `/meter`, `/reading`, `/records` y rutas auxiliares. |
| `git diff --check` | APROBADA | Sin errores de whitespace; Git mostro advertencias de conversion LF/CRLF en los dos archivos de navegacion modificados. |

## Pruebas funcionales y de servicios

### Ejecutada

- **SYNC-01 — APROBADA:** GET de solo lectura a `MEDIDOR` y `LECTURA`, usando las URL de demostracion configuradas. Ambas respondieron HTTP 200. `MEDIDOR` devolvio 5 elementos, los 5 compatibles con el formato y campos numericos esperados; `LECTURA` devolvio 0 elementos.
- No se imprimieron datos personales, no se realizaron POST/PUT/DELETE y no se modificaron colecciones remotas.

### Bloqueadas

Las siguientes pruebas quedan `BLOQUEADA` porque el entorno no dispone de Android SDK, `adb`, emulador ni dispositivo conectado; no se abrio la aplicacion:

- `AUTH-01` a `AUTH-07`.
- `MTR-01` a `MTR-10`.
- `READ-01` a `READ-12`.
- `ANOM-01` a `ANOM-06` y `PHOTO-01` a `PHOTO-08`.
- `OFF-01` a `OFF-10`.
- `SYNC-02` a `SYNC-10`.
- `REC-01` a `REC-06`.
- `UI-01` a `UI-07` y `STAB-01` a `STAB-03`.

No se generaron lecturas de prueba, no se probaron carga a Cloudinary, modo offline, camara, permisos, restauracion de borradores ni reintentos de sincronizacion.

## Configuracion APK y prerrequisitos

- Los recursos referenciados de icono, splash y favicon existen.
- `eas.json` no existe y `android.package` no esta configurado. No se invento un identificador de aplicacion ni se modifico la identidad.
- Java esta instalado, pero `ANDROID_HOME` y `ANDROID_SDK_ROOT` estan vacios; no hay `adb` ni `gradle` disponibles.
- La autenticacion sigue usando credenciales publicas hardcodeadas de demostracion; no es aceptable para produccion.
- El nombre, slug, scheme, destino de backend y uso final del APK requieren aprobacion del responsable antes de una distribucion.
- No se genero ni instalo un APK nativo.

## Defectos y cambios

1. **Lint completo — severidad baja, abierto.** `src/hooks/use-color-scheme.web.ts:11` incumple la regla `react-hooks/set-state-in-effect`. Se deja sin cambios por ser ajeno a la correccion de navegacion y no ocultar el fallo.
2. **Avisos de dependencias — pendiente de analisis.** `npm install` reporto 3 vulnerabilidades moderadas y 3 altas; no se aplicaron actualizaciones automaticas.
3. **Ruta Explore residual — corregida.** Se elimino el enlace a `/explore` de las variantes de pestañas nativa/web, ya que esa ruta no existe. TypeScript volvio a pasar. El cambio se registro en `.github/MEMORY.md`.

No se hicieron otros cambios de codigo/configuracion ni cambios de datos remotos.

## Decision final

**`BLOQUEADO: FALTAN DISPOSITIVO, ACCESO O CONFIGURACION`**

Hay comprobaciones automatizadas aprobadas, pero no se puede aprobar la entrega ni declarar aptitud de prueba sin un APK nativo instalado y probado. Para continuar se necesita un identificador `android.package` aprobado, decidir el uso demo/produccion y facilitar un entorno Android con emulador o dispositivo; tambien se requiere definir el flujo de build (por ejemplo, EAS con perfil APK).
