import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as passport from 'passport';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('back_api');
  // app.useGlobalPipes(new ValidationPipe({
  //   whitelist:true,
  //   forbidNonWhitelisted:true,
  //   transform:true
  // }))
  app.use(cookieParser());
  app.use(passport.initialize());
  await app.listen(process.env.NESTJS_PORT);
}

bootstrap()
