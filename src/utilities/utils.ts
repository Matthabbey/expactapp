import { compare, genSalt, hash } from 'bcryptjs';
import { JwtPayload, sign, verify } from 'jsonwebtoken';
import * as nodemailer from 'nodemailer';
import { AuthPayload } from '../auth/interface';
// Generating of salt code

export class UtilService {
  public async generateSalt() {
    return await genSalt();
  }

  public async generateOTP() {
    const _otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiry = new Date();
    expiry.setTime(new Date().getTime() + 30 * 60 * 1000);
    // Generate a random OTP (e.g., 4-digit number)
    return { _otp, expiry };
  }

  public async generateForgotPasswordOTP() {
    const characters = '0123456789';
    let otp = '';
    for (let i = 0; i < 4; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      otp += characters[randomIndex];
    }
    return otp;
  }

  public async generatePassword(plainTextPassword: string, salt: string) {
    return await hash(plainTextPassword, salt);
  }

  public async matchPassword(
    hashedPassword: string,
    plainTextPassword: string,
  ) {
    return await compare(plainTextPassword, hashedPassword);
  }

  public async generateSignature(payload: AuthPayload) {
    const [access_token, refresh_token] = await Promise.all([
      sign(payload, process.env.JWT_ACCESS_SECRET, {
        expiresIn: process.env.JWT_EXPIRY_PERIOD,
      }),
      sign(payload, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_SECRET_EXPIRY_PERIOD,
      }),
    ]);
    return {
      access_token,
      refresh_token,
    };
  }

  //Verifying the signature of the user before allowing login
  public async verifySignature(signature: string) {
    return verify(
      signature,
      process.env.JWT_ACCESS_SECRET,
    ) as unknown as JwtPayload;
  }

  public async validatePassword(
    enteredPassword: string,
    savedPassword: string,
    salt: string,
  ) {
    return (
      (await this.generatePassword(enteredPassword, salt)) === savedPassword
    );
  }

  public async sendCustomEmail(to: string, subject: string, _otp: string) {
    try {
      const transporter = await nodemailer.createTransport({
        service: 'gmail',
        port: parseInt(process.env.EMAIL_PORT),
        secure: true,
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASSWORD,
        },
      });
      const response = `
    <div style='max-width: 700px; margin:auto; border:10px solid #ddd; padding:50px 20px; font-size: 110%;'>

    <h2 style="text-align: center; text-transform: uppercase; color:teal;"> Welcome to Auth Career </h2>
    <br> Welcome to Auth</p>
    <p> Here is your otp <b>${_otp}</b> for ${subject}</p> 
    </div>`;

      const mailOptions = {
        from: `"Auth" <${process.env.USER_NAME}>`,
        to,
        subject,
        html: response,
      };

      await transporter.sendMail(mailOptions);
      if (process.env.DEBUG_ON === 'YES')
        console.log('Sign Up Email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error.message);
    }
  }

  public async sendPhoneNumberOtpVerification(
    otp: string,
    toPhoneNumber: string,
  ) {
    try {
      const client = require('twilio')(
        process.env.TWILLO_ACCOUNT_ID,
        process.env.TWILLO_AUTH_TOKEN,
      );

      const response = await client.messages.create({
        body:
          process.env.USER_NAME +
          `: Your signup verificication OTP is: ${otp}..`,
        to: toPhoneNumber.replace(/^0/, '+234'),
        from: process.env.ADMIN_NUMBER,
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }
}
