import { Request, Response } from "express";
import { CustomError } from "../../domain";
import { SocioService } from "../services/socios.service";
import { SocioUpdateDto } from "../../domain/dtos/socio/socio-update.dto";
import { SocioCreateDto } from "../../domain/dtos/socio/socio-create.dto";
export class SocioController {
  // Constructor
  constructor(public readonly socioService: SocioService) {}

  // para el manejo de errores
  private handleError = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.log(`${error}`);
    return res.status(500).json({ error: "Internal server error" });
  };

  //* USUARIO NORMAL

  getSocioData = (req: Request, res: Response) => {
    //console.log(req.body.user.socio_id);
    this.socioService
      .getSocioData(req.body.user.socio_id)
      .then((socios) => res.json(socios))
      .catch((error) => this.handleError(error, res));
  };

  updateSocioData = (req: Request, res: Response) => {
    console.log(req.body);
    const [error, socioUpdateDto] = SocioUpdateDto.create(req.body);
    if (error) {
      return res.status(400).json({ error });
    }
    this.socioService
      .updateSocioData(socioUpdateDto!)
      .then((socio) => res.json(socio))
      .catch((error) => this.handleError(error, res));
  };

  //** USUARIO ADMIN */
  getSocios = (req: Request, res: Response) => {
    this.socioService
      .getSocios()
      .then((socios) => res.json(socios))
      .catch((error) => this.handleError(error, res));
  };
  //* obtiene datos de un socio
  getSocio = (req: Request, res: Response) => {
    const { cod_socio } = req.body;
    this.socioService
      .getSocio(cod_socio)
      .then((socio) => res.json(socio))
      .catch((error) => this.handleError(error, res));
  };
  //* update socio desde admin
  updateSocioByAdmin = (req: Request, res: Response) => {
    //console.log(req.body);
    const [error, socioUpdateDto] = SocioUpdateDto.create(req.body);
    if (error) {
      return res.status(400).json({ error });
    }
    this.socioService
      .updateSocioData(socioUpdateDto!)
      .then((socio) => res.json(socio))
      .catch((error) => this.handleError(error, res));
  };
  //* update usuario del socio desde admin
  updateUsuarioSocio = (req: Request, res: Response) => {
    //console.log(req.body);
    const { idSocio, rol, userName, codSocio } = req.body;
    this.socioService
      .updateUsuarioSocio(userName, codSocio, rol, idSocio)
      .then((socio) => res.json(socio))
      .catch((error) => this.handleError(error, res));
  };
  //* reset password socio
  resetPasswordSocio = (req: Request, res: Response) => {
    //console.log(req.body);
    const { idSocio } = req.body;

    this.socioService
      .resetPasswordSocio(idSocio)
      .then((socio) => res.json(socio))
      .catch((error) => this.handleError(error, res));
  };

  //* dara de baja un socio
  bajaSocio = (req: Request, res: Response) => {
    //console.log(req.body);
    const { codigoSocio, socioId } = req.body;
    console.log(req.body);
    //console.log("socioId", socioId);
    if (!codigoSocio || !socioId) {
      return res.status(400).json({ error: "Socio es requerido" });
    }

    this.socioService
      .bajaSocio(codigoSocio, socioId)
      .then((socio) => res.json(socio))
      .catch((error) => this.handleError(error, res));
  };

  //* crear un nuevo socio
  createNewSocio = (req: Request, res: Response) => {
    const [error, socioCreateDto] = SocioCreateDto.create(req.body);
    if (error) {
      return res.status(400).json({ error });
    }
    this.socioService
      .createNewSocio(socioCreateDto!)
      .then((socio) => res.json(socio))
      .catch((error) => this.handleError(error, res));
  };
}
