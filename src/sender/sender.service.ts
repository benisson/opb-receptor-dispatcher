import { Injectable, Logger } from '@nestjs/common';
import { CertificateAuthorityService } from '../trusted-ca-store/certificate-authority.service';
import { HttpErrorCode } from '../http-client/http-error-code.enum';
import { RequestDataDto } from './request-data.dto';
import { HttpClientService } from '../http-client/http-client.service';


@Injectable()
export class SenderService {

    private logger = new Logger(SenderService.name);

    constructor(
        private certificateAuthorityService: CertificateAuthorityService,
        private httpClientService: HttpClientService){}


    async doRequest(proxyRequestHeader:RequestDataDto, retry = 3)
    {
        this.logger.debug(`
        [doRequest] 
        >>> URL : ${proxyRequestHeader.url} 
        >>> headers : ${JSON.stringify(proxyRequestHeader.headers)}
        `);

        return this.httpClientService.doRequest(proxyRequestHeader)
                   .catch(error => this.handlerError(error, proxyRequestHeader, this.doRequest, retry));
    }



    
    private async handlerError(error:any, proxyRequestHeader:RequestDataDto, retryFunction:Function , retry:number)
    {
        if(HttpErrorCode.UNABLE_TO_GET_ISSUER_CERT_LOCALLY === error.code)
        {
            await this.certificateAuthorityService.updateCaBundleByURL(proxyRequestHeader.host, proxyRequestHeader.port);
            
            if(retry)
            {
                return retryFunction(proxyRequestHeader, retry - 1);
            }
        }

       
        const messageError = error?.response?.data || error?.message || error;

        this.logger.error(`[handlerError] - error.code - ${error.code} - ${JSON.stringify(messageError)}`, error);

        throw messageError;    
    }
    

}

