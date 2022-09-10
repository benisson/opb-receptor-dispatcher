import { HttpException, Injectable, Logger } from '@nestjs/common';
import { CertificateAuthorityService } from '../trusted-ca-store/certificate-authority.service';
import { HttpErrorCode } from '../http-client/http-error-code.enum';
import { RequestDataDto } from './request-data.dto';
import { HttpClientService } from '../http-client/http-client.service';
import { HTTPError, PlainResponse } from 'got/dist/source';


@Injectable()
export class SenderService {

    private logger = new Logger(SenderService.name);

    constructor(
        private certificateAuthorityService: CertificateAuthorityService,
        private httpClientService: HttpClientService){}


    async doRequest(proxyRequestHeader:RequestDataDto, retries = 3) : Promise<PlainResponse>
    {
        this.logger.log(`
        [doRequest] 
        >>> URL : ${proxyRequestHeader.url} 
        >>> headers : ${JSON.stringify(proxyRequestHeader.headers)}
        `);

        return this.httpClientService.doRequest(proxyRequestHeader)
                   .catch(error => this.handlerError(error, proxyRequestHeader, retries));
    }



    
    private async handlerError(error:HTTPError, proxyRequestHeader:RequestDataDto, retries:number)
    {
        if(HttpErrorCode.UNABLE_TO_GET_ISSUER_CERT_LOCALLY === error.code || HttpErrorCode.SELF_SIGNED_CERT_IN_CHAIN === error.code)
        {
            await this.certificateAuthorityService.updateCaBundleByURL(proxyRequestHeader.host, proxyRequestHeader.port);
            
            if(retries)
            {
                return this.doRequest(proxyRequestHeader, retries - 1);
            }
        }

        const message = this.geMessageError(error);
        const status = error?.response?.statusCode || 500;

        const payloadError = {
            status,
            code : error.code,
            xFapiInteractionId: proxyRequestHeader.interactionId,
            message
        }

        throw new HttpException(HttpException.createBody(payloadError), status);
    }
    
    private geMessageError(error: HTTPError)
    {
        const messageError = error?.response?.body || error?.message || error;

        if(messageError)
        {
            try
            {
                return JSON.parse(messageError as string);
            }
            catch(e)
            {
                return messageError;
            }
        }
    }


}

