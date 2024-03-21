/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities';
import { UtilService } from '../utilities';
import { Repository } from 'typeorm';
import {
  ILoginInstance,
  IOtpInstance,
  IResendOtpInstance,
  ISignupInstance,
} from './interface';
import { compare } from 'bcryptjs';
import { SuccessfulResponse } from '../middlewares';
import { AllExceptionsFilter } from 'src/middlewares/allException.filter';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly utilityService: UtilService,
  ) {}

  private async updateRefreshToken(userId: string, refreshToken: string) {
    try {
      const user = await this.userRepository.findOne({
        where: {
          id: userId,
        },
      });
      const salt = await this.utilityService.generateSalt();
      const hashRefreshToken = await this.utilityService.generatePassword(
        refreshToken,
        salt,
      );
      await this.userRepository
        .createQueryBuilder()
        .update(User)
        .set({
          refresh_token: hashRefreshToken,
        })
        .where('id = :id', { id: userId })
        .execute();
    } catch (error) {
      console.log(error);
    }
  }

  async refreshTokens(req: any) {
    try {
      console.log(req.user['id']);
      const userId = req.user['id'];
      const refreshToken = req.user['refreshToken'];
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });
      if (!user || !user.refresh_token) {
        throw new HttpException('Unauthorized access', HttpStatus.UNAUTHORIZED);
      }
      const refreshTokenMatches = await compare(
        refreshToken,
        user.refresh_token,
      );

      if (!refreshTokenMatches) {
        throw new HttpException('Unauthorized access', HttpStatus.UNAUTHORIZED);
      }
      const tokens = await this.utilityService.generateSignature({
        id: user.id,
        email: user.email,
        verified: user.is_email_verified,
      });
      await this.updateRefreshToken(user.id, tokens.refresh_token);
      return new SuccessfulResponse(
        'Successfully refreshed',
        HttpStatus.OK,
        tokens,
      );
    } catch (error) {
      console.log(error);
    }
  }

  async signUp(signupInstance: ISignupInstance) {
    const _salt = await this.utilityService.generateSalt();
    const { _otp, expiry } = await this.utilityService.generateOTP();
    const userPassword = await this.utilityService.generatePassword(
      signupInstance.password,
      _salt,
    );
    try {
      // Check if there is an existing user with the credentials supplied
      const existingUser = await this.userRepository.findOne({
        where: { email: signupInstance.email },
      });
      if (existingUser) {
        throw new NotFoundException('User already exist');
      }
      //Creating a new user if the user supplied a phone_number.
      const user = new User();
      user.otp_expiry = expiry;
      user.password = userPassword;
      user.otp = _otp;
      user.email = signupInstance.email;
      user.first_name = signupInstance.first_name;
      user.last_name = signupInstance.last_name;
      user.phone_number = signupInstance.phone_number;
      user.date_of_birth = signupInstance.date_of_birth;
      user.is_email_verified = true;

      const saved_user = await this.userRepository.save(user);
      const {
        id,
        password,
        password_reset_expire,
        otp,
        otp_expiry,
        new_password_token,
        ...data
      } = saved_user;
      await this.utilityService.sendCustomEmail(
        signupInstance.email,
        'Email Verification',
        _otp,
      );
      return new SuccessfulResponse('You have successfully log in', 201, data);
    } catch (error) {
      console.log(error);
      return new AllExceptionsFilter(error.response);
    }
  }

  async login(loginInstance: ILoginInstance) {
    try {
      let tokens: any;
      const _user = await this.userRepository.findOne({
        where: {
          email: loginInstance.email,
        },
      });
      if (!_user) {
        throw new NotFoundException('User not found');
      }

      if (!_user?.is_email_verified) {
        throw new BadRequestException('Account has not been verified');
      }

      if (
        !_user ||
        !_user == (await compare(loginInstance.password, _user.password))
      ) {
        throw new BadRequestException('Invalid credentials');
      }
      console.log('here');
      // eslint-disable-next-line prefer-const
      tokens = await this.utilityService.generateSignature({
        id: _user.id,
        email: _user.email,
        verified: _user.is_email_verified,
      });
      await this.updateRefreshToken(_user.id, tokens.refresh_token);
      const {
        id,
        password,
        otp_expiry,
        otp,
        new_password_token,
        password_reset_expire,
        ...user
      } = _user;
      return new SuccessfulResponse('You have successfully log in', 201, {
        tokens,
        user,
      });
    } catch (error) {
      console.log('auth/login', error);
      return new HttpException(error.response, error.status, error.error);
    }
  }

  async resendAccountOtpVerification(user: IResendOtpInstance) {
    try {
      const check_user = await this.userRepository.findOne({
        where: [
          {
            email: user.email,
          },
        ],
      });

      const CURRENT_TIME = new Date().getTime();
      const EXPIRE_TIME = new Date(check_user.otp_expiry).getTime();
      const CREATED_TIME = new Date(check_user?.created_at).getTime();
      if (check_user.otp && CREATED_TIME - CURRENT_TIME < EXPIRE_TIME) {
        const { _otp, expiry } = await this.utilityService.generateOTP();

        check_user.otp = _otp;
        check_user.otp_expiry = expiry;
        // Save the updated user back to the database
        await this.userRepository.save(check_user);
        if (check_user.email) {
          await this.utilityService.sendCustomEmail(
            check_user.email,
            'Resend OTP',
            _otp,
          );
          return new SuccessfulResponse(
            'New OTP verification successfully sent to your email',
            201,
            check_user.email,
          );
        } else if (check_user.phone_number) {
          await this.utilityService.sendPhoneNumberOtpVerification(
            _otp,
            check_user.phone_number,
          );
          return new SuccessfulResponse(
            'New OTP verification successfully sent to your phone number',
            201,
            check_user.phone_number,
          );
        }
      } else {
        throw new BadRequestException('Try again, later');
      }

      // return new SuccessfulResponse('New OTP verification successfully sent to your email', 201, check_user.email);
    } catch (error) {
      console.log(error);
      return new HttpException(error.message, error.status, error.error);
    }
  }

  async createForgottenPasswordToken(
    userOptions: IResendOtpInstance,
  ): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { email: userOptions.email },
    });
    if (!user) {
      return new NotFoundException('User not found');
    }

    try {
      if (user.email) {
        const resettoken =
          await this.utilityService.generateForgotPasswordOTP();
        const password_reset_expire = new Date(
          new Date().getTime() + 30 * 60 * 1000,
        );
        (user.new_password_token = resettoken),
          (user.password_reset_expire = password_reset_expire);
        await this.userRepository.save(user);
        await this.utilityService.sendCustomEmail(
          user.email,
          'Forgot Password Reset',
          user.new_password_token,
          // find_user.first_name,
        );
        return new SuccessfulResponse(
          'Check your email for forgot password token',
          HttpStatus.CREATED,
          user.email,
        );
      } else if (user.phone_number) {
        const resettoken =
          await this.utilityService.generateForgotPasswordOTP();
        const password_reset_expire = new Date(
          new Date().getTime() + 30 * 60 * 1000,
        );
        (user.new_password_token = resettoken),
          (user.password_reset_expire = password_reset_expire);
        await this.userRepository.save(user);
        await this.utilityService.sendPhoneNumberOtpVerification(
          user.new_password_token,
          user.phone_number,
        );
        return new SuccessfulResponse(
          'Check your phone number for forgot password token',
          HttpStatus.CREATED,
          user.phone_number,
        );
      }
    } catch (error) {
      console.log(error);
      return new HttpException(error.message, error.status, error.error);
    }
  }

  async sendEmailForgotPassword(req: any) {
    const userOptions: IResendOtpInstance = req.body;
    const find_user = await this.userRepository.findOne({
      where: { email: userOptions.email },
    });

    if (!find_user) {
      throw new NotFoundException('User not found');
    }

    const savedUser = await this.createForgottenPasswordToken(userOptions);
    try {
      if (savedUser) {
        return new SuccessfulResponse(
          savedUser.message,
          HttpStatus.CREATED,
          savedUser.data,
        );
      }
    } catch (error) {
      console.log(error);
      return new HttpException(error.message, error.status, error.error);
    }
  }
}
