import { BadRequestException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/sequelize";
import { User } from "src/models";
import * as bcrypt from 'bcryptjs';
import STRINGCONST from "src/utils/common/stringConst";
import { responseSender } from "src/utils/helper/funcation.helper";
import { UserInfoDTO } from "./auth.dto";

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User) private userModel: typeof User,
        private jwtService: JwtService
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
                { secret: process.env.JWT_ACCESS_TOKEN_KEY, expiresIn: process.env.JWT_ACCESS_EXPIRY }
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
}