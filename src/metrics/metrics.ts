import { IMetric } from "./metrics.service";

export const METRICS = new Map<string, IMetric>();

export enum MetricsLabelRequestControl
{
   REMOTE_ADDRESS = "remote_address", 
   STATUS = "status", 
   HOSTNAME = "hostname",
   ADDR = "addr",
   CODE = "code",
   METHOD = "method",
   IS_ERROR = "isError"
}

const REQUEST_CONTROL: IMetric = {
    name: 'request_control',
    help: 'Métricas das requisições feitas para as URLs passadas para o dispatcher',
    labelNames: [MetricsLabelRequestControl.REMOTE_ADDRESS, MetricsLabelRequestControl.STATUS, MetricsLabelRequestControl.HOSTNAME, MetricsLabelRequestControl.ADDR, MetricsLabelRequestControl.CODE, MetricsLabelRequestControl.METHOD,
    MetricsLabelRequestControl.IS_ERROR]
};
METRICS.set("REQUEST_CONTROL", REQUEST_CONTROL);


