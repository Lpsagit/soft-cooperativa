import { PostgresDatabase } from "../../data";
import { CustomError } from "../../domain";
import { getSocketsInstance } from "../sockets/socket-instance";

export class DashboardData {
  constructor() {}

  //* esta funcion emitira los valores iniciales del dashboard
  public async emitDataToDashboard(
    planta_id: string,
  ) {

    const pool = PostgresDatabase.getPool();

    try {
      // obtenemos la ultima fecha para cosultar los carritos podemos preguntar la fecha si no la envia
      // utilizamos el siguiente codigo y si la envia no  y mostramos el actual
      
        const sqlPulperia = await pool.query(
          `SELECT * FROM pulperias WHERE estado = 'en curso' and planta_id = $1`,
          [planta_id]
        );
        if (sqlPulperia.rows.length === 0) {
          return;
        }
      
        const fecha_creacion = sqlPulperia.rows[0].fecha_ini;
        const pulperia_id = sqlPulperia.rows[0].id;

        // contamos los carritos que tienen al menos un producto
        const resCarritos = await pool.query(
          `select COUNT(DISTINCT c.id)as total_carritos
                                                    from prod_carrito pc 
                                                    join carritos c on c.id = pc.carrito_id
                                                    where pc.prod_cant > 0 and c.pulperia_id = $1`,
          [pulperia_id]
        );
        const totalCarritos = resCarritos.rows[0]?.total_carritos ?? 0;

        // total productos vendidos
        const resProducts = await pool.query(
          `select sum(pc.prod_cant) as total_productos
                                                    from prod_carrito pc 
                                                    join carritos c on c.id = pc.carrito_id
                                                    where c.pulperia_id = $1`,
          [pulperia_id]
        );
        const totalProductsVendidos = resProducts.rows[0]?.total_productos ?? 0;

        // producto mas vendido
        const resProMasVendido = await pool.query(
          `select sum(pc.prod_cant) as total , pc.prod_planta_id, p.prod_desc
                                                        from prod_carrito pc 
                                                        join carritos c on c.id = pc.carrito_id
                                                        join producto_planta pp on pp.id_prod_pla = pc.prod_planta_id
                                                        join productos p on p.id = pp.id_prod
                                                        where c.pulperia_id = $1 
                                                        group by pc.prod_planta_id, p.prod_desc order by total desc limit 1`,
          [pulperia_id]
        );
        const prodMasVendido = {
          total: resProMasVendido.rows[0]?.total ?? 0,
          prod: resProMasVendido.rows[0]?.prod_desc ?? "-",
        };

        // producto menos vendido
        const resProMenosVendido = await pool.query(
          `select sum(pc.prod_cant) as total , pc.prod_planta_id, p.prod_desc
                                                        from prod_carrito pc 
                                                        join carritos c on c.id = pc.carrito_id
                                                        join producto_planta pp on pp.id_prod_pla = pc.prod_planta_id
                                                        join productos p on p.id = pp.id_prod
                                                        where c.pulperia_id = $1 
                                                        group by pc.prod_planta_id, p.prod_desc order by total asc limit 1`,
          [pulperia_id]
        );
        const prodMenosVendido = {
          total: resProMenosVendido.rows[0]?.total ?? 0,
          prod: resProMenosVendido.rows[0]?.prod_desc ?? "-",
        };

        // lista de productos mas
        const resMasVendidos = await pool.query(
          `select sum(pc.prod_cant) as total , pc.prod_planta_id, p.prod_desc, pp.stock 
                                                      from prod_carrito pc 
                                                      join carritos c on c.id = pc.carrito_id
                                                      join producto_planta pp on pp.id_prod_pla = pc.prod_planta_id
                                                      join productos p on p.id = pp.id_prod
                                                      where c.pulperia_id = $1 
                                                      group by pc.prod_planta_id, p.prod_desc, pp.stock order by total desc limit 5`,
          [pulperia_id]
        );
        const prodMasVendidos = resMasVendidos.rows ?? [];

        // lista de productos menos vendidos
        const resMenosVendidos = await pool.query(
          `select sum(pc.prod_cant) as total , pc.prod_planta_id, p.prod_desc, pp.stock 
                                                      from prod_carrito pc 
                                                      join carritos c on c.id = pc.carrito_id
                                                      join producto_planta pp on pp.id_prod_pla = pc.prod_planta_id
                                                      join productos p on p.id = pp.id_prod
                                                      where c.pulperia_id = $1 
                                                      group by pc.prod_planta_id, p.prod_desc, pp.stock order by total asc limit 5`,
          [pulperia_id]
        );
        const prodMenosVendidos = resMenosVendidos.rows ?? [];

        const dataDashboard = {
          status: "ok",
          totalCarritos,
          totalProductsVendidos,
          prodMasVendido,
          prodMenosVendido,
          prodMasVendidos,
          prodMenosVendidos,
          pulperia_id: pulperia_id,
        };
      
      let notiPlanta = '';
      switch (planta_id) {
        case "r1":
          notiPlanta = "dashboard-ranking-r1";
          break;
          case "r2":
          notiPlanta = "dashboard-ranking-r2";
          break;
          case "r3":
          notiPlanta = "dashboard-ranking-r3";
          break;
        default:
            break;
      }
      //console.log('emitiendo a '+notiPlanta);
      getSocketsInstance().io.emit( notiPlanta,  dataDashboard );
    } catch (error) {
      console.log(error);
      //res.status(500).json({ error: 'error en las consultas'});
    }
  }
}
