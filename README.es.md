# MediaWatch Server

[![License: AGPL v3](https://img.shields.io/badge/License-AGPLv3-blue.svg)](LICENSE)
[![Platform: Windows | Linux](https://img.shields.io/badge/Platform-Windows%20%7C%20Linux-0078D6.svg)](https://github.com/pacotegg/MediaWatch-Server/releases)
[![Electron](https://img.shields.io/badge/Electron-34%2B-47848F.svg)](https://www.electronjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-26%2B-green.svg)](https://nodejs.org/)

[English](README.md) · [Español](README.es.md)

**MediaWatch Server** es la aplicación de servidor propio todo-en-uno para **Windows y Linux**. Permite a cualquier persona alojar y reproducir su propia colección de cine y series en su ordenador o red local, de forma privada, sin suscripciones, sin depender de servicios en la nube y sin telemetría.

Diseñado como un envoltorio ligero con **Electron** que ejecuta el núcleo de [Media Watch](https://github.com/pacotegg/mediawatch), integrando bandeja del sistema (System Tray), asistente gráfico de configuración inicial y escáner automático por nombre y TMDb.

---

## Características principales

- **Ejecución silenciosa en segundo plano**: Se minimiza en la bandeja de Windows junto al reloj. Tu servidor siempre está listo cuando enciendes la tele o abres el móvil.
- **Asistente de bienvenida guiado**: Configura tus carpetas de películas y series en un par de clics sin editar ficheros de configuración.
- **Tus archivos quedan intactos**: MediaWatch Server **nunca** renombra, mueve ni borra tus archivos de vídeo o carpetas.
- **Escáner inteligente sin NFO**: Reconoce tus películas y series directamente por su nombre de archivo (limpiando etiquetas de release) y descarga sinopsis, carátulas y reparto oficiales de [The Movie Database (TMDb)](https://themoviedb.org).
- **Aceleración gráfica universal**: Aprovecha cualquier tarjeta gráfica para transcodificar vídeo en tiempo real sin saturar la CPU:
  - **Intel**: Quick Sync Video (QSV) en Intel UHD Graphics, Iris Xe y gráficas dedicadas Intel Arc.
  - **NVIDIA**: Aceleración por hardware NVENC (GTX / RTX).
  - **AMD**: Aceleración por hardware AMF (Radeon).
  - **CPU**: Modo seguro y universal por software (`libx264`).
- **Vinculación instantánea con Código QR**: Haz clic derecho en el icono junto al reloj, pulsa *«Conectar móvil o tablet»* y apunta la cámara de tu móvil al código QR para empezar a ver tus películas al instante.
- **Ecosistema multi-cliente completo**:
  - **Navegador Web / PWA**: Interfaz fluida, banner héroe interactivo, estuche 3D de coleccionista y reproductor con cambio de audio y subtítulos al vuelo.
  - **Android (Móvil / Tablet)**: App nativa en Kotlin + Jetpack Compose con soporte para Google Cast (disponible en el repo [MediaWatch](https://github.com/pacotegg/mediawatch)).
  - **Smart TV (Samsung Tizen / LG webOS)**: Diseñado para navegación fluida a 60 FPS con mando a distancia D-pad.

---

## Ecosistema MediaWatch: ¿Cómo se complementan?

```
 ┌──────────────────────────────────────────────────────────────┐
 │                   MediaWatch Server (Este repo)              │
 │  App de escritorio para Windows · Instalador .exe · Bandeja  │
 └──────────────────────────────┬───────────────────────────────┘
                                │ ejecuta internamente
                                ▼
 ┌──────────────────────────────────────────────────────────────┐
 │               MediaWatch Core (pacotegg/mediawatch)          │
 │       Servidor Fastify · Motor de Streaming · Escáner TMDb   │
 └──────┬───────────────────────┼───────────────────────┬───────┘
        │ sirve a               │ sirve a               │ sirve a
        ▼                       ▼                       ▼
 ┌──────────────┐        ┌──────────────┐        ┌──────────────┐
 │  Web Client  │        │  App Android │        │   Smart TV   │
 │   React 19   │        │ Native Media3│        │ Samsung Tizen│
 └──────────────┘        └──────────────┘        └──────────────┘
```

- **[MediaWatch Core](https://github.com/pacotegg/mediawatch)** es el corazón del proyecto: donde se desarrolla el servidor central, el reproductor web, la app de Android y la app de la tele.
- **MediaWatch Server** (este repositorio) empaqueta ese motor en una aplicación de escritorio para Windows con instalador `.exe`, para que cualquiera pueda ejecutar su propio servidor sin conocimientos técnicos.

---

## Cómo organizar tus carpetas

MediaWatch Server reconoce tus películas y series por su **nombre y año**. Para garantizar la máxima precisión en las carátulas y sinopsis automáticas, recomendamos la convención estándar:

```text
Películas\Blade Runner (1982)\Blade Runner (1982).mkv
Películas\The Matrix (1999)\The Matrix (1999).mkv
Series\Breaking Bad (2008)\Season 01\Breaking Bad - S01E01.mkv
Series\Friends (1994)\Season 01\Friends - S01E01.mkv
```

> **Consejo**: Si tus archivos tienen nombres de release como `The.Matrix.1999.1080p.BluRay.x264-GRP`, el escáner intentará limpiarlos de forma inteligente. Si algún título queda dudoso, aparecerá en el panel de **Ajustes &rarr; Metadatos &rarr; Pendientes de revisión** para que elijas la ficha correcta con un solo clic.

---

## Opciones desde la bandeja del sistema

Al hacer clic derecho sobre el icono de MediaWatch Server junto al reloj de Windows:
1. **Abrir MediaWatch**: Abre la interfaz en tu navegador predeterminado (`http://localhost:8730`).
2. **Copiar enlace local**: Copia la dirección IP local de tu ordenador (por ejemplo `http://192.168.1.50:8730`) para pegarla en la app del móvil o Smart TV.
3. **Iniciar automáticamente con Windows**: Activa o desactiva el arranque del servidor al iniciar sesión.
4. **Abrir carpeta de datos y registros**: Acceso directo a `%APPDATA%\MediaWatchServer\data`.
5. **Reiniciar / Iniciar / Salir**: Control total del servidor sin abrir terminales.

---

## Descarga e instalación

### Windows
1. Ve a **[Releases](https://github.com/pacotegg/MediaWatch-Server/releases/latest)** y descarga `MediaWatch-Server-Setup.exe`.
2. Ejecuta el archivo descargado.

> [!NOTE]
> **Aviso de Windows SmartScreen**:
> Al tratarse de un proyecto independiente de código abierto sin certificado de firma digital comercial de pago (que tienen costes anuales elevados), Windows puede mostrar la pantalla azul:  
> *«Windows protegió su PC (SmartScreen de Microsoft Defender)»*.  
> 
> Para continuar con la instalación, simplemente haz clic en **«Más información»** y luego en el botón **«Ejecutar de todas formas»**. El código fuente es 100% auditable y público bajo licencia GNU AGPL v3.

3. Sigue los sencillos pasos del asistente de bienvenida para seleccionar las carpetas de tus películas y series. ¡Listo!

### Linux
1. Ve a **[Releases](https://github.com/pacotegg/MediaWatch-Server/releases/latest)** y descarga el archivo según tu distribución:
   - **AppImage** (compatible con cualquier distribución moderna):
     ```bash
     chmod +x MediaWatch-Server-*.AppImage
     ./MediaWatch-Server-*.AppImage
     ```
   - **Paquete DEB** (Ubuntu, Debian, Linux Mint):
     ```bash
     sudo dpkg -i mediawatch-server_*_amd64.deb
     ```
2. La app abrirá el asistente gráfico de primer arranque y se minimizará en la bandeja del sistema.

---

## Estructura del repositorio

```text
MediaWatch-Server/
├── app/               # Envoltorio de escritorio Electron
│   ├── src/           # Proceso principal, System Tray, gestor del servidor e IPC
│   └── wizard/        # Interfaz del asistente gráfico de primer arranque
├── assets/            # Iconos y recursos visuales
├── core/              # Submódulo git -> pacotegg/mediawatch (servidor Fastify y cliente web)
├── LICENSE            # Licencia GNU AGPL v3.0
└── package.json       # Configuración y empaquetador electron-builder
```

---

## Desarrollo local y compilación

### Requisitos previos
- Windows 10/11
- [Node.js](https://nodejs.org) v22+ (recomendado v26)
- Git con submódulos activos:
  ```bash
  git clone --recurse-submodules https://github.com/pacotegg/MediaWatch-Server.git
  ```

### Instalación y arranque en modo desarrollo

1. Instalar dependencias:
   ```powershell
   npm install
   cd core && npm install && npm run build --workspace web && cd ..
   ```

2. Compilar y arrancar la aplicación:
   ```powershell
   npm run dev
   ```

3. Generar instalador para Windows (`.exe` NSIS):
   ```powershell
   npm run dist
   ```
   El instalador se genera en la carpeta `release/`.

---

## Licencia

MediaWatch Server es software libre publicado bajo los términos de la **GNU Affero General Public License v3.0 (AGPLv3)**. Consulta el archivo [LICENSE](LICENSE) para más detalles.