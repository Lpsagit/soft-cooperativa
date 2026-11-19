import { Pool } from 'pg';

interface Options {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export class PostgresDatabase {
  private static pool: Pool | null = null;
  private static isConnected: boolean = false;

  constructor() {}
  public static async connect(options:Options): Promise<void>{
    if (this.isConnected && this.pool) return;
    this.pool = new Pool({
      host: options.host,
      port: options.port,
      user: options.user,
      password: options.password,
      database: options.database,
      max: 20,
    });
    try {
        await this.pool.query('SELECT 1');
        this.isConnected = true;
        console.log('PostgreSQL connected');
    } catch (error) {
        console.error('Error connecting to PostgreSQL:', error);
        throw error;
    }
  }

  public static getPool(): Pool {
    if (!this.pool) {
      throw new Error('Database desconectada');
    }
    return this.pool;
  }

  

}