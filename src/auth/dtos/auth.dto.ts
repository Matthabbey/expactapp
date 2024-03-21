import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDate,
  IsDateString,
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class SignupDTO {
  @ApiProperty({ example: 'Oyin' })
  @IsString()
  readonly first_name: string;

  @ApiProperty({ example: 'Vamp' })
  @IsString()
  readonly last_name: string;

  @ApiProperty({ example: 'Vamp@123' })
  @IsStrongPassword()
  readonly password: string;

  @ApiProperty({ example: 'vamp@gmail.com' })
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase()) // Convert to lowercase
  readonly email: string;

  @ApiProperty({ example: '2024-03-21 15:22:14.714376' })
  @IsDateString()
  readonly date_of_birth: Date;

  @ApiProperty({ example: '+2348036202050' })
  @IsString()
  readonly phone_number: string;
}

export class LoginDTO {
  @ApiProperty({
    description: 'user unique email',
    example: 'vamp@gmail.com',
  })
  @IsEmail()
  @IsOptional()
  @Transform(({ value }) => value.toLowerCase()) // Convert to lowercase
  readonly email: string;

  @ApiProperty({ example: 'Vamp@123' })
  @IsString()
  readonly password: string;
}

export class otpDTO {
  @ApiProperty({ example: 'vamp@gmail.com' })
  @IsEmail()
  @IsOptional()
  @Transform(({ value }) => value.toLowerCase())
  readonly email: string;

  @ApiProperty({ example: '8790' })
  @IsString()
  readonly otp: string;
}

export class resendOTP {
  @ApiProperty({ example: 'vamp@gmail.com' })
  @IsEmail()
  @IsOptional()
  @Transform(({ value }) => value.toLowerCase())
  readonly email: string;

  @ApiProperty({ example: '2345' })
  @IsString()
  @IsOptional()
  readonly otp: string;
}

export class EmailDTO {
  @ApiPropertyOptional({ example: 'vamp@gmail.com' })
  @IsEmail()
  @IsOptional()
  @Transform(({ value }) => value.toLowerCase())
  readonly email: string;
}
