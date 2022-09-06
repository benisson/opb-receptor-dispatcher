import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class HttpLogger
{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    xFapiInterationId:string;

    @Column()
    path:string;

    @Column()
    hostname:string;

    @Column()
    url:string;

    @Column()
    method:string;

    @Column({comment: 'Status HTTP'})
    status:number;

    @Column({type: 'mediumtext'})
    responseHeaders:string;

    @Column({type: 'mediumtext'})
    responsePayload:string;
    
    @Column({type: 'mediumtext'})
    requestHeaders:string;

    @Column({type: 'mediumtext'})
    requestPayload:string;

    @Column({comment: 'Code recuperado do objeto de erro HTTP(response.code) ex: SELF_SIGNED_CERT_IN_CHAIN'})
    errorCode:string;

    @Column({comment:'Timestamp da criação do registro na tabela.'})
    created:Date;

    @Column({comment: 'Timestamp da resposta, recuperado do campo date da resposta http',  nullable: true})
    responseServer:Date;

    @Column({comment: 'Timestamp quando a resposta chegou no despachante.',  nullable: true})
    responseReceivedAt:Date;

    @Column({comment: 'Timestamp que a requisição chegou no microsserviço'})
    requestReceivedAt:Date;

    @Column({ default: 0, comment: 'Tempo em ms decorrido entre a chegada da requisição até o recebimento da resposta'})
    requestTime:number;
}