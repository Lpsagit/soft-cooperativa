import { NextFunction, Request, Response } from "express";
import { JwtAdapter } from "../../config";
import { PostgresDatabase } from "../../data";
import { UserEntity } from "../../domain";

export class AuthMiddleware {
  //*ok
  static async validate(req: Request, res: Response, next: NextFunction) {
    const pool = PostgresDatabase.getPool();

    const authorization = req.header("Authorization");

    if (!authorization) {
      return res.status(401).json({ error: "No token provided" });
    }

    if (!authorization.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Invalid Bearer token" });
    }

    const token = authorization.split(" ").at(1) || "";

    try {
      const payload = await JwtAdapter.validateToken<{
        id: string;
        user: string;
      }>(token);
      if (!payload) {
        return res.status(400).json({ error: "Invalid token" });
      }

      // if ( payload.user.toString() !== req.body.userName ) {
      //     console.log( typeof payload.user +' - '+ typeof req.body.userName);
      //     return res.status(401).json({ error: 'No token accepted'})
      // }

      const queryUser = await pool.query(
        "SELECT * FROM usuario WHERE user_name = $1 and id = $2 and is_active = true ",
        [payload.user, payload.id],
      );
      if (queryUser.rows.length === 0) {
        return res.status(401).json({ error: "Invalid token - user" });
      }
      if (queryUser.rows[0].user_token !== token) {
        return res.status(401).json({ error: "Token has been invalidated" });
      }

      const user = UserEntity.fromObject(queryUser.rows[0]);
      //console.log(user);
      req.body.user = user;
      req.body.user.rol = "SOC-NORMAL";

      next();
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Internal server error middleware_auth " });
    }
  }

  static async validateAdmin(req: Request, res: Response, next: NextFunction) {
    const pool = PostgresDatabase.getPool();

    const authorization = req.header("Authorization");

    if (!authorization) {
      return res.status(401).json({ error: "No token provided" });
    }

    if (!authorization.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Invalid Bearer token" });
    }

    const token = authorization.split(" ").at(1) || "";

    try {
      const payload = await JwtAdapter.validateToken<{
        id: string;
        user: string;
      }>(token);
      if (!payload) {
        return res.status(400).json({ error: "Invalid token" });
      }

      // if ( payload.user.toString() !== req.body.userName ) {
      //     console.log( typeof payload.user +' - '+ typeof req.body.userName);
      //     return res.status(401).json({ error: 'No token accepted'})
      // }
      //console.log(payload.id);

      const queryUser = await pool.query(
        "SELECT * FROM usuario_admin WHERE user_name = $1 and id = $2 and is_active = true ",
        [payload.user, payload.id],
      );
      if (queryUser.rows.length === 0) {
        return res.status(401).json({ error: "Invalid token - user" });
      }
      if (queryUser.rows[0].user_token !== token) {
        return res.status(401).json({ error: "Token has been invalidated" });
      }

      const user = queryUser.rows[0];
      //console.log(user)
      req.body.user = user;
      req.body.user.rol = "SOC-ADMIN";

      next();
    } catch (error) {
      console.log(error);

      res.status(500).json({ error: "Internal server error middleware_auth " });
    }
  }
}
