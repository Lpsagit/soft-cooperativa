import { NextFunction, Request, Response } from "express";
import { PostgresDatabase } from "../../data";

export class RulesMiddleware {
  //*ok
  static async validateDescuentosPlanilla(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const pool = PostgresDatabase.getPool();

    try {
      const queryDescuentoPlanilla = await pool.query(
        `select id, is_discounted, mes, anio from descuento_planilla where is_discounted is false and is_generated is true order by id asc limit 1`,
      );
      const mes =
        queryDescuentoPlanilla.rows.length > 0
          ? queryDescuentoPlanilla.rows[0].mes
          : null;
      if (queryDescuentoPlanilla.rows.length > 0) {
        const nombreMes = new Intl.DateTimeFormat("es-BO", {
          month: "long",
        }).format(new Date(2026, mes - 1, 1));
        const anio = queryDescuentoPlanilla.rows[0].anio;
        return res.status(401).json({
          error: `No es posible realizar la operacion ya que no se cargaron los descuentos de la planilla del periodo: ${nombreMes} - ${anio}`,
        });
      }

      next();
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ error: "Internal server error middleware_auth " });
    }
  }
}
