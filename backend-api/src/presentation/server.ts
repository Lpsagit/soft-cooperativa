import express, { Request, Response, Router } from "express";
import path from "path";
import cors from "cors";
import http from "http";
import { Server as SocketIOServer } from "socket.io";

import { initSockets } from "./sockets/socket-instance";
import { ErrorJsonMiddleware } from "./middlewares/errorJson.middleware";

interface Options {
  port: number;
  routes: Router;
}

export class Server {
  public readonly app = express();

  private readonly port: number;
  private readonly routes: Router;
  private readonly httpServer: http.Server;
  private readonly io: SocketIOServer;

  constructor(options: Options) {
    const { port, routes } = options;

    this.port = port;
    this.routes = routes;

    // Crear servidor HTTP a partir de Express
    this.httpServer = http.createServer(this.app);

    // Configurar Socket.IO
    this.io = new SocketIOServer(this.httpServer, {
      cors: {
        origin: "*",
      },
    });
  }

  async start() {
    // ============================================================
    // MIDDLEWARES
    // ============================================================

    this.app.use(
      cors({
        exposedHeaders: ["Content-Disposition"],
      }),
    );

    // Parsear JSON
    this.app.use(express.json());

    // Parsear application/x-www-form-urlencoded
    this.app.use(
      express.urlencoded({
        extended: true,
      }),
    );

    // ============================================================
    // SOCKET.IO
    // ============================================================

    initSockets(this.io);

    // ============================================================
    // ARCHIVOS SUBIDOS
    // ============================================================
    // Se mantiene únicamente para exponer imágenes/comprobantes.
    // Ejemplo:
    // GET /uploads/comprobante.jpg

    this.app.use(
      "/uploads",
      express.static(path.resolve(process.cwd(), "uploads")),
    );

    // ============================================================
    // RUTAS DE LA API
    // ============================================================

    this.app.use(this.routes);

    // ============================================================
    // 404 - RUTA NO ENCONTRADA
    // ============================================================

    this.app.use((req: Request, res: Response) => {
      res.status(404).json({
        ok: false,
        message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
      });
    });

    // ============================================================
    // MANEJO GLOBAL DE ERRORES
    // Debe estar después de las rutas
    // ============================================================

    this.app.use(ErrorJsonMiddleware.handle);

    // ============================================================
    // INICIAR SERVIDOR
    // ============================================================

    this.httpServer.listen(this.port, () => {
      console.log(`🚀 API running on port ${this.port}`);
    });
  }

  public close() {
    this.io.close();
    this.httpServer.close();
  }
}
