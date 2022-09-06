import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { HttpLogger } from "../http-logger/http-logger.entity";

export class DbConfig
{
    public static get(): TypeOrmModuleOptions {
        
        return {
            type: 'mysql',
            username: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT || '3306'),
            entities: DbConfig.getEntities(),
            synchronize: true,
        }
    }

    public static getEntities(): any[] 
    {
        return [HttpLogger];
    }

}