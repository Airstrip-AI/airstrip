import * as dotenv from 'dotenv';
import * as path from 'path';
import { NestFactory } from '@nestjs/core';
import {
  BadRequestException,
  LogLevel,
  ValidationError,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import helmet from 'helmet';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { recursivelyGetChildrenErrors } from './utils/validators';
import { AppModule } from './modules/main-app/app.module';
import { EnvVariables } from './utils/constants/env';

dotenv.config({ path: path.join(__dirname, '../.env') });

const logLevelsMap: { [key: string]: number } = {
  verbose: 0,
  debug: 1,
  log: 2,
  warn: 3,
  error: 4,
  fatal: 5,
};

const logLevelsArray: LogLevel[] = [
  'verbose',
  'debug',
  'log',
  'warn',
  'error',
  'fatal',
];

function getLogLevels(minLevel: string): LogLevel[] {
  const index = logLevelsMap[minLevel];
  return logLevelsArray.slice(index);
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: getLogLevels(process.env[EnvVariables.AIRSTRIP_LOG_LEVEL] || 'log'),
  });

  app.useBodyParser('json', { limit: '10mb' });

  app.use(helmet());

  const configService: ConfigService = app.get(ConfigService);

  const origins: RegExp[] = (
    configService.get(EnvVariables.AIRSTRIP_ALLOWED_ORIGINS) || ''
  )
    .split(',')
    .map((v: string) => v.trim())
    .filter((v: string) => !!v)
    .map((v: string) => new RegExp(v, 'i'));

  app.set('trust proxy', true);
  app.enableCors({
    origin: origins,
  });

  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.setGlobalPrefix('/api');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const validationErrors = recursivelyGetChildrenErrors(errors, '');
        const responseJson = {
          statusCode: 400,
          message: 'Invalid inputs received.',
          error: 'Bad Request',
          validationErrors,
        };
        return new BadRequestException(responseJson);
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Airstrip APIs')
    .setDescription('Airstrip APIs')
    .setVersion('1.0')
    .addTag('airstrip')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(configService.getOrThrow(EnvVariables.AIRSTRIP_PORT));
}

bootstrap();
