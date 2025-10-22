import { Injectable } from '@nestjs/common';

export class ActivityEntry {
  activity: string;
  date: string;
}

@Injectable()
export class ActivityService {
  async getUserActivity(userId: string): Promise<ActivityEntry[]> {
    return [
      { activity: 'Updated Education', date: '2025-10-21' },
      { activity: 'Added new skill: React', date: '2025-10-20' }
    ];
  }
}
