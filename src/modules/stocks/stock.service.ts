import { BadRequestException, ConsoleLogger, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
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

    async getAllStocks(date: Date, time?: string) {
        try {
            let whereCondition: any = {};
            console.log(time)
            if (time) {
                // Combine date + time
                const selectedDateTime = new Date(`${date} ${time}`);

                // Exact timestamp or small range (here: ± 59 seconds)
                const startTime = new Date(selectedDateTime);
                startTime.setSeconds(0, 0);

                const endTime = new Date(selectedDateTime);
                endTime.setSeconds(59, 999);

                whereCondition.stockTime = {
                    [Op.between]: [startTime, endTime],
                };
            } else {
                // Whole day
                const startOfDay = new Date(date);
                startOfDay.setHours(0, 0, 0, 0);

                const endOfDay = new Date(date);
                endOfDay.setHours(23, 59, 59, 999);

                whereCondition.stockTime = {
                    [Op.between]: [startOfDay, endOfDay],
                };
            }

            const res = await this.stockModel.findAll({
                where: whereCondition,
                order: [["stockTime", "ASC"]],
            });

            return responseSender(STRINGCONST.DATA_FETCHED, HttpStatus.OK, true, res);
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async createBulkStocks(stocks: { stockTime: Date; stockPrices: string }[]) {
        try {
            await this.stockModel.bulkCreate(stocks, {
                ignoreDuplicates: true, // avoid duplicate stockTime inserts
                validate: true,
            });
            return responseSender(STRINGCONST.STOCK_CREATED, HttpStatus.CREATED, true, null)
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


    async getStocksTillNow(date?: string | Date, time?: string) {
        try {
            // Ensure date is provided
            let whereCondition: any = {};
            if (!date) {
                throw new BadRequestException("Date is required");
            }

            if (time) {
                // Parse date + time in IST
                const selectedDateTime = new Date(`${date} ${time}`);

                // Exact timestamp or small range (here: ± 59 seconds)
                const startTime = new Date(selectedDateTime);
                startTime.setSeconds(0, 0);

                const endTime = new Date(selectedDateTime);
                endTime.setSeconds(59, 999);

                whereCondition.stockTime = {
                    [Op.between]: [startTime, endTime],
                };
            }
            else {
                const istMoment = moment(date, moment.ISO_8601, true).utcOffset("+00:00");
                console.log(date)
                const startOfDayIst = istMoment.clone().startOf("day").toDate(); // 09:00 AM IST will be 09:00
                const endOfDayIst = istMoment.clone().toDate();
                whereCondition.stockTime = {
                    [Op.gte]: startOfDayIst, // Greater than or equal to start of day
                    [Op.lte]: endOfDayIst,
                }
            }
            console.log({ whereCondition })
            const res = await this.stockModel.findAll({
                where: {
                    ...whereCondition,
                    isPublic: true
                },
                order: [["stockTime", "ASC"]], // Order by stockTime in ascending order
            });

            // Return the response with the fetched data
            return responseSender(STRINGCONST.DATA_FETCHED, HttpStatus.OK, true, res);
        } catch (error) {
            // If there's an error, throw a BadRequestException
            throw new BadRequestException(error.message);
        }
    }


    // Helper: convert IST date (at midnight) to UTC
    async getISTDayRange(date: string | Date) {
        const IST_OFFSET_MINUTES = 330; // 5 hours 30 minutes
        const inputDate = new Date(date);

        // Get the Y/M/D in local time
        const year = inputDate.getFullYear();
        const month = inputDate.getMonth();
        const day = inputDate.getDate();

        // Create two Date objects in IST
        const startIST = new Date(Date.UTC(year, month, day, 0, 0, 0)); // midnight IST
        const endIST = new Date(Date.UTC(year, month, day, 23, 59, 59, 999)); // end of day IST

        // Convert to UTC by subtracting IST offset
        const startUTC = new Date(startIST.getTime() - IST_OFFSET_MINUTES * 60000);
        const endUTC = new Date(endIST.getTime() - IST_OFFSET_MINUTES * 60000);

        return { startUTC, endUTC };
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

    async editStockStatus(stockId: string, isPublic: boolean) {
        try {
            const res = await this.stockModel.findByPk(stockId);
            if (!res) {
                throw new NotFoundException(STRINGCONST.DATA_NOT_FOUND)
            }
            await res.update({ isPublic })
            return responseSender(STRINGCONST.DATA_FETCHED, HttpStatus.OK, true, null)
        } catch (error) {
            throw new BadRequestException(error.message)
        }
    }

    async deleteStock(stockId: string) {
        try {
            await this.stockModel.destroy({ where: { id: stockId } })
            return responseSender(STRINGCONST.DATA_FETCHED, HttpStatus.OK, true, null)
        } catch (error) {
            throw new BadRequestException(error.message)
        }
    }
}