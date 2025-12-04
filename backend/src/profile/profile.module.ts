import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { SupabaseModule } from '../supabase/supabase.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [SupabaseModule, AuthModule],
  controllers: [ProfileController],
})
export class ProfileModule {}
