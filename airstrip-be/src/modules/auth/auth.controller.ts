import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { LocalAuthGuard } from './local-auth.guard';
import { Public } from '../../utils/constants';
import { JwtService } from './jwt.service';
import { AuthService } from './auth.service';
import { AuthedRequest } from './types/service';
import { LoginResp, RegisterUserReq, UserProfileResp } from './types/api';
import { ApiResponse } from '@nestjs/swagger';
import { MessageResp } from '../../utils/common';

@Controller()
export class AuthController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
  ) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiResponse({ status: '2XX', type: LoginResp })
  async login(@Request() req: AuthedRequest): Promise<LoginResp> {
    const { user } = req;
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      orgs: user.orgs,
      token: await this.jwtService.createSignedJwt({
        sub: user.id,
      }),
    };
  }

  @Get('me')
  @ApiResponse({ status: '2XX', type: UserProfileResp })
  async getUserProfile(
    @Request() req: AuthedRequest,
  ): Promise<UserProfileResp> {
    return {
      id: req.user.id,
      email: req.user.email,
      firstName: req.user.firstName,
      orgs: req.user.orgs,
    };
  }

  @Public()
  @Post('register')
  @ApiResponse({ status: '2XX', type: MessageResp })
  async register(
    @Body() registerUserReq: RegisterUserReq,
  ): Promise<MessageResp> {
    await this.authService.register(registerUserReq);

    return { message: 'Registration successful.' };
  }
}
