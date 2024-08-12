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
import {
  LoginResp,
  RegisterUserReq,
  RequestResetPasswordReq,
  ResetPasswordReq,
  UserProfileResp,
} from './types/api';
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

  @Public()
  @Post('request-reset-password')
  @ApiResponse({ status: '2XX', type: MessageResp })
  async requestResetPassword(
    @Body() reqBody: RequestResetPasswordReq,
  ): Promise<MessageResp> {
    await this.authService.requestResetPassword(reqBody);

    return {
      message:
        'The request to reset password has been sent. If an account with the email exists, a reset link will be sent to the email.',
    };
  }

  @Public()
  @Post('reset-password')
  @ApiResponse({ status: '2XX', type: MessageResp })
  async resetPassword(@Body() reqBody: ResetPasswordReq): Promise<MessageResp> {
    await this.authService.resetPassword(reqBody);

    return {
      message:
        'Password reset successful. Please login with your new password.',
    };
  }
}
