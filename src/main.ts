import { NestFactory } from '@nestjs/core';
import {
  BadRequestException,
  ValidationPipe,
} from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { join, resolve } from 'path';
import * as express from 'express';
import * as cookieParser from 'cookie-parser';
// internal imports
import { AppModule } from './app.module';
import appConfig from './config/app.config';
import { CustomExceptionFilter } from './common/exception/custom-exception.filter';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { FileStorage } from './common/lib/Disk/FileStorage';


async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });

  app.useWebSocketAdapter(new IoAdapter(app));
  app.setGlobalPrefix('api');

  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
    ],
  });

  app.use(
    helmet({
      crossOriginResourcePolicy: false,
    }),
  );

  app.use('/public', express.static(resolve('./public')));
  console.log('Serving static from:', join(__dirname, '..', 'public'));

  // =========================
  // ✅ GLOBAL VALIDATION PIPE
  // =========================
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,               
      forbidNonWhitelisted: true,     
      stopAtFirstError: false,

      exceptionFactory: (errors) => {
        const formattedErrors = errors.map((error) => ({
          field: error.property,
          errors: error.constraints
            ? Object.values(error.constraints)
            : ['Invalid value'],
        }));

        return new BadRequestException({
          message: 'Validation failed',
          errors: formattedErrors,
        });
      },
    }),
  );

  // =========================
  // GLOBAL EXCEPTION FILTER
  // =========================
  app.useGlobalFilters(new CustomExceptionFilter());

  app.use(cookieParser());

  // =========================
  // STORAGE CONFIG
  // =========================
  FileStorage.config({
    driver: 'local',
    connection: {
      rootUrl: appConfig().storageUrl.rootUrl,
      publicUrl: appConfig().storageUrl.rootUrlPublic,
      awsBucket: appConfig().fileSystems.s3.bucket,
      awsAccessKeyId: appConfig().fileSystems.s3.key,
      awsSecretAccessKey: appConfig().fileSystems.s3.secret,
      awsDefaultRegion: appConfig().fileSystems.s3.region,
      awsEndpoint: appConfig().fileSystems.s3.endpoint,
      minio: true,
    },
  });

  // =========================
  // SWAGGER
  // =========================
  const options = new DocumentBuilder()
    .setTitle(`${process.env.APP_NAME} api`)
    .setDescription(`${process.env.APP_NAME} api docs`)
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
