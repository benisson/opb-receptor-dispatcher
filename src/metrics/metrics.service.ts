import { Injectable, Logger } from '@nestjs/common';
import * as expressMonitor from '@labbsr0x/express-monitor';

@Injectable()
export class MetricsService {

    private metrics = {};

    private getMetric(metric: IMetric) 
    {
        if (!expressMonitor.Monitor) {
            return null;
        }
        if (!this.metrics[metric.name]) {
            this.metrics[metric.name] = new expressMonitor.Monitor.promclient.Counter(metric);
        }
        return this.metrics[metric.name];
    }


    public incrementWithLabels(metric: IMetric, labels: labelValues) 
    {
        try
        {   
            this.getMetric(metric)?.inc(labels);
        }
        catch(e)
        {   
            Logger.error(`[incrementWithLabels] - Erro ao registrar metrica`, e, MetricsService.name);
        }   
        
    }
}

export interface IMetric {
    name,
    help,
    labelNames
}

export interface labelValues {
    [key: string]: string | number;
}
