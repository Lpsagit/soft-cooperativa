import { Router } from "express";
import { AuthRoutes } from "./auth/routes";
import { AhorroRoutes } from "./ahorro/routes";
import { ReportRoutes } from "./reports/routes";
import { SocioRoutes } from "./socio/routes";
import { PrestamoRoutes } from "./prestamo/routes";
import { DescuentoRoutes } from "./descuentos/routes";
import { DashboardRoutes } from "./dashboard/routes";
import { CuentaBancariaRoutes } from "./cuenta-bancaria/routes";

//*solo para migracion
//todo: borrar luego
import { MigrationRoutes } from "./migration/routes";

export class AppRoutes {
  static get routes(): Router {
    const router = Router();

    // Definir las rutas
    // router.use('/api/todos', /*TodoRoutes.routes */ );
    router.use("/api/auth", AuthRoutes.routes);
    router.use("/api/ahorro", AhorroRoutes.routes);
    router.use("/api/report", ReportRoutes.routes);
    router.use("/api/socio", SocioRoutes.routes);
    router.use("/api/prestamo", PrestamoRoutes.routes);
    router.use("/api/descuento", DescuentoRoutes.routes);
    router.use("/api/dashboard", DashboardRoutes.routes);
    router.use("/api/ctabancaria", CuentaBancariaRoutes.routes);

    //* OJO SOLO PARA LA MIGRACION DE DATOS
    //todo: borrar luego
    router.use("/api/migration", MigrationRoutes.routes);

    return router;
  }
}
