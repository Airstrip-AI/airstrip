import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';
import { UserRole } from '../../../utils/constants';
import { ApiProperty } from '@nestjs/swagger';

export class OrgResp {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  role: UserRole;
}

export class UserProfileResp {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty({ type: [OrgResp] })
  orgs: OrgResp[];
}

export class LoginResp extends UserProfileResp {
  @ApiProperty()
  token: string;
}

export class RegisterUserReq {
  @IsEmail()
  @MaxLength(300)
  @ApiProperty()
  email: string;

  @IsString()
  @MaxLength(300)
  @IsNotEmpty()
  @ApiProperty()
  firstName: string;

  @IsString()
  @Length(8, 20)
  @IsNotEmpty()
  @ApiProperty()
  password: string;
}
