import { INestApplication, Logger, ValidationError, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationException } from './sender/validation.exceptions';
import * as morgan from 'morgan';
import * as expressMonitor from '@labbsr0x/express-monitor';


const logger = new Logger('MAIN');

async function bootstrap() {
  
  const app = await NestFactory.create(AppModule, {bodyParser: true, rawBody: true});

  app.use(morgan('[remote_ip :remote-addr] - [:date[web]] ":method :url HTTP/:http-version" [status :status] -  [content_type :res[content-type]] - [request_time :total-time[digits]ms]'))

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

  startMetrics(app);

  const port = process.env.PORT || 3000;

  await app.listen(port, () => {
    logger.log(`>>> ${process.env.npm_package_name} - VERSAO ${process.env.npm_package_version} - PORTA ${port} - I'm Ready :)`);
  });

}


/**
 * Configura a rota /metrics
 * 
 * @param app 
 */
 async function startMetrics(app: INestApplication)
 {
   if (app)
   {
    logger.debug('Configurando metrics');
     const appMetrics = app.getHttpAdapter().getInstance();
     expressMonitor.Monitor.init(appMetrics, true);
   }
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
