import { Request, Response } from "express";
import { CustomError, LoginUserDto, ChangePassUserDto } from "../../domain";
import { AuthService } from "../services/auth.service";

export class AuthController {
  // Constructor
  constructor(public readonly authService: AuthService) {}

  private handleError = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.log(`${error}`);
    return res.status(500).json({ error: "Internal server error" });
  };

  // cambiar contraseña
  changePassUser = (req: Request, res: Response) => {
    const [error, changePassUserDto] = ChangePassUserDto.create(req.body);
    if (error) {
      return res.status(400).json({ error });
    }
    this.authService
      .changePassUser(changePassUserDto!)
      .then((user) => res.json(user))
      .catch((error) => this.handleError(error, res));
  };
  //** login socio funcional
  loginUser = (req: Request, res: Response) => {
    const [error, loginUser] = LoginUserDto.create(req.body);
    if (error) {
      return res.status(400).json({ error });
    }
    this.authService
      .loginUser(loginUser!)
      .then((user) => res.json(user))
      .catch((error) => this.handleError(error, res));
  };

  validateUser = (req: Request, res: Response) => {
    const { token } = req.params;

    this.authService
      .validateUser(token)
      .then((user) => res.json(user))
      .catch((error) => this.handleError(error, res));
  };

  // renovar token funcional
  checkAuthStatus = (req: Request, res: Response) => {
    const user = req.body.user;
    this.authService
      .checkAuthStatus(user)
      .then((user) => res.json(user))
      .catch((error) => this.handleError(error, res));
  };

  //*administrador
  loginUserAdmin = (req: Request, res: Response) => {
    const [error, loginUserAdmin] = LoginUserDto.create(req.body);
    if (error) {
      return res.status(400).json({ error });
    }
    this.authService
      .loginUserAdmin(loginUserAdmin!)
      .then((user) => res.json(user))
      .catch((error) => this.handleError(error, res));
  };

  checkAuthStatusAdmin = (req: Request, res: Response) => {
    const user = req.body.user;
    this.authService
      .checkAuthStatusAdmin(user.user_name, user.id)
      .then((user) => res.json(user))
      .catch((error) => this.handleError(error, res));
  };

  // RESTABLECE CONTRASEÑA
  changePassAdmin = (req: Request, res: Response) => {
    const user = req.body;
    this.authService
      .changePassAdmin(user.user_name, user.pass)
      .then((user) => res.json(user))
      .catch((error) => this.handleError(error, res));
  };

  // CAMBIO DE CONTRASEÑA POR EL MISMO USUARIO ADMIN
  changePassUserAdmin = (req: Request, res: Response) => {
    const [error, changePassUserDto] = ChangePassUserDto.create(req.body);
    if (error) {
      return res.status(400).json({ error });
    }
    this.authService
      .changePassUserAdmin(changePassUserDto!)
      .then((user) => res.json(user))
      .catch((error) => this.handleError(error, res));
  };
}
