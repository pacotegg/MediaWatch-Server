# MediaWatch Server

[![License: AGPL v3](https://img.shields.io/badge/License-AGPLv3-blue.svg)](LICENSE)
[![Platform: Windows](https://img.shields.io/badge/Platform-Windows-0078D6.svg)](https://microsoft.com/windows)
[![Electron](https://img.shields.io/badge/Electron-34%2B-47848F.svg)](https://www.electronjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-26%2B-green.svg)](https://nodejs.org/)

**MediaWatch Server** es la aplicación de servidor propio todo-en-uno para Windows. Permite a cualquier persona alojar y reproducir su propia colección de cine y series en su ordenador o red local, de forma privada, sin suscripciones, sin depender de servicios en la nube y sin telemetría.

Diseñado como un envoltorio ligero con **Electron** que ejecuta el núcleo de [Media Watch](https://github.com/pacotegg/mediawatch), integrando bandeja del sistema (System Tray), asistente gráfico de configuración inicial y escáner automático por nombre y TMDb.

---

## Características principales

- **Ejecución silenciosa en segundo plano**: Se minimiza en la bandeja de Windows junto al reloj. Tu servidor siempre está listo cuando enciendes la tele o abres el móvil.
- **Asistente de bienvenida guiado**: Configura tus carpetas de películas y series en un par de clics sin editar ficheros de configuración.
- **Tus archivos quedan intactos**: MediaWatch Server **nunca** renombra, mueve ni borra tus archivos de vídeo o carpetas.
- **Escáner inteligente sin NFO**: Reconoce tus películas y series directamente por su nombre de archivo (limpiando etiquetas de release) y descarga sinopsis, carátulas y reparto oficiales de [The Movie Database (TMDb)](https://themoviedb.org).
- **Compatible con todos los clientes**:
  - **Navegador Web / PWA**: Interfaz fluida, banner héroe interactivo, estuche 3D y reproductor con cambio de audio y subtítulos al vuelo.
  - **Android (Móvil / Tablet)**: App nativa con soporte para Google Cast.
  - **Smart TV (Samsung Tizen / LG webOS)**: Diseñado para navegación fluida a 60 FPS con mando a distancia.

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