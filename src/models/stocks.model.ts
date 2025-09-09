import { Column, DataType, Default, Index, Model, PrimaryKey, Table } from "sequelize-typescript";
import ModelName from "src/utils/common/modelName";

@Table({ tableName: ModelName.stocks, paranoid: true })
export class Stocks extends Model<Stocks, Partial<Stocks>> {
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column(DataType.UUID)
    declare id: string

    @Index
    @Column(DataType.DATE)
    declare stockTime: Date
    @Column(DataType.STRING)
    declare stockPrices: string
    @Default(false)
    @Column(DataType.BOOLEAN)
    declare isPublic: false
}