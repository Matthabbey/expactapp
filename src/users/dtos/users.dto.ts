import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail } from 'class-validator';

export class waitListDTO {
  @ApiProperty({ example: 'Elon' })
  @IsString()
  readonly first_name: string;

  @ApiProperty({ example: 'Musk' })
  @IsString()
  readonly last_name: string;

  @ApiProperty({ example: '+2348036200250' })
  @IsString()
  readonly phone_number: string;

  @ApiProperty({ example: 'coauth@gmail.com' })
  @IsEmail()
  readonly email: string;
}
