import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class CertificateConfig
{

    private logger = new Logger(CertificateConfig.name);

    constructor(private config:ConfigService){}



    getCertificatePEM()
    {
        const certBase64 = this.config.get('CERT_PEM_OPB');
        const certPEM = Buffer.from(certBase64, 'base64').toString('utf8');

        return certPEM;
    }

    
    getKeyPEM()
    {
        const keyBase64 = this.config.get('KEY_PEM_OPB');
        const keyPEM = Buffer.from(keyBase64, 'base64').toString('utf8');
        return keyPEM;
    }    


}