import { BadRequestException, Injectable } from "@nestjs/common";
import * as nodemailer from 'nodemailer'
const trnasporter = nodemailer.createTransport({
    secure: true,
    host: "stmp.gmail.com",
    port: 465,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})

@Injectable()
export class MailService {
    async sendEmail(html: string): Promise<void> {
        try {
            const msg = {
                to: 'playgoldwin7@gmail.com',
                subject: 'Password reset OTP',
                html
            }
            await trnasporter.sendMail(msg)
        } catch (error) {
            console.log(error);
            throw new BadRequestException(error.message);
        }
    }
}