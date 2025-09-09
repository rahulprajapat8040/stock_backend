import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { SequelizeModule } from "@nestjs/sequelize";
import { User } from "src/models";
import { AuthController } from "./auth.controller";
import { AdminSeeder } from "./admin.seeder";

@Module({
    imports: [
        SequelizeModule.forFeature([User]),
        JwtModule.register({}),
    ],
    controllers: [AuthController],
    providers: [AuthService, AdminSeeder]
})

export class AuthModule { }