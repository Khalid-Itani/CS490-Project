import { Module } from '@nestjs/common';
import { ContactDiscoveryController } from './contact-discovery.controller';
import { ContactDiscoveryService } from './contact-discovery.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [ContactDiscoveryController],
  providers: [ContactDiscoveryService],
  exports: [ContactDiscoveryService],
})
export class ContactDiscoveryModule {}
