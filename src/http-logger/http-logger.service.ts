import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpLogger } from './http-logger.entity';
import { RequestError, Response, } from 'got/dist/source';

@Injectable()
export class HttpLoggerService {

    private logger = new Logger(HttpLoggerService.name);

    constructor(@InjectRepository(HttpLogger) private httpLoggerRepository: Repository<HttpLogger>){}

    handlerResponseSuccess(response: Response)
    {
        const newLogger = this.createEntity(response);
        this.save(newLogger);

        return response;
    }

    save(data: HttpLogger)
    {
        this.httpLoggerRepository.save(data);
    }

    handlerResponseError(error: RequestError)
    {
        this.logger.error(`[handlerResponseError] - ${error?.response?.body}`, error);

        const newLogger = this.createEntityError(error);
        this.save(newLogger);
        throw error;
    }

    private createEntityError(error: RequestError)
    {
        const optionsRequest = error?.request?.options;
        const headerRequest = optionsRequest?.headers;

        let dataHttp = new HttpLogger();
        dataHttp.created = new Date();
        dataHttp.errorCode = error.code;
        dataHttp.xFapiInterationId = headerRequest?.['x-fapi-interaction-id'] as string;
        dataHttp.requestHeaders = JSON.stringify(error?.request?.options?.headers);
        dataHttp.status = error?.response?.statusCode;
        dataHttp.responseHeaders = JSON.stringify(error?.response?.headers);
        dataHttp.responsePayload = JSON.stringify(error?.response?.body);
        dataHttp.messageError = JSON.stringify(error?.message);
        dataHttp.requestPayload = JSON.stringify(optionsRequest.body || optionsRequest.json || optionsRequest.form);
        dataHttp.url = optionsRequest.url.toString();
        dataHttp.method = error.request.options.method;
        dataHttp.path = optionsRequest.url.pathname;
        dataHttp.hostname = optionsRequest.url.host;
        dataHttp.remoteAddress = error?.response?.ip;
        dataHttp = this.setTimingsToHttpLogger(error.timings, dataHttp);
        dataHttp = this.setRequestTime(dataHttp, error.response);

        return dataHttp;

    }

    private createEntity(response: Response)
    {
        const optionsRequest = response?.request?.options;
        const headerRequest = optionsRequest?.headers;

        let dataHttp = new HttpLogger();
        dataHttp.created = new Date();
        dataHttp.xFapiInterationId = headerRequest?.['x-fapi-interaction-id'] as string;
        dataHttp.requestHeaders = JSON.stringify(headerRequest);
        dataHttp.status = response.statusCode;
        dataHttp.responseHeaders = JSON.stringify(response.headers);
        dataHttp.responsePayload = JSON.stringify(response.body);
        dataHttp.requestPayload  = JSON.stringify(optionsRequest.body || optionsRequest.json || optionsRequest.form);
        dataHttp.url = optionsRequest.url.toString();
        dataHttp.method = optionsRequest.method as string;
        dataHttp.path = optionsRequest.url.pathname;
        dataHttp.hostname = optionsRequest.url.hostname;
        dataHttp.remoteAddress = response.ip;
        dataHttp = this.setTimingsToHttpLogger(response.timings, dataHttp);
        dataHttp = this.setRequestTime(dataHttp, response);

        
        return dataHttp;
    }

    private setRequestTime(dataHttp: HttpLogger, response: Response)
    {
        if(dataHttp && response)
        {
            const headers = response?.request?.options?.headers;
            const xRequestReceived = headers['x-request-received'];

            if(xRequestReceived)
            {
                const received = new Date(xRequestReceived as string);
                dataHttp.received = received;
                dataHttp.returnResponse = new Date();
                dataHttp.requestTimeTotal = dataHttp.returnResponse.getTime() - received.getTime();
            }
        }

        return dataHttp;
    }

    /**
     * Lib usada para contabilizar o tempo das fases
     * https://github.com/szmarczak/http-timer#timerrequest
     * 
     * @param timings 
     * @param dataHttp 
     * @returns 
     */
    private setTimingsToHttpLogger(timings: any, dataHttp: HttpLogger)
    {
        dataHttp.requestTimestampStart  = this.timeToDate(timings.start);
        dataHttp.requestTimestampSocket = this.timeToDate(timings.socket);
        dataHttp.requestTimestampDNS    = this.timeToDate(timings.lookup);
        dataHttp.requestTimestampConnectSocket = this.timeToDate(timings.socket);
        dataHttp.requestTimestampSecureSocket = this.timeToDate(timings.secureConnect);
        dataHttp.requestTimestampUpload = this.timeToDate(timings.upload);
        dataHttp.responseTimestamp = this.timeToDate(timings.response);
        dataHttp.responseTimestampEnd = this.timeToDate(timings.end);
        dataHttp.responseTimestampError = this.timeToDate(timings.error);
        dataHttp.responseTimestampAbort = this.timeToDate(timings.abort);

        dataHttp.requestPhaseTimeWait = timings.phases.wait;
        dataHttp.requestPhaseTimeDNS = timings.phases.dns;
        dataHttp.requestPhaseTimeTCP = timings.phases.tcp;
        dataHttp.requestPhaseTimeFirstByte = timings.phases.firstByte;
        dataHttp.requestPhaseTimeDownload = timings.phases.download;
        dataHttp.requestPhaseTimeRequest = timings.phases.request;
        dataHttp.requestPhaseTimeTotal = timings.phases.total;
        dataHttp.requestPhaseTLS = timings.phases.tls;
       

        return dataHttp;
    }

    private timeToDate(time:number)
    {
        if(time)
        {
            return new Date(time);
        }
        return null;
    }
}
