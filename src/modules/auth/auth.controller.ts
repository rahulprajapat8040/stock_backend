import { Body, Controller, Post, Put } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { UserInfoDTO } from "./auth.dto";

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) { }

    @Post('login')
    async login(@Body('email') email: string, @Body('password') password: string) {
        return this.authService.login(email, password)
    }

    @Put('update-info')
    async updateUserInfo(@Body() userInfoDto: UserInfoDTO) {
        return this.authService.updateUserInfo(userInfoDto)
    }
}