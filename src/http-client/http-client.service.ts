import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CertificateConfig } from '../certificate/certitificate.config';
import { HttpLoggerService } from '../http-logger/http-logger.service';
import { RequestDataDto } from '../sender/request-data.dto';
import { CertificateAuthorityService } from '../trusted-ca-store/certificate-authority.service';
import { MetricsService } from '../metrics/metrics.service';
import got, { Got, Method, Response, OptionsOfJSONResponseBody, RequestError, PlainResponse } from 'got/dist/source';
import * as AgentKeepAlive from 'agentkeepalive';
import { METRICS, MetricsLabelRequestControl } from 'src/metrics/metrics';
import { HttpErrorCode } from './http-error-code.enum';


@Injectable()
export class HttpClientService {

    private httpClient: Got;
    
    constructor(
        private certificateConfig: CertificateConfig,
        private certificateAuthorityService: CertificateAuthorityService,
        private httpLoggerService: HttpLoggerService,
        private metricsService: MetricsService)
    {
        this.createHttpClient();
    }

    async createHttpClient()
    {
        this.httpClient = await this.createGotClient();
    }

    private async createGotClient()
    {
        const httpsAgent = await this.createHttpsAgent();

        return got.extend({ agent: {
            https: httpsAgent,
            http2: true
         }},
         {
            hooks: {
                afterResponse: [
                    (response, retryWithMergedOptions) => {
                    this.httpLoggerService.handlerResponseSuccess(response);
                    this.registerMetrics(response);
                    return response;
                }],
                beforeError: [
                    error => {
                        this.httpLoggerService.handlerResponseError(error);
                        this.registerMetrics(error);
                        return error;
                    }
                ]
            }
         });
    }

    private registerMetrics(data: RequestError & PlainResponse | any)
    {
        const url = data.request.options.url as URL;

        const status = data?.statusCode || data?.response?.statusCode;

        const metric = {
            [MetricsLabelRequestControl.REMOTE_ADDRESS]: data.ip,
            [MetricsLabelRequestControl.HOSTNAME]: url.hostname,
            [MetricsLabelRequestControl.ADDR]: url.pathname,
            [MetricsLabelRequestControl.STATUS]: status,
            [MetricsLabelRequestControl.METHOD]: data?.request?.options?.method,
            [MetricsLabelRequestControl.IS_ERROR]: (status >= 200 && status <= 299) ? "false" : "true"
        }
        this.metricsService.incrementWithLabels(METRICS.get("REQUEST_CONTROL"), metric);
    }

    private async createHttpsAgent()
    {
        const caBundle = await this.certificateAuthorityService.getCaIntermediateAndRootMozilla();

        const options = {
            keepAlive: true,
            ca: caBundle,
            cert: this.certificateConfig.getCertificatePEM(), 
            key: this.certificateConfig.getKeyPEM(),
            timeout: 15000,
            requestOCSP: true
        }

        return new AgentKeepAlive.HttpsAgent(options);
    }   


    public doRequest(proxyRequestHeader:RequestDataDto): Promise<PlainResponse>
    {
        const config: OptionsOfJSONResponseBody = {
            ...(proxyRequestHeader.isJson)  && {json: proxyRequestHeader.body},
            ...(!proxyRequestHeader.isJson) && {body: proxyRequestHeader.body},
            headers: proxyRequestHeader.headers,
            method: proxyRequestHeader.method as Method,
            dnsCache: false,
            followRedirect: false
        }

        return this.httpClient(proxyRequestHeader.url, config);
    }

}
