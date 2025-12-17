import { Module } from '@nestjs/common';
import { MonitoringLogger } from './logger.service';
import { MetricsService } from './metrics.service';
import { MonitoringController } from './monitoring.controller';

@Module({
  providers: [MonitoringLogger, MetricsService],
  controllers: [MonitoringController],
  exports: [MonitoringLogger, MetricsService],
})
export class MonitoringModule {}
