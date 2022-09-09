import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { ValidationException } from './validation.exceptions';
import { v4 as uuidv4 } from 'uuid';

const excludeHeaders = ['x-br-com-bb', 'host', 'user-agent', 'postman-token', 'accept-encoding', 'content-length'];

export const RequestData = createParamDecorator(
    async (value: any, ctx: ExecutionContext) =>
    {
        const request = ctx.switchToHttp().getRequest();
        const headers = request.headers;
        const rawBody = request.rawBody;
        const dto = plainToInstance(value, headers, { excludeExtraneousValues: true });
        const validationErrors: ValidationError[] = await validate(dto);

        if (validationErrors.length)
        {
            throw new ValidationException(validationErrors);
        }

        for(const header in headers)
        {
            if(excludeHeaders.find(h => header.includes(h)))
            {
                delete headers[header];
            }
        }

        headers['user-agent'] = `${process.env.npm_package_name}/${process.env.npm_package_version}`;
        headers['x-request-received'] = Date.now();
        headers['x-fapi-interaction-id'] = headers['x-fapi-interaction-id'] || uuidv4();

        dto['interactionId'] = headers['x-fapi-interaction-id'];
        dto['method'] = request.method || 'GET';
        dto['url'] = amountURL(dto);
        dto['headers'] = headers;

        const dataBody = parseBody(rawBody);
        
        if(dataBody)
        {
            dto['body'] = dataBody.body;
            dto['isJson'] = dataBody.isJson;
        }
 
        return dto;
    },

);

function parseBody(rawBody: Buffer)
{
    if(rawBody)
    {
        const strBody = Buffer.from(rawBody).toString();

        try
        {
            const body = JSON.parse(strBody);

            return {body, isJson : true};
        }
        catch(e)
        {
            return {body : strBody, isJson : false};
        }
    }
}   

function amountURL(proxyRequestHeader)
{       
    if(proxyRequestHeader)
    {
        let url = '';
        if(proxyRequestHeader.host)
        {
            url = proxyRequestHeader.host;
            if(!proxyRequestHeader.host.includes('https'))
            {
                url = `https://${proxyRequestHeader.host}` ;
            }
        }
        const port = proxyRequestHeader.port || 443;
        url = url.concat(`:${port}`);
        
        if(proxyRequestHeader.path)
        {
            if(proxyRequestHeader.path.startsWith("/"))
            {
                proxyRequestHeader.path = proxyRequestHeader.path.replace("/", "");
            }
            url = url.concat(`/${proxyRequestHeader.path}`);
        }   
        return url;
    }
}
