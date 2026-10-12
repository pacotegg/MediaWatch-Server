import { spawn, ChildProcess } from 'node:child_process';
import { join } from 'node:path';
import { existsSync, createWriteStream } from 'node:fs';
import { app } from 'electron';
import { getDataDir, loadConfig } from './config';

export class ServerManager {
  private process: ChildProcess | null = null;
  private isRunning: boolean = false;
  private corePath: string;

  constructor() {
    // Si estamos empaquetados en Electron, los recursos están en process.resourcesPath
    if (app.isPackaged) {
      this.corePath = join(process.resourcesPath, 'core');
    } else {
      this.corePath = join(__dirname, '../../core');
    }
  }

  public getStatus(): boolean {
    return this.isRunning;
  }

  public async start(): Promise<void> {
    if (this.isRunning && this.process) {
      return;
    }

    const dataDir = getDataDir();
    const config = loadConfig();
    const serverScript = join(this.corePath, 'server', 'src', 'index.ts');

    const logStream = createWriteStream(join(dataDir, 'server.log'), { flags: 'a' });
    const errStream = createWriteStream(join(dataDir, 'server.err'), { flags: 'a' });

    const env = {
      ...process.env,
      MEDIAWATCH_DATA_DIR: dataDir,
      MEDIAWATCH_PORT: String(config.port || 8730),
      MEDIAWATCH_HOST: config.host || '0.0.0.0',
    };

    // Node 26 ejecuta TypeScript directamente sin compilar
    const nodeExecutable = process.execPath.includes('node') ? 'node' : 'node';

    try {
      this.process = spawn(nodeExecutable, [serverScript], {
        cwd: join(this.corePath, 'server'),
        env,
        stdio: ['ignore', 'pipe', 'pipe'],
        windowsHide: true,
      });

      this.process.stdout?.pipe(logStream);
      this.process.stderr?.pipe(errStream);

      this.process.on('error', (err) => {
        errStream.write(`[Electron ServerManager] Error al lanzar proceso: ${err.message}\n`);
        this.isRunning = false;
      });

      this.process.on('exit', (code, signal) => {
        logStream.write(`[Electron ServerManager] Proceso terminado con código ${code}, señal ${signal}\n`);
        this.isRunning = false;
        this.process = null;
      });

      this.isRunning = true;
    } catch (e: any) {
      errStream.write(`[Electron ServerManager] Excepción al lanzar servidor: ${e?.message}\n`);
      this.isRunning = false;
    }
  }

  public async stop(): Promise<void> {
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
