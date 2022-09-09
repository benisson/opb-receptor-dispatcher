import { All, Controller, Get, Post, Res} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequestData } from './request-data.decorator';
import { SenderService } from './sender.service';
import { RequestDataDto } from './request-data.dto';
import { Response } from 'express';
import { OutgoingHttpHeaders } from 'http';

@Controller("send")
@ApiTags("Sender")
export class SenderController {

    constructor(private requesterService: SenderService){}


    @All()
    async doRequest(@RequestData(RequestDataDto) proxyRequestData:RequestDataDto, @Res({passthrough: true}) res: Response)
    {
        const response = await this.requesterService.doRequest(proxyRequestData);

        res.status(response.statusCode);
        res.setHeader('content-type', response.headers['content-type']);
        res.header(this.addHeadersResponse(res.getHeaders(), response.headers));

        return response.body;
    }

    private addHeadersResponse(headersResponse: OutgoingHttpHeaders, headers: OutgoingHttpHeaders) {

        for(const header in headers)
        {
            if(header && header.startsWith("x-"))
            {
                headersResponse[header] = headers[header];
            }
        }
      
        return headersResponse;
      }
}


