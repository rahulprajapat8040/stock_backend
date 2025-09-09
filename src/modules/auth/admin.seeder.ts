import { Injectable, InternalServerErrorException, OnModuleInit } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { User } from "src/models";
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AdminSeeder implements OnModuleInit {
    constructor(
        @InjectModel(User) private userModel: typeof User
    ) { }

    async onModuleInit() {
        await this.seed()
    }

    async seed() {
        try {
            const user = await this.userModel.findOne({ where: { email: process.env.ADMIN_EMAIL } });
            if (!user) {
                const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD!, 15)
                await this.userModel.create({ name: process.env.ADMIN_NAME, email: process.env.ADMIN_EMAIL, password: hashedPassword })
                console.log('user created')
            } else {
                console.log('user exist')
            }
        } catch (error) {
            throw new InternalServerErrorException(error.message)
        }
    }
}