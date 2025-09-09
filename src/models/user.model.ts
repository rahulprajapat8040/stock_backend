import { Column, DataType, Default, Model, PrimaryKey, Table } from "sequelize-typescript";
import ModelName from "src/utils/common/modelName";

@Table({ tableName: ModelName.user, paranoid: true })
export class User extends Model<User, Partial<User>> {
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column(DataType.UUID)
    declare id: string

    @Column(DataType.STRING)
    declare name: string
    @Column(DataType.STRING)
    declare email: string
    @Column(DataType.STRING)
    declare password: string
    @Column(DataType.STRING)
    declare accessToken: string
}