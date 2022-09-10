import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class HttpLogger
{
    @PrimaryGeneratedColumn({type: "bigint"})
    id: number;

    @Index()
    @Column()
    xFapiInterationId:string;

    @Index()
    @Column()
    path:string;

    @Index()
    @Column()
    hostname:string;

    @Column()
    url:string;

    @Column()
    method:string;

    @Index()
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

    @Column({type: 'text', nullable: false})
    messageError:string;

    @Column({comment:'Timestamp da criação do registro na tabela.', precision: 3})
    created:Date;

    @Column({comment: 'IP Remoto recuperado na resposta HTTP'})
    remoteAddress:string;

    @Column({comment: 'Timestamp do recebido da requisiação', type: 'datetime', precision: 3})
    received:Date;

    @Column({type: 'datetime', comment: 'Timestamp que o dispatcher retornou a resposta para o chamador.', precision: 3, nullable: true})
    returnResponse:Date;

    // REQUEST TIMESTAMP, DATA E HORA DA OCORRECIA DE CADA FASE DA REQUISICAO/RESPOSTA
    @Column({comment: 'Timestamp do inicio da requisição', type: 'datetime', precision: 3})
    requestTimestampStart:Date;

    @Column({comment: 'Timestamp quando soquete foi atribuído ao request', precision: 3})
    requestTimestampSocket:Date;

    @Column({comment: 'Timestamp quando a pesquisa ao DNS terminou.', type: 'datetime', precision: 3, nullable: true })
    requestTimestampDNS:Date;

    @Column({comment: 'Timestamp quando o soquete foi conectado com sucesso', type: 'datetime', precision: 3})
    requestTimestampConnectSocket:Date;

    @Column({comment: 'Timestamp em que o soquete conectado com segurança', type: 'datetime', precision: 3, nullable:true})
    requestTimestampSecureSocket:Date;

    @Column({comment: 'Timestamp em que o pedido terminou de carregar', type: 'datetime', precision: 3, nullable:true})
    requestTimestampUpload:Date;

    @Column({comment: 'Timestamp em que a solicitação disparou o response evento', type: 'datetime', precision: 3, nullable:true})
    responseTimestamp:Date;

    @Column({comment: 'Timestamp em que a resposta disparou o end evento.', type: 'datetime', precision: 3, nullable:true})
    responseTimestampEnd:Date;

    @Column({comment: 'Timestamp em que a solicitação disparou o error evento', nullable: true, type: 'datetime', precision: 3})
    responseTimestampError:Date;

    @Column({comment: 'Timestamp em que a solicitação disparou o abort evento', nullable: true, type: 'datetime', precision: 3})
    responseTimestampAbort:Date;

    //REQUEST TIME, TEMPOS EM MS PARA AS FASES DA REQUISIÇÃO/RESPOSTA
    @Column({ default: 0, comment: 'Tempo em ms, que a requisição esperou para iniciar.'})
    requestPhaseTimeWait:number;

    @Column({ default: 0, comment: 'Tempo em ms para resolução do DNS.'})
    requestPhaseTimeDNS:number;

    @Column({ default: 0, comment: 'Tempo em ms para conexão TCP.'})
    requestPhaseTimeTCP:number;
    
    @Column({ default: 0, comment: 'Tempo em ms até receber o primeiro byte.'})
    requestPhaseTimeFirstByte:number;

    @Column({ default: 0, comment: 'Tempo em ms para realizar o download da resposta recebida.'})
    requestPhaseTimeDownload:number;

    @Column({ default: 0, comment: 'Tempo em ms para enviar a requisição HTTP para o destino.'})
    requestPhaseTimeRequest:number;

    @Column({ default: 0, comment: 'Tempo em ms total entre a requisição e resposta.'})
    requestPhaseTimeTotal:number;

    @Column({ default: 0, comment: 'Tempo em ms para fechar o tls.'})
    requestPhaseTLS:number;

    @Column({ default: 0, comment: 'Tempo em ms total do recebimento da requisição pelo dispatcher, até o retorno da resposta pelo chamador.'})
    requestTimeTotal:number;


}