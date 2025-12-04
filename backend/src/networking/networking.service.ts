import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class NetworkingService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async createEvent(userId: string, eventData: any) {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('networking_events')
      .insert({
        user_id: userId,
        event_name: eventData.eventName,
        event_date: eventData.eventDate,
        event_time: eventData.eventTime,
        location: eventData.location,
        event_type: eventData.eventType || 'in-person',
        industry: eventData.industry,
        description: eventData.description,
        organizer: eventData.organizer,
        registration_url: eventData.registrationUrl,
        attendance_status: eventData.attendanceStatus || 'planning',
        networking_goals: eventData.networkingGoals || [],
        target_connections: eventData.targetConnections || 0,
        preparation_notes: eventData.preparationNotes,
        actual_connections_made: 0,
        follow_ups_completed: 0,
        roi_rating: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getEvents(userId: string, filters?: any) {
    const supabase = this.supabaseService.getClient();
    
    let query = supabase
      .from('networking_events')
      .select('*')
      .order('event_date', { ascending: false });

    if (filters?.eventType) {
      query = query.eq('event_type', filters.eventType);
    }
    if (filters?.industry) {
      query = query.eq('industry', filters.industry);
    }
    if (filters?.attendanceStatus) {
      query = query.eq('attendance_status', filters.attendanceStatus);
    }
    if (filters?.upcoming) {
      query = query.gte('event_date', new Date().toISOString());
    }
    if (filters?.past) {
      query = query.lt('event_date', new Date().toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getEventById(userId: string, eventId: string) {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('networking_events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (error) throw error;
    return data;
  }

  async updateEvent(userId: string, eventId: string, updates: any) {
    const supabase = this.supabaseService.getClient();
    
    // First check if the event belongs to the user
    const { data: event, error: fetchError } = await supabase
      .from('networking_events')
      .select('user_id')
      .eq('id', eventId)
      .single();

    if (fetchError) throw fetchError;
    
    if (!event || event.user_id !== userId) {
      throw new Error('You can only edit events you created');
    }
    
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };
    
    if (updates.eventName) updateData.event_name = updates.eventName;
    if (updates.eventDate) updateData.event_date = updates.eventDate;
    if (updates.eventTime) updateData.event_time = updates.eventTime;
    if (updates.location) updateData.location = updates.location;
    if (updates.eventType) updateData.event_type = updates.eventType;
    if (updates.industry) updateData.industry = updates.industry;
    if (updates.description) updateData.description = updates.description;
    if (updates.organizer) updateData.organizer = updates.organizer;
    if (updates.registrationUrl) updateData.registration_url = updates.registrationUrl;
    if (updates.attendanceStatus) updateData.attendance_status = updates.attendanceStatus;
    if (updates.networkingGoals) updateData.networking_goals = updates.networkingGoals;
    if (updates.targetConnections !== undefined) updateData.target_connections = updates.targetConnections;
    if (updates.preparationNotes) updateData.preparation_notes = updates.preparationNotes;
    if (updates.actualConnectionsMade !== undefined) updateData.actual_connections_made = updates.actualConnectionsMade;
    if (updates.followUpsCompleted !== undefined) updateData.follow_ups_completed = updates.followUpsCompleted;
    if (updates.roiRating !== undefined) updateData.roi_rating = updates.roiRating;
    if (updates.postEventNotes) updateData.post_event_notes = updates.postEventNotes;
    
    const { data, error } = await supabase
      .from('networking_events')
      .update(updateData)
      .eq('id', eventId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteEvent(userId: string, eventId: string) {
    const supabase = this.supabaseService.getClient();
    
    // First check if the event belongs to the user
    const { data: event, error: fetchError } = await supabase
      .from('networking_events')
      .select('user_id')
      .eq('id', eventId)
      .single();

    if (fetchError) throw fetchError;
    
    if (!event || event.user_id !== userId) {
      throw new Error('You can only delete events you created');
    }

    const { error } = await supabase
      .from('networking_events')
      .delete()
      .eq('id', eventId)
      .eq('user_id', userId);

    if (error) throw error;
    return { success: true };
  }

  async addConnectionToEvent(userId: string, eventId: string, contactId: string) {
    const supabase = this.supabaseService.getClient();
    
    // Link contact to event
    const { data, error } = await supabase
      .from('event_contacts')
      .insert({
        user_id: userId,
        event_id: eventId,
        contact_id: contactId,
        follow_up_completed: false,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Update event's actual_connections_made count
    const { data: event } = await supabase
      .from('networking_events')
      .select('actual_connections_made')
      .eq('id', eventId)
      .eq('user_id', userId)
      .single();

    await supabase
      .from('networking_events')
      .update({
        actual_connections_made: (event?.actual_connections_made || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', eventId)
      .eq('user_id', userId);

    // Update contact's connection_source if it's from this event
    await supabase
      .from('network_contacts')
      .update({
        connection_source: 'networking_event',
      })
      .eq('id', contactId)
      .eq('user_id', userId);

    return data;
  }

  async getEventConnections(userId: string, eventId: string) {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('event_contacts')
      .select(`
        *,
        network_contacts (
          id,
          contact_name,
          company,
          job_title,
          email_address,
          phone_number,
          relationship_strength
        )
      `)
      .eq('user_id', userId)
      .eq('event_id', eventId);

    if (error) throw error;
    return data || [];
  }

  async markFollowUpComplete(userId: string, eventId: string, contactId: string) {
    const supabase = this.supabaseService.getClient();
    
    const { error } = await supabase
      .from('event_contacts')
      .update({
        follow_up_completed: true,
        follow_up_date: new Date().toISOString(),
      })
      .eq('event_id', eventId)
      .eq('contact_id', contactId)
      .eq('user_id', userId);

    if (error) throw error;

    // Update event's follow_ups_completed count
    const { data: event } = await supabase
      .from('networking_events')
      .select('follow_ups_completed')
      .eq('id', eventId)
      .eq('user_id', userId)
      .single();

    await supabase
      .from('networking_events')
      .update({
        follow_ups_completed: (event?.follow_ups_completed || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', eventId)
      .eq('user_id', userId);

    return { success: true };
  }

  async getNetworkingStats(userId: string) {
    const supabase = this.supabaseService.getClient();
    
    const { data: events, error } = await supabase
      .from('networking_events')
      .select('*');

    if (error) throw error;

    const stats = {
      totalEvents: events?.length || 0,
      upcomingEvents: 0,
      pastEvents: 0,
      totalConnections: 0,
      averageConnectionsPerEvent: 0,
      totalFollowUps: 0,
      followUpRate: 0,
      averageROI: 0,
      byEventType: {} as Record<string, number>,
      byIndustry: {} as Record<string, number>,
    };

    const now = new Date().toISOString();
    
    events?.forEach(event => {
      if (event.event_date >= now) {
        stats.upcomingEvents++;
      } else {
        stats.pastEvents++;
      }
      
      stats.totalConnections += event.actual_connections_made || 0;
      stats.totalFollowUps += event.follow_ups_completed || 0;
      
      if (event.roi_rating) {
        stats.averageROI += event.roi_rating;
      }
      
      if (event.event_type) {
        stats.byEventType[event.event_type] = (stats.byEventType[event.event_type] || 0) + 1;
      }
      
      if (event.industry) {
        stats.byIndustry[event.industry] = (stats.byIndustry[event.industry] || 0) + 1;
      }
    });

    if (stats.pastEvents > 0) {
      stats.averageConnectionsPerEvent = stats.totalConnections / stats.pastEvents;
      stats.averageROI = stats.averageROI / stats.pastEvents;
    }

    if (stats.totalConnections > 0) {
      stats.followUpRate = (stats.totalFollowUps / stats.totalConnections) * 100;
    }

    return stats;
  }

  async getUpcomingEvents(userId: string, limit: number = 10) {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('networking_events')
      .select('*')
      .gte('event_date', new Date().toISOString())
      .order('event_date', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }
}
