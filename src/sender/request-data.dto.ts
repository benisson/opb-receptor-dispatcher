import { Expose } from "class-transformer";
import { IsNotEmpty } from "class-validator";

export class RequestDataDto
{
    @IsNotEmpty({message: "O campo 'x-br-com-bb-bw-opb-host' não foi informado" })
    @Expose({ name: 'x-br-com-bb-bw-opb-host' })
    host:string;
    
    @IsNotEmpty({message: "O campo 'x-br-com-bb-bw-opb-port' não foi informado" })
    @Expose({ name: 'x-br-com-bb-bw-opb-port' })
    port:number;


    @IsNotEmpty({message: "O campo 'x-br-com-bb-bw-opb-path' não foi informado" })
    @Expose({ name: 'x-br-com-bb-bw-opb-path' })
    path:string;

    @Expose({ name: 'x-fapi-interaction-id' })
    interactionId:string;

    url:string;

    requestReceived:string;

    headers:any;

    body:any;

    method:string;

}
