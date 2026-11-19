import { CustomError } from "../../domain";
import { PostgresDatabase } from "../../data";
import { Pool } from "pg";

export class DashboardService {
  private readonly pool: Pool;
  // ID
  constructor() {
    this.pool = PostgresDatabase.getPool();
  }
  //** obtiene dashboard */
  public async getDashboard() {
    try {
      //* obtenemos datos de la cuenta bancaria de la cooperativa
      const cuentaCooperativa = await this.pool.query(
        `select s.nom_completo ,cb.nom_banco , cb.nro_cuenta , cb.id
         from cuenta_bancaria cb
         join socio s on cb.socio_id = s.id
         where cb.is_active = true`,
      );

      const ctaBancariaId = cuentaCooperativa.rows[0].id;

      //* obtenemos ultimos 5 moimientos
      const ultimosMovimiento = await this.pool.query(
        `select mb.fecha , mb.categoria ,mb.tipo_operacion, mb.monto , mb.detalle, mb.id
         from movimiento_bancario mb 
         inner join cuenta_bancaria cb on mb.cuenta_bancaria_id  = cb.id
         where cb.is_active = true 
         order by mb.id desc
         limit 5`,
      );

      //*obtenemos los descuentos por planilla del ultimo mes registrado
      const ultimoDescuentoPlanilla = await this.pool.query(
        `select id , mes
         from descuento_planilla dp where dp.is_discounted = true order by dp.id desc limit 1`,
      );

      const ultimoDescuentoPlanillaId =
        ultimoDescuentoPlanilla.rows[0]?.id || 0;
      const ultimoDescuentoPlanillaMes =
        ultimoDescuentoPlanilla.rows[0]?.mes || "";

      const descuentosPlanilla = await this.pool.query(
        `SELECT
             SUM(COALESCE(cua.monto, 0)) AS total_ahorro,
             SUM(COALESCE(cp.monto, 0)) AS total_prestamo,
             SUM(
                 COALESCE(cua.monto, 0) +
                 COALESCE(cp.monto, 0)
             ) AS total_general
         FROM descuento_planilla_socio dps
         LEFT JOIN cuota_cuenta_ahorro ca
             ON ca.id = dps.cuota_ahorro_id
         LEFT JOIN cuota_ahorro cua
             ON cua.id = ca.cuota_ahorro_id
         LEFT JOIN cuota_prestamo cp
             ON cp.id = dps.cuota_prestamo_id
         WHERE dps.descuento_planilla_id = $1 and dps.estado_descuento = 'Descontado';
         `,
        [ultimoDescuentoPlanillaId],
      );

      //* total socios activos
      const totalSocios = await this.pool.query(
        `select count(*) as total from socio where is_active = true`,
      );

      //* total ahorros
      const totalAhorros = await this.pool.query(
        `select sum(ca.saldo_actual ) as total from cuenta_ahorro ca `,
      );

      //* total prestamos
      const totalPrestamos = await this.pool.query(
        `select sum(saldo_actual)as total from prestamo where is_active = true`,
      );

      //* sado teorico banco
      const saldoTeoricoBanco = await this.pool.query(
        `SELECT
            SUM(
                CASE
                    WHEN tipo_operacion = 'DEPOSITO' THEN monto
                    WHEN tipo_operacion = 'RETIRO' THEN -monto
                    ELSE 0
                END
            ) AS saldo_teorico
        FROM movimiento_bancario
        WHERE cuenta_bancaria_id = $1;`,
        [ctaBancariaId],
      );

      return {
        status: "ok",
        message: "dashboard",
        dashboard: {
          aportesPorPagar: totalAhorros.rows[0]?.total || 0,
          prestamosPorCobrar: totalPrestamos.rows[0]?.total || 0,
          totalSocios: totalSocios.rows[0].total,
          saldoTeorico: saldoTeoricoBanco.rows[0]?.saldo_teorico || 0,
          descuentosPlanilla: {
            aportes: descuentosPlanilla.rows[0]?.total_ahorro || 0,
            prestamos: descuentosPlanilla.rows[0]?.total_prestamo || 0,
            total: descuentosPlanilla.rows[0]?.total_general || 0,
            mes: ultimoDescuentoPlanillaMes,
          },
          ultimosMovimientos: ultimosMovimiento.rows,
          titular: {
            nombre: cuentaCooperativa.rows[0]?.nom_completo || "Cooperativa",
            ctaBancariaCooperativa: cuentaCooperativa.rows[0].nro_cuenta,
            nomBanco: cuentaCooperativa.rows[0].nom_banco || "Banco",
          },
        },
      };
    } catch (error) {
      console.log(error);
      if (error instanceof CustomError) throw error;
      throw CustomError.internalServer(`${error}`);
    }
  }
}
