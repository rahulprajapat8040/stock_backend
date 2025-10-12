import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { Stocks } from "src/models";
import { StockController } from "./stock.controller";
import { StockService } from "./stock.service";
import { MailService } from "../email/email.service";

@Module({
    imports: [SequelizeModule.forFeature([Stocks])],
    controllers: [StockController],
    providers: [StockService, MailService]
})

export class StockModule { }