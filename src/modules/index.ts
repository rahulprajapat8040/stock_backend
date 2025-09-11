import { SequelizeModule } from "@nestjs/sequelize";
import { AuthModule } from "./auth/auth.module";
import { DatabaseModule } from "./database/database.module";
import { StockModule } from "./stocks/stock.module";
import { User } from "src/models";
import { RedisModule } from "./redis/redis.module";

const Modules = [SequelizeModule.forFeature([User]), AuthModule, DatabaseModule, StockModule, RedisModule]
export default Modules