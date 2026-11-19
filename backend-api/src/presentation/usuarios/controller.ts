import { Request, Response } from "express";
import { CustomError } from "../../domain";
import { UsuariosService } from "../services/usuarios.service";

export class UsuariosController {
  // Constructor
  constructor(public readonly usuariosService: UsuariosService) {}

  private handleError = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.log(`${error}`);
    return res.status(500).json({ error: "Internal server error" });
  };

  getUsuarios = (req: Request, res: Response) => {
    const planta_id = req.query.planta_id as string;
    if (!planta_id || planta_id.trim() === "" || planta_id.length > 3) {
      return res
        .status(400)
        .json({ error: "Ocurrio un error planta es requerida" });
    }
    this.usuariosService
      .getUsuarios(planta_id)
      .then((usuarios) => res.json(usuarios))
      .catch((error) => this.handleError(error, res));
  };

  // para restablecer contraseña de usuarios
  reestablecerPassword = (req: Request, res: Response) => {
    const rol_user = req.body.user.rol_user as string;
    if (!rol_user || rol_user.trim() === "") {
      return res.status(400).json({ error: "Accion denegada" });
    }
    this.usuariosService
      .reestablecerPassword(req.body.num_emp, req.body.tipo, rol_user)
      .then((usuarios) => res.json(usuarios))
      .catch((error) => this.handleError(error, res));
  };

  // para asignar rol de usuarios
  asignarRol = (req: Request, res: Response) => {
    const rol_user = req.body.user.rol_user as string;
    if (!rol_user || rol_user.trim() === "") {
      return res.status(400).json({ error: "Accion denegada" });
    }
    this.usuariosService
      .asignarRol(req.body.num_emp, req.body.tipo, rol_user)
      .then((usuarios) => res.json(usuarios))
      .catch((error) => this.handleError(error, res));
  };

  // para consultar al server de rrhh y actualizar listas de usuarios
  updateListUsers = (req: Request, res: Response) => {
    const planta_id = req.body.planta_id as string;
    const num_emp = req.body.user.num_emp;
    if (!planta_id || planta_id.trim() === "") {
      return res.status(400).json({ error: "Accion denegada" });
    }
    this.usuariosService
      .updateListUsers(num_emp, planta_id)
      .then((usuarios) => res.json(usuarios))
      .catch((error) => this.handleError(error, res));
  };

  // para consultar a server de rrhh para agregar nuevo socio
  findPersonalOnRRHH = (req: Request, res: Response) => {
    const num_emp = req.body.num_emp;
    if (!num_emp) {
      return res
        .status(400)
        .json({ error: "Accion invalida intentelo nuevamente" });
    }
    this.usuariosService
      .findPersonalOnRRHH(num_emp)
      .then((usuarios) => res.json(usuarios))
      .catch((error) => this.handleError(error, res));
  };
}
