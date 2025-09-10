import { SequelizeModule } from "@nestjs/sequelize";
import { AuthModule } from "./auth/auth.module";
import { DatabaseModule } from "./database/database.module";
import { StockModule } from "./stocks/stock.module";
import { User } from "src/models";

const Modules = [SequelizeModule.forFeature([User]), AuthModule, DatabaseModule, StockModule]
export default Modules