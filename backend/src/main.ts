import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //dto based validation pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  app.use(cookieParser()); //enabling cookie parsing stuff

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector))); //excludes

  //cors
  app.enableCors({
    origin: ['http://localhost:5173', 'https://scribbly.vercel.app'],
    credentials: true,
  });
  //swagger ui bs
  const config = new DocumentBuilder()
    .setTitle('Scribbly')
    .setDescription('Notes application')
    .setVersion('1.0')
    .addCookieAuth('accessToken')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
