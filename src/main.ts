import { Logger, ValidationError, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationException } from './sender/validation.exceptions';
import * as morgan from 'morgan';
import * as express from 'express';

const logger = new Logger('MAIN');

async function bootstrap() {
  
  const app = await NestFactory.create(AppModule, {bodyParser: true, rawBody: true});


  app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length]'))

  app.useGlobalPipes(new ValidationPipe(
  {
    transform: true,
    stopAtFirstError: true,
    exceptionFactory: (validationErrors: ValidationError[] = []) =>
    {
      return new ValidationException(validationErrors);
    }
  })); 


  startDocs(app);

  const port = process.env.PORT || 3000;

  await app.listen(port, () => {
    logger.log(`>>> ${process.env.npm_package_name} - VERSAO ${process.env.npm_package_version} - PORTA ${port} - I'm Ready :)`);
  });

}


function startDocs(app)
{
  const config = new DocumentBuilder()
  .setTitle('Proxy OPB')
  .setDescription('Proxy para chamadas externas.')
  .setVersion('1.0')
  .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
}

bootstrap();
