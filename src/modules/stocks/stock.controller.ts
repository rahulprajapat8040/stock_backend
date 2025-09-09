import { Body, Controller, Get, Post, Put, Query } from "@nestjs/common";
import { StockService } from "./stock.service";

@Controller('stock')
export class StockController {
    constructor(
        private readonly stockService: StockService
    ) { }

    @Post('create-new-stock')
    async createNewStock(
        @Body('stockTime') stockTime: Date,
        @Body('stockPrices') stockPrices: string
    ) {
        return this.stockService.createNewStock(stockTime, stockPrices)
    }

    @Get('get-stock-by-id')
    async getStockById(
        @Query('stockId') stockId: string
    ) {
        return this.stockService.getStockById(stockId)
    }

    @Put('update-stock')
    async updateStock(
        @Query('stockId') stockId: string,
        @Body('stockPrices') stockPrices: string,
    ) {
        return this.stockService.updateStock(stockId, stockPrices)
    }

    @Get('get-stock-till-now')
    async getStocksTillNow(
        @Query('date') date: Date
    ) {
        return this.stockService.getStocksTillNow(date)
    }

    @Get('get-all-stocks')
    async getAllStocks(@Query('date') date: Date) {
        return this.stockService.getAllStocks(date)
    }
}