import { Body, Controller, Get, Post, Put, Req, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { UserInfoDTO } from "./auth.dto";
import { Request } from "express";

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
    // auth.controller.ts
    @Get("validate-session")

    async validateSession(@Req() req: Request) {
        return this.authService.validateToken(req)
    }


}