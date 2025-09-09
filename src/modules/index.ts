import { AuthModule } from "./auth/auth.module";
import { DatabaseModule } from "./database/database.module";
import { StockModule } from "./stocks/stock.module";

const Modules = [AuthModule, DatabaseModule, StockModule]
export default Modules