import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class InformationalInterviewsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async createInterview(userId: string, interviewData: any) {
    const supabase = this.supabaseService.getClient();
    
    // Get contact from network_contacts and ensure it exists in professional_contacts
    let contactIdToUse = null;
    if (interviewData.contactId) {
      const { data: networkContact } = await supabase
        .from('network_contacts')
        .select('*')
        .eq('id', interviewData.contactId)
        .single();
      
      if (networkContact) {
        // Check if already exists in professional_contacts
        const { data: existingProf } = await supabase
          .from('professional_contacts')
          .select('id')
          .eq('id', networkContact.id)
          .single();
        
        if (!existingProf) {
          // Copy to professional_contacts with same ID to satisfy FK
          await supabase
            .from('professional_contacts')
            .insert({
              id: networkContact.id,
              user_id: userId,
              name: networkContact.contact_name,
              email: networkContact.email_address,
              phone: networkContact.phone_number,
              company: networkContact.company,
              job_title: networkContact.job_title,
              relationship_strength: networkContact.relationship_strength || 3,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
        }
        contactIdToUse = networkContact.id;
      }
    }
    
    // Insert using only actual columns in informational_interviews table
    const { data, error } = await supabase
      .from('informational_interviews')
      .insert({
        user_id: userId,
        contact_id: contactIdToUse,
        request_status: interviewData.requestStatus || 'requested',
        scheduled_time: interviewData.scheduledTime || null,
        prep_notes: interviewData.prepNotes || null,
        outcome_notes: interviewData.outcomeNotes || null,
      })
      .select(`
        *,
        professional_contacts (
          id,
          name,
          job_title,
          company,
          email,
          phone
        )
      `)
      .single();

    if (error) throw error;
    return data;
  }

  async getInterviews(userId: string, filters?: any) {
    const supabase = this.supabaseService.getClient();
    
    let query = supabase
      .from('informational_interviews')
      .select(`
        *,
        professional_contacts (
          id,
          name,
          job_title,
          company,
          email,
          phone
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (filters?.requestStatus) {
      query = query.eq('request_status', filters.requestStatus);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getInterviewById(userId: string, interviewId: string) {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('informational_interviews')
      .select(`
        *,
        professional_contacts (
          id,
          name,
          job_title,
          company,
          email,
          phone
        )
      `)
      .eq('id', interviewId)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  async updateInterview(userId: string, interviewId: string, updates: any) {
    const supabase = this.supabaseService.getClient();
    
    // Check ownership
    const { data: interview } = await supabase
      .from('informational_interviews')
      .select('user_id')
      .eq('id', interviewId)
      .single();

    if (!interview || interview.user_id !== userId) {
      throw new Error('You can only edit interviews you created');
    }
    
    const updateData: any = { updated_at: new Date().toISOString() };
    
    if (updates.contactId) updateData.contact_id = updates.contactId;
    if (updates.requestStatus) updateData.request_status = updates.requestStatus;
    if (updates.scheduledTime !== undefined) updateData.scheduled_time = updates.scheduledTime;
    if (updates.prepNotes !== undefined) updateData.prep_notes = updates.prepNotes;
    if (updates.outcomeNotes !== undefined) updateData.outcome_notes = updates.outcomeNotes;
    
    const { data, error } = await supabase
      .from('informational_interviews')
      .update(updateData)
      .eq('id', interviewId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteInterview(userId: string, interviewId: string) {
    const supabase = this.supabaseService.getClient();
    
    const { error } = await supabase
      .from('informational_interviews')
      .delete()
      .eq('id', interviewId)
      .eq('user_id', userId);

    if (error) throw error;
    return { success: true };
  }

  async getInterviewStats(userId: string) {
    const supabase = this.supabaseService.getClient();
    
    const { data: interviews, error } = await supabase
      .from('informational_interviews')
      .select(`
        *,
        professional_contacts (company)
      `)
      .eq('user_id', userId);

    if (error) throw error;

    const stats = {
      total: interviews?.length || 0,
      requested: 0,
      scheduled: 0,
      completed: 0,
      declined: 0,
      byCompany: {} as Record<string, number>,
    };

    interviews?.forEach(interview => {
      switch (interview.request_status) {
        case 'requested':
          stats.requested++;
          break;
        case 'scheduled':
          stats.scheduled++;
          break;
        case 'completed':
          stats.completed++;
          break;
        case 'declined':
          stats.declined++;
          break;
      }

      const company = interview.professional_contacts?.company;
      if (company) {
        stats.byCompany[company] = (stats.byCompany[company] || 0) + 1;
      }
    });

    return stats;
  }

  async getNetworkContacts(userId: string) {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('network_contacts')
      .select('*')
      .eq('user_id', userId)
      .order('contact_name', { ascending: true });

    if (error) throw error;
    
    // Map to consistent format
    return data?.map(contact => ({
      ...contact,
      name: contact.contact_name,
    })) || [];
  }

  async getSuggestedContacts(userId: string) {
    const supabase = this.supabaseService.getClient();
    
    // Get contacts not yet interviewed
    const { data: existingInterviews } = await supabase
      .from('informational_interviews')
      .select('contact_id')
      .eq('user_id', userId);

    const interviewedIds = existingInterviews?.map(i => i.contact_id).filter(Boolean) || [];

    let query = supabase
      .from('network_contacts')
      .select('*')
      .eq('user_id', userId);

    if (interviewedIds.length > 0) {
      query = query.not('id', 'in', `(${interviewedIds.join(',')})`);
    }

    const { data, error } = await query.limit(10);
    
    if (error) throw error;
    
    return data?.map(contact => ({
      ...contact,
      name: contact.contact_name,
    })) || [];
  }
}
