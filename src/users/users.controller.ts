import {
  Controller,
  Get,
  Req,
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { HttpExceptionFilter, AccessTokenGuard } from 'src/middlewares';
import { UsersService } from './users.service';
import { Request } from 'express';

@ApiTags('User')
@UseFilters(HttpExceptionFilter) //Here
@UsePipes(new ValidationPipe())
@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @ApiOkResponse({ description: 'successful' })
  @ApiNotFoundResponse({ description: 'Not found' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
  })
  @ApiOperation({ description: 'Get single user' })
  @Get('profile')
  async findOneUser(@Req() req: Request) {
    return await this.usersService.userProfile(req);
  }

  @ApiOkResponse({ description: 'successful' })
  @ApiNotFoundResponse({ description: 'Not found' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
  })
  @ApiOperation({ description: 'Get single user' })
  @Get('users')
  async getAllUsers() {
    return await this.usersService.getAllUser();
  }
}
