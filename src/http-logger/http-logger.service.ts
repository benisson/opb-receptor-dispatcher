import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AxiosError, AxiosResponse } from 'axios';
import { Repository } from 'typeorm';
import { HttpLogger } from './http-logger.entity';

@Injectable()
export class HttpLoggerService {

    private logger = new Logger(HttpLoggerService.name);

    constructor(@InjectRepository(HttpLogger) private httpLoggerRepository: Repository<HttpLogger>){}

    handlerResponseSuccess(response: AxiosResponse)
    {
        const newLogger = this.createEntity(response);
        this.save(newLogger);

        return response;
    }

    save(data: HttpLogger)
    {
        this.httpLoggerRepository.save(data);
    }

    handlerResponseError(error: AxiosError)
    {
        this.logger.error(`[handlerResponseError] - ${error?.response?.data}`, error);

        const newLogger = this.createEntityError(error);
        this.save(newLogger);
        throw error;
    }

    private createEntityError(error: AxiosError)
    {
        const requestReceived = error.config?.headers?.['x-request-received'] as string;

        const dataHttp = new HttpLogger();
        dataHttp.created = new Date();
        dataHttp.errorCode = error.code;
        dataHttp.xFapiInterationId = error.config?.headers?.['x-fapi-interaction-id'] as string;
        dataHttp.requestReceivedAt = requestReceived ? new Date(requestReceived) : null;
        dataHttp.requestHeaders = JSON.stringify(error.config.headers);
        dataHttp.status = error?.response?.status;
        dataHttp.responseHeaders = JSON.stringify(error?.response?.headers);
        dataHttp.responsePayload = JSON.stringify(error.response.data);
        dataHttp.requestPayload = JSON.stringify(error.config.data);
        dataHttp.url = error.config.url;
        dataHttp.method = error.request.method;
        dataHttp.path = error.request.path;
        dataHttp.hostname = error.request.host;
        dataHttp.responseServer = error?.response?.headers?.['date'] ? new Date(error?.response?.headers?.['date']) : null;
        dataHttp.responseReceivedAt = new Date();

        if(dataHttp.requestReceivedAt && dataHttp.responseReceivedAt)
        {
            dataHttp.requestTime = dataHttp.responseReceivedAt.getTime() - dataHttp.requestReceivedAt.getTime();
        }
        console.log("dataHttp ", dataHttp);
        return dataHttp;

    }

    private createEntity(response: AxiosResponse)
    {
        const requestTime = response.config?.headers?.['x-request-received'];
        
        const dataHttp = new HttpLogger();
        dataHttp.created = new Date();
        dataHttp.xFapiInterationId = response.config.headers?.['x-fapi-interaction-id'] as string;
        dataHttp.requestReceivedAt = requestTime ? new Date(requestTime as string) : null;
        dataHttp.requestHeaders = JSON.stringify(response.config.headers);
        dataHttp.status = response.status;
        dataHttp.responseHeaders = JSON.stringify(response.headers);
        dataHttp.responsePayload = JSON.stringify(response.data);
        dataHttp.requestPayload = JSON.stringify(response.config.data);
        dataHttp.url = response.config.url;
        dataHttp.method = response.request.method;
        dataHttp.path = response.request.path;
        dataHttp.hostname = response.request.host;
        dataHttp.responseReceivedAt = new Date(response.headers?.['date']);

        if(dataHttp.requestReceivedAt && dataHttp.responseReceivedAt)
        {
            dataHttp.requestTime = dataHttp.responseReceivedAt.getTime() - dataHttp.requestReceivedAt.getTime();
        }
        return dataHttp;
    }
}
