import { BadRequestException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Op } from "sequelize";
import { Stocks } from "src/models";
import STRINGCONST from "src/utils/common/stringConst";
import { responseSender } from "src/utils/helper/funcation.helper";
import * as moment from 'moment';

@Injectable()
export class StockService {
    constructor(
        @InjectModel(Stocks) private stockModel: typeof Stocks
    ) { }

    async createNewStock(stockTime: Date, stockPrices: string) {
        try {
            const stock = await this.stockModel.create({ stockTime, stockPrices });
            return responseSender(STRINGCONST.STOCK_CREATED, HttpStatus.CREATED, true, stock);
        } catch (error) {
            throw new BadRequestException(error.message)
        }
    }

    async getAllStocks(date: Date) {
        try {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            const res = await this.stockModel.findAll({
                where: {
                    stockTime: {
                        [Op.between]: [startOfDay, endOfDay]
                    }
                }
            });

            return responseSender(STRINGCONST.DATA_FETCHED, HttpStatus.OK, true, res);
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async getStockById(stockId: string) {
        try {
            const stock = await this.stockModel.findByPk(stockId);
            if (!stock) {
                throw new NotFoundException(STRINGCONST.DATA_NOT_FOUND);
            }
            return responseSender(STRINGCONST.DATA_FETCHED, HttpStatus.OK, true, stock)
        } catch (error) {
            throw new BadRequestException(error.message)
        }
    }

    async updateStock(stockId: string, stockPrices: string) {
        try {
            const stock = await this.stockModel.findByPk(stockId);
            if (!stock) {
                throw new NotFoundException(STRINGCONST.DATA_NOT_FOUND);
            }
            await stock.update({ stockPrices });
            return responseSender(STRINGCONST.DATA_UPDATED, HttpStatus.OK, true, stock);
        } catch (error) {
            throw new BadRequestException(error.message)
        }
    }


    async getStocksTillNow(date?: string | Date) {
        try {
            if (!date) {
                throw new BadRequestException("Date is required");
            }

            const istMoment = moment(date, moment.ISO_8601, true).utcOffset("+05:30");

            const startOfDayUtc = istMoment.clone().startOf("day").utc().toDate();
            const endTimeUtc = istMoment.clone().utc().toDate();

            const res = await this.stockModel.findAll({
                where: {
                    stockTime: {
                        [Op.gte]: startOfDayUtc,
                        [Op.lte]: endTimeUtc,
                    },
                },
                order: [["stockTime", "ASC"]],
            });

            return responseSender(STRINGCONST.DATA_FETCHED, HttpStatus.OK, true, res);
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }


    async editStock(stockId: string, stockTime: Date, stockPrices: string) {
        try {
            const res = await this.stockModel.findByPk(stockId);
            if (!res) {
                throw new NotFoundException(STRINGCONST.DATA_NOT_FOUND)
            }
            await res.update({ stockTime, stockPrices });
            return responseSender(STRINGCONST.DATA_UPDATED, HttpStatus.OK, true, res)
        } catch (error) {
            throw new BadRequestException(error.message)
        }
    }
}