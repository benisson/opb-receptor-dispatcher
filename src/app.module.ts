import { HttpLoggerService } from './http-logger/http-logger.service';
import { HttpClientService } from './http-client/http-client.service';
import { SenderController } from './sender/sender.controller';
import { SenderService } from './sender/sender.service';
import { Module } from '@nestjs/common';
import { CertificateAuthorityService } from './trusted-ca-store/certificate-authority.service';
import { ConfigModule } from '@nestjs/config';
import { CertificateConfig } from './certificate/certitificate.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbConfig } from './db/db.config';


@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot(DbConfig.get()),
    TypeOrmModule.forFeature(DbConfig.getEntities()),
  ],
  controllers: [
    SenderController
  ],
  providers: [
    HttpLoggerService,
    HttpClientService,
    SenderService,
    CertificateConfig,
    CertificateAuthorityService
  ],
  exports: [
    ConfigModule
  ]
})
export class AppModule { }
