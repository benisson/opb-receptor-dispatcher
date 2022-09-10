import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientRequest } from 'http';
import { CaDataDto } from './ca-data.dto';
import got from 'got/dist/source';

import * as https from 'https'; 
import * as cvsToJson from 'csvtojson';

@Injectable()
export class CertificateAuthorityService {

    private logger = new Logger(CertificateAuthorityService.name);

    constructor(private config:ConfigService){}

    public async getCaIntermediateAndRootMozilla()
    {  
        const urlRootCa = this.config.get('URL_ROOT_CA_MOZILLA');
        const urlIntermediateCa = this.config.get('URL_ROOT_INTERMEDIATE_MOZILLA');

        this.logger.debug(`[getCaIntermediateAndRootMozilla] - BAIXANDO CA ROOT ${urlRootCa} `);
        this.logger.debug(`[getCaIntermediateAndRootMozilla] - BAIXANDO CA INTERMEDIATE ${urlIntermediateCa} `);

        const requestsCAs = [got.stream(urlRootCa, {responseType: 'buffer'}), 
                             got.stream(urlIntermediateCa, {responseType: 'buffer'})];

        const cas = await Promise.all(requestsCAs);

        let casPem = "";

        for(const ca of cas)
        {
            const dataCas = await cvsToJson().fromStream(ca) as Array<CaDataDto>;

            for(const dataCa of dataCas)
            {
                let certPem = dataCa['PEM Info'].slice(1, -1);
                casPem = casPem.concat(`\n${certPem}`);
            }
        }
        this.logger.debug(`[getCaIntermediateAndRootMozilla] - CA'S BAIXADAS COM SUCESSO!`);
        return casPem;
    }

    private async getChainByURL(hostname:string, port:number): Promise<string>
    {
        this.logger.debug(`[getChainByURL] - Recuperando cadeia de certificados do HOSTNAME ${hostname}`);

        let request : ClientRequest = null;

        
        const options: https.RequestOptions = {
            hostname: hostname,
            method: 'GET',
            port: port,
            servername: hostname,
            rejectUnauthorized: false
        }

        const response = new Promise<string>((resolve, reject) => {

            request = https.get(options, (res) =>  {

                const socket:any = res.socket;
                let cert = socket.getPeerCertificate(true);

                if(!cert)
                {
                    reject(`Não foi possível recuperar a cadeia de certificados para o hostname ${hostname}`);
                }  
                    
                const chain = this.handlerPeerCertificate(cert, hostname);

                resolve(chain);
            });    
            
            request.on('error', (e) => {
                this.logger.error("HTTP Error ", e);
                reject(e);
            });
        })

        if(request)
        {
            request.end();
        }

        return response;
        
    }

    /**
     * TODO: RETORNAR OS DADOS DOS CERTIFICADOS PARA CACHE.
     * 
     * @param cert 
     * @returns 
     */
    private handlerPeerCertificate(cert:any, hostname:string)
    {
        if(cert)
        {
            let chain = '';
            let nextCert = cert;
            do
            {
                const pem = this.pemEncode(nextCert.raw.toString('base64'), 64);

                chain = chain.concat(pem);

                nextCert = nextCert.issuerCertificate

            } while(nextCert)


            return chain;
        }
       
    }

    private pemEncode(str:string, n:number) {
        var ret = [];

        for (var i = 1; i <= str.length; i++) {
          ret.push(str[i - 1]);
          var mod = i % n;
      
          if (mod === 0) {
            ret.push('\n');
          }
        }
      
        var returnString = `-----BEGIN CERTIFICATE-----\n${ret.join('')}\n-----END CERTIFICATE-----\n`;
      
        return returnString;
    }
}

export interface DataCertificate
{
  subject: any,
  issuer: any,
  subjectaltname: string,
  infoAccess: any,
  bits: number,
  pubkey: Buffer,
  asn1Curve: string,
  nistCurve: string,
  valid_from: string,
  valid_to: string,
  fingerprint: string,
  fingerprint256: string,
  ext_key_usage: Array<string>,
  serialNumber: string,
  raw: Buffer,
  pemEncoded:string;
  
}