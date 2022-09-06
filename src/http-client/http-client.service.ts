import { Injectable } from '@nestjs/common';
import { CertificateConfig } from 'src/certificate/certitificate.config';
import { HttpLoggerService } from '../http-logger/http-logger.service';
import * as AgentKeepAlive from 'agentkeepalive';
import { RequestDataDto } from 'src/sender/request-data.dto';
import { CertificateAuthorityService } from 'src/trusted-ca-store/certificate-authority.service';
//import { Got, PlainResponse, Method } from 'got';


@Injectable()
export class HttpClientService {

    private httpClient: any;
    
    constructor(
        private certificateConfig: CertificateConfig,
        private certificateAuthorityService: CertificateAuthorityService,
        private httpLoggerService: HttpLoggerService)
    {
        this.createHttpClient();
    }

    private async createHttpClient()
    {
        this.httpClient = await this.createAxiosClient();
    }

    private async createAxiosClient()
    {
        const httpsAgent = this.createHttpsAgent();
        
        const gotSource = await import('got');

         return gotSource.got.extend({ agent: {
            https: httpsAgent,
            http2: true
         }});

        //const instance =  axios.create({
        //    httpsAgent : httpsAgent,
        //    //timeout: 15000
        //});
//
        //instance.interceptors
        //        .response
        //        .use(response => this.httpLoggerService.handlerResponseSuccess(response),
        //             error    => this.httpLoggerService.handlerResponseError(error));
        //

        //return instance;
    }


    private createHttpsAgent()
    {
        const options = {
            keepAlive: true,
            ca: this.certificateAuthorityService.getCaBundle(),
            cert: this.certificateConfig.getCertificatePEM(), 
            key: this.certificateConfig.getKeyPEM(),
            timeout: 15000,
            requestOCSP: true
        }

        return new AgentKeepAlive.HttpsAgent(options);
    }   


    public doRequest(proxyRequestHeader:RequestDataDto): Promise<any>
    {
        const config = {
            url: proxyRequestHeader.url,
            body: proxyRequestHeader.body,
            headers: proxyRequestHeader.headers,
            method: proxyRequestHeader.method 
        }

        return this.httpClient(proxyRequestHeader.url, config)
                   .then(response => this.handlerSuccess(response))

    }


    private handlerSuccess(response:any)
    {   
        console.log("\n\n tsssss", response.timings);
        return response.body;
    }
}
