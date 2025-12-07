import { BadRequestException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/sequelize";
import { User } from "src/models";
import * as bcrypt from 'bcryptjs';
import STRINGCONST from "src/utils/common/stringConst";
import { otpGenerator, responseSender } from "src/utils/helper/funcation.helper";
import { UserInfoDTO } from "./auth.dto";
import { Request } from "express";
import { MailService } from "../email/email.service";
import { RedisService } from "../redis/redis.service";

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User) private userModel: typeof User,
        private jwtService: JwtService,
        private mailService: MailService,
        private redisService: RedisService,
    ) { }

    async login(email: string, password: string) {
        try {
            const res = await this.userModel.findOne({ where: { email } });
            if (!res) {
                throw new NotFoundException(STRINGCONST.USER_NOT_FOUND)
            }
            const isMatched = await bcrypt.compare(password, res.password)
            if (!isMatched) {
                throw new BadRequestException(STRINGCONST.INVALID_PASSWORD)
            }
            const accessToken = await this.jwtService.signAsync(
                { userId: res.id, email: res.email },
                {
                    secret: process.env.JWT_ACCESS_TOKEN_KEY as string,
                    // default 40 days (in seconds)
                    expiresIn: process.env.JWT_ACCESS_EXPIRY
                        ? Number(process.env.JWT_ACCESS_EXPIRY)
                        : 60 * 60 * 24 * 40,
                },
            );

            res.update({ accessToken: accessToken });
            return responseSender(STRINGCONST.USER_LOGIN, HttpStatus.OK, true, res)
        } catch (error) {
            throw new InternalServerErrorException(error.message)
        }
    }

    async updateUserInfo(userInfoDto: UserInfoDTO) {
        try {
            const user = await this.userModel.findOne({ where: { email: userInfoDto.email } });
            if (!user) {
                throw new BadRequestException(STRINGCONST.USER_NOT_FOUND);
            }
            let hashedPassword: string = user.password;
            if (userInfoDto.password) {
                hashedPassword = await bcrypt.hash(userInfoDto.password, 15)
            }
            await user.update({ ...userInfoDto, password: hashedPassword });
            return responseSender(STRINGCONST.USER_UPDATE, HttpStatus.OK, true, user)
        } catch (error) {
            throw new InternalServerErrorException(error.message)
        }
    }

    async validateToken(req: Request) {
        try {
            const token = req.headers.authorization?.split(" ")[1];
            if (!token) throw new UnauthorizedException("No token provided");

            const payload = this.jwtService.verify(token, { secret: process.env.JWT_ACCESS_TOKEN_KEY }) as any;
            const user = await this.userModel.findByPk(payload.userId);

            // Check if the token matches the one stored in DB
            if (!user || user.accessToken !== token) {
                throw new UnauthorizedException("Session invalid");
            }
            return { valid: true };
        } catch (error) {
            throw new BadRequestException(error.message)
        }
    }

    async sendOTP() {
        try {
            const email = process.env.ADMIN_EMAIL
            const otp = otpGenerator(6)
            await this.redisService.set(`${email}:otp`, otp);
            const htmlContent = `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2>Your One-Time Password (OTP)</h2>
              <p>Hello,</p>
              <p>Your OTP for login is:</p>
              <div style="font-size: 24px; font-weight: bold; margin: 20px 0;">
                ${otp}
              </div>
              <p>This OTP is valid for 5 minutes. Do not share it with anyone.</p>
              <p>Thanks,<br/>Your Team</p>
            </div>
          `;

            await this.mailService.sendEmail('Password reset OTP', htmlContent);
            return responseSender(STRINGCONST.OTP_SEND, HttpStatus.OK, true, null);
        } catch (error) {
            throw new BadRequestException(error.message)
        }
    }

    async verifyOTP(otp: string, email: string) {
        try {
            const storedOTP = await this.redisService.get(`${email}:otp`);
            if (storedOTP !== otp) {
                throw new BadRequestException(STRINGCONST.INVALID_OTP)
            }
            return responseSender(STRINGCONST.OTP_VARIFY, HttpStatus.OK, true, null);
        } catch (error) {
            throw new BadRequestException(error.message)
        }
    }

    async changePassword(newPassword: string, email: string) {
        try {
            const user = await this.userModel.findOne({ where: { email } });
            if (!user) {
                throw new NotFoundException(STRINGCONST.USER_NOT_FOUND)
            }
            const hash = await bcrypt.hash(newPassword, 15);
            await user.update({ password: hash })
            return responseSender(STRINGCONST.DATA_UPDATED, HttpStatus.OK, true, user)
        } catch (error) {
            throw new BadRequestException(error.message)
        }
    }
}