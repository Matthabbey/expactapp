/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities';
import { SuccessfulResponse } from 'src/middlewares';
import { IUserInstance } from './interface';
import { waitListDTO } from './dtos';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async userProfile(req: any) {
    const userId = req.user.userId;
    try {
      const find_user = await this.userRepository.findOne({
        where: { id: userId },
      });
      if (!find_user) {
        throw new UnauthorizedException('Unauthorized access');
      }

      const { id, date_of_birth, password, ...result } = find_user;

      return new SuccessfulResponse(
        'User profile retrieved',
        HttpStatus.OK,
        result,
      );
    } catch (error) {
      console.log('auth/verify', error);
      return new HttpException(error.message, error.status, error.error);
    }
  }

  async getAllUser() {
    try {
      const users = await this.userRepository.find({
        select: {
          first_name: true,
          last_name: true,
          date_of_birth: true,
          email: true,
          phone_number: true,
          created_at: true,
          is_email_verified: true,
        },
      });
      return users;
    } catch (error) {
      console.log('auth/verify', error);
      return new HttpException(error.message, error.status, error.error);
    }
  }
}
