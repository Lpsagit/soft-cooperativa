import { envs } from './config/envs';
import { PostgresDatabase } from './data';
import { AppRoutes } from './presentation/routes';
import { Server } from './presentation/server';


(async()=> {
  main();
})();


async function main() {

  await PostgresDatabase.connect({
    host: envs.DB_HOST,
    port: envs.DB_PORT,
    user: envs.DB_USER,
    password: envs.DB_PASSWORD,
    database: envs.DB_NAME,
  });

  const server = new Server({
    port: envs.PORT,
    routes: AppRoutes.routes,
  });

  server.start();
}