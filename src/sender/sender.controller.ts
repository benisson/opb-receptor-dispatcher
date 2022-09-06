import { All, Controller, Get, Post} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequestData } from './request-data.decorator';
import { SenderService } from './sender.service';
import { RequestDataDto } from './request-data.dto';

@Controller("send")
@ApiTags("Sender")
export class SenderController {

    constructor(private requesterService: SenderService){}


    @All()
    doRequest(@RequestData(RequestDataDto) proxyRequestData:RequestDataDto)
    {
        return this.requesterService.doRequest(proxyRequestData);
    }
}


