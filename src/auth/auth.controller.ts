import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
// import { HttpExceptionFilter, RefreshTokenGuard } from '../middlewares';
import { AuthService } from './auth.service';
import { EmailDTO, LoginDTO, SignupDTO, otpDTO, resendOTP } from './dtos';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { AllExceptionsFilter } from '../middlewares/allException.filter';
import { RefreshTokenGuard } from '../middlewares';

@ApiTags('Auth')
@Controller('auth')
@UseFilters(AllExceptionsFilter) //Here
@UsePipes(new ValidationPipe())
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiCreatedResponse({ description: 'Successful' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
  })
  @UseGuards(RefreshTokenGuard)
  @ApiBearerAuth()
  @Get('refresh')
  refreshTokens(@Req() req: Request) {
    return this.authService.refreshTokens(req);
  }

  @ApiOkResponse({ description: 'successful' })
  @ApiUnauthorizedResponse({ description: 'unauthorized user' })
  @ApiBadRequestResponse({ description: 'bad request' })
  @ApiCreatedResponse({ description: 'account successfully created' })
  @Post('signup')
  async onUserSignUp(@Body() signupDTO: SignupDTO) {
    return await this.authService.signUp(signupDTO);
  }

  @ApiConflictResponse({ description: 'conflict responses' })
  @ApiOkResponse({ description: 'successful' })
  @ApiBadRequestResponse({ description: 'bad request' })
  @Post('login')
  async onUserLogin(@Body() loginDTO: LoginDTO) {
    return await this.authService.login(loginDTO);
  }
}
