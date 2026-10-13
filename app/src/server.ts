import { spawn, ChildProcess } from 'node:child_process';
import { EventEmitter } from 'node:events';
import { join } from 'node:path';
import { appendFileSync, closeSync, existsSync, openSync, renameSync, statSync } from 'node:fs';
import { app } from 'electron';
import { getDataDir, loadConfig } from './config';

const LOG_MAX_BYTES = 20 * 1024 * 1024;

// Los registros se abren como descriptores que hereda el proceso hijo, sin tuberías: así no hay
// ficheros que cerrar en cada reinicio ni escrituras tras el final de un flujo. Los avisos del
// gestor van con appendFileSync, que no depende de que nada siga abierto.
function anotar(fichero: string, mensaje: string): void {
  try {
    appendFileSync(fichero, mensaje);
  } catch {
    // Sin poder escribir el registro no hay nada más que hacer.
  }
}

// Con más de 20 MB el registro se aparta a .1 (se pierde el anterior .1) para que no crezca sin fin.
function rotarSiGrande(fichero: string): void {
  try {
    if (statSync(fichero).size > LOG_MAX_BYTES) renameSync(fichero, fichero + '.1');
  } catch {
    // No existe todavía.
  }
}

export class ServerManager extends EventEmitter {
  private process: ChildProcess | null = null;
  private isRunning: boolean = false;
  private corePath: string;
  private stopping: boolean = false;
  private gaveUp: boolean = false;
  private restartTimes: number[] = [];

  constructor() {
    super();
    // Si estamos empaquetados en Electron, los recursos están en process.resourcesPath
    if (app.isPackaged) {
      this.corePath = join(process.resourcesPath, 'core');
    } else {
      this.corePath = join(__dirname, '../core');
    }
  }

  public getStatus(): boolean {
    return this.isRunning;
  }

  /** true si el servidor se cayó tantas veces seguidas que ya no se reinicia solo. */
  public getGaveUp(): boolean {
    return this.gaveUp;
  }

  public getFfmpegPath(): string | undefined {
    return this.findBinary('ffmpeg');
  }

  private findBinary(name: 'node' | 'ffmpeg' | 'ffprobe'): string | undefined {
    const ext = process.platform === 'win32' ? '.exe' : '';
    const filename = `${name}${ext}`;
    if (app.isPackaged) {
      const packagedPath = join(process.resourcesPath, 'bin', filename);
      if (existsSync(packagedPath)) return packagedPath;
    }
    const localPath = join(__dirname, '../bin', filename);
    if (existsSync(localPath)) return localPath;
    return undefined;
  }

  public async start(): Promise<void> {
    if (this.isRunning && this.process) {
      return;
    }

    const dataDir = getDataDir();
    const config = loadConfig();
    const serverScript = join(this.corePath, 'server', 'src', 'index.ts');

    const logFile = join(dataDir, 'server.log');
    const errFile = join(dataDir, 'server.err');
    rotarSiGrande(logFile);
    rotarSiGrande(errFile);

    const env: Record<string, string | undefined> = {
      ...process.env,
      MEDIAWATCH_DATA_DIR: dataDir,
      MEDIAWATCH_PORT: String(config.port || 8730),
      MEDIAWATCH_HOST: config.host || '0.0.0.0',
    };

    const bundledFfmpeg = this.findBinary('ffmpeg');
    const bundledFfprobe = this.findBinary('ffprobe');
    if (bundledFfmpeg) env.MEDIAWATCH_FFMPEG = bundledFfmpeg;
    if (bundledFfprobe) env.MEDIAWATCH_FFPROBE = bundledFfprobe;

    // El servidor necesita node:sqlite y ejecuta TypeScript sin compilar: el Node de Electron
    // (20.x) no vale. Se usa el que va empaquetado en bin/; 'node' del PATH solo como respaldo.
    const nodeExecutable = this.findBinary('node') ?? 'node';

    this.stopping = false;
    this.gaveUp = false;
    let logFd = -1;
    let errFd = -1;
    try {
      logFd = openSync(logFile, 'a');
      errFd = openSync(errFile, 'a');
      const child = spawn(nodeExecutable, [serverScript], {
        cwd: join(this.corePath, 'server'),
        env,
        stdio: ['ignore', logFd, errFd],
        windowsHide: true,
      });

      this.process = child;

      child.on('error', (err) => {
        anotar(errFile, `[Electron ServerManager] Error al lanzar proceso: ${err.message}\n`);
        if (this.process === child) this.isRunning = false;
      });

      child.on('exit', (code, signal) => {
        anotar(logFile, `[Electron ServerManager] Proceso terminado con código ${code}, señal ${signal}\n`);
        // Un reinicio manual ya ha arrancado otro proceso: este aviso llega tarde y no le toca.
        if (this.process !== child) return;
        this.isRunning = false;
        this.process = null;
        if (!this.stopping) this.scheduleRestart(errFile);
      });

      this.isRunning = true;
    } catch (e: any) {
      anotar(errFile, `[Electron ServerManager] Excepción al lanzar servidor: ${e?.message}\n`);
      this.isRunning = false;
    } finally {
      // El hijo ya tiene su copia de los descriptores.
      if (logFd >= 0) closeSync(logFd);
      if (errFd >= 0) closeSync(errFd);
    }
  }

  // Si el servidor se cae solo, se vuelve a levantar a los 3 s; con más de 5 caídas en
  // 5 minutos se deja parado para no entrar en un bucle (el motivo queda en server.err).
  private scheduleRestart(errFile: string): void {
    const ahora = Date.now();
    this.restartTimes = this.restartTimes.filter((t) => ahora - t < 5 * 60 * 1000);
    if (this.restartTimes.length >= 5) {
      anotar(errFile, '[Electron ServerManager] Demasiadas caídas seguidas: no se reinicia más. Revisa server.err.\n');
      this.gaveUp = true;
      this.emit('gave-up');
      return;
    }
    this.restartTimes.push(ahora);
    setTimeout(() => {
      if (!this.stopping && !this.process) void this.start();
    }, 3000);
  }

  public async stop(): Promise<void> {
    this.stopping = true;
    if (this.process) {
      this.process.kill('SIGINT');
      this.process = null;
      this.isRunning = false;
    }
  }

  public async restart(): Promise<void> {
    await this.stop();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await this.start();
  }

  public async waitForReady(maxRetries: number = 20, delayMs: number = 500): Promise<boolean> {
    const config = loadConfig();
    const url = `http://127.0.0.1:${config.port || 8730}/api/salud`;

    for (let i = 0; i < maxRetries; i++) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          return true;
        }
      } catch {
        // Aún iniciando
      }
      await new Promise((r) => setTimeout(r, delayMs));
    }
    return false;
  }
}
