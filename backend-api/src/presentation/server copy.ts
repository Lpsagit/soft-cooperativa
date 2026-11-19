import express, { Router } from "express";
import path from "path";
import cors from "cors";
import http from "http";

import { Server as SocketIOServer } from "socket.io";
import { Sockets } from "./sockets/sockets";
import { initSockets } from "./sockets/socket-instance";
import { ErrorJsonMiddleware } from "./middlewares/errorJson.middleware";
// (Opcional) Manejo de errores de multer global aquí
//import { multerErrorHandler } from "./middlewares/uploads";

interface Options {
  port: number;
  routes: Router;
  public_path?: string;
}

export class Server {
  public readonly app = express();
  private readonly port: number;
  private readonly publicPath: string;
  private readonly routes: Router;

  private httpServer: http.Server;
  private io: SocketIOServer;

  constructor(options: Options) {
    const { port, routes, public_path = "public" } = options;
    this.port = port;
    this.publicPath = public_path;
    this.routes = routes;

    this.httpServer = http.createServer(this.app);
    this.io = new SocketIOServer(this.httpServer, {
      cors: { origin: "*" },
    });
  }

  async start() {
    //* Middlewares
    this.app.use(cors({ exposedHeaders: ["Content-Disposition"] }));

    // Body parsers (para JSON/x-www-form-urlencoded). Multer se encarga de multipart/form-data por ruta.
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Sockets
    initSockets(this.io);

    //* Public Folder
    this.app.use(express.static(this.publicPath));

    //* static image product folder
    this.app.use(
      "/uploads",
      express.static(path.resolve(__dirname, "../../uploads")),
    );

    //* Routes
    this.app.use(this.routes);

    //* SPA (si no empieza con "api")
    this.app.get("*", (req, res) => {
      const indexPath = path.join(
        __dirname + `../../../${this.publicPath}/index.html`,
      );
      res.sendFile(indexPath);
    });

    // Manejo de errores JSON
    this.app.use(ErrorJsonMiddleware.handle);

    // (Opcional) Manejo centralizado de errores de Multer
    //this.app.use(multerErrorHandler);

    this.httpServer.listen(this.port, () => {
      console.log(`Server running on port ${this.port}`);
    });
  }

  public close() {
    this.io.close();
    this.httpServer.close();
  }
}
