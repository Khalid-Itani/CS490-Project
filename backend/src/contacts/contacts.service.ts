import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class ContactsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async createContact(userId: string, contactData: any) {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('network_contacts')
      .insert({
        user_id: userId,
        contact_name: contactData.name,
        email_address: contactData.email,
        phone_number: contactData.phone,
        company: contactData.company,
        job_title: contactData.jobTitle,
        industry: contactData.industry,
        connection_source: contactData.connectionSource || 'manual',
        relationship_strength: contactData.relationshipStrength || 3,
        first_contact_date: contactData.firstContactDate || new Date().toISOString(),
        last_interaction_date: contactData.lastInteractionDate || new Date().toISOString(),
        total_interactions: contactData.totalInteractions || 0,
        referrals_given: contactData.referralsGiven || 0,
        referrals_received: contactData.referralsReceived || 0,
        job_opportunities_sourced: contactData.jobOpportunitiesSourced || 0,
        value_provided_score: contactData.valueProvidedScore || 0,
        value_received_score: contactData.valueReceivedScore || 0,
        notes: contactData.notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getContacts(userId: string, filters?: any) {
    const supabase = this.supabaseService.getClient();
    
    let query = supabase
      .from('network_contacts')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (filters?.industry) {
      query = query.eq('industry', filters.industry);
    }
    if (filters?.company) {
      query = query.ilike('company', `%${filters.company}%`);
    }
    if (filters?.search) {
      query = query.or(`contact_name.ilike.%${filters.search}%,company.ilike.%${filters.search}%,job_title.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getContactById(userId: string, contactId: string) {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('network_contacts')
      .select('*')
      .eq('id', contactId)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  async updateContact(userId: string, contactId: string, updates: any) {
    const supabase = this.supabaseService.getClient();
    
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };
    
    if (updates.name) updateData.contact_name = updates.name;
    if (updates.email) updateData.email_address = updates.email;
    if (updates.phone) updateData.phone_number = updates.phone;
    if (updates.company) updateData.company = updates.company;
    if (updates.jobTitle) updateData.job_title = updates.jobTitle;
    if (updates.industry) updateData.industry = updates.industry;
    if (updates.connectionSource) updateData.connection_source = updates.connectionSource;
    if (updates.relationshipStrength !== undefined) updateData.relationship_strength = updates.relationshipStrength;
    if (updates.lastInteractionDate) updateData.last_interaction_date = updates.lastInteractionDate;
    if (updates.totalInteractions !== undefined) updateData.total_interactions = updates.totalInteractions;
    if (updates.referralsGiven !== undefined) updateData.referrals_given = updates.referralsGiven;
    if (updates.referralsReceived !== undefined) updateData.referrals_received = updates.referralsReceived;
    if (updates.jobOpportunitiesSourced !== undefined) updateData.job_opportunities_sourced = updates.jobOpportunitiesSourced;
    if (updates.valueProvidedScore !== undefined) updateData.value_provided_score = updates.valueProvidedScore;
    if (updates.valueReceivedScore !== undefined) updateData.value_received_score = updates.valueReceivedScore;
    if (updates.notes) updateData.notes = updates.notes;
    
    const { data, error } = await supabase
      .from('network_contacts')
      .update(updateData)
      .eq('id', contactId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteContact(userId: string, contactId: string) {
    const supabase = this.supabaseService.getClient();
    
    const { error } = await supabase
      .from('network_contacts')
      .delete()
      .eq('id', contactId)
      .eq('user_id', userId);

    if (error) throw error;
    return { success: true };
  }

  async addInteraction(userId: string, contactId: string, interactionData: any) {
    const supabase = this.supabaseService.getClient();
    
    // Get current contact to increment total_interactions
    const { data: contact } = await supabase
      .from('network_contacts')
      .select('total_interactions')
      .eq('id', contactId)
      .eq('user_id', userId)
      .single();

    // Update last interaction date and increment total interactions
    const { error } = await supabase
      .from('network_contacts')
      .update({
        last_interaction_date: interactionData.date || new Date().toISOString(),
        total_interactions: (contact?.total_interactions || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', contactId)
      .eq('user_id', userId);

    if (error) throw error;

    return { 
      success: true, 
      interaction_date: interactionData.date || new Date().toISOString(),
      total_interactions: (contact?.total_interactions || 0) + 1
    };
  }

  async getInteractionHistory(userId: string, contactId: string) {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('network_contacts')
      .select('last_interaction_date, total_interactions')
      .eq('id', contactId)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    
    return {
      last_interaction_date: data?.last_interaction_date,
      total_interactions: data?.total_interactions || 0
    };
  }

  async linkContactToJob(userId: string, contactId: string, jobId: string) {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('contact_job_links')
      .insert({
        user_id: userId,
        contact_id: contactId,
        job_id: jobId,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getContactsByJob(userId: string, jobId: string) {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('contact_job_links')
      .select(`
        *,
        professional_contacts (*)
      `)
      .eq('user_id', userId)
      .eq('job_id', jobId);

    if (error) throw error;
    return data?.map(link => link.professional_contacts) || [];
  }

  async setReminder(userId: string, contactId: string, reminderData: any) {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('contact_reminders')
      .insert({
        user_id: userId,
        contact_id: contactId,
        reminder_date: reminderData.date,
        reminder_type: reminderData.type,
        notes: reminderData.notes,
        completed: false,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getUpcomingReminders(userId: string) {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('contact_reminders')
      .select(`
        *,
        professional_contacts (name, company, job_title)
      `)
      .eq('user_id', userId)
      .eq('completed', false)
      .gte('reminder_date', new Date().toISOString())
      .order('reminder_date', { ascending: true })
      .limit(20);

    if (error) throw error;
    return data || [];
  }

  async importFromGoogle(userId: string, contacts: any[]) {
    const supabase = this.supabaseService.getClient();
    
    const formattedContacts = contacts.map(contact => ({
      user_id: userId,
      name: contact.names?.[0]?.displayName || '',
      email: contact.emailAddresses?.[0]?.value || '',
      phone: contact.phoneNumbers?.[0]?.value || '',
      company: contact.organizations?.[0]?.name || '',
      job_title: contact.organizations?.[0]?.title || '',
      relationship_type: 'professional',
      relationship_strength: 3,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase
      .from('professional_contacts')
      .insert(formattedContacts)
      .select();

    if (error) throw error;
    return data;
  }

  async getNetworkingOpportunities(userId: string) {
    const supabase = this.supabaseService.getClient();
    
    // Get contacts that haven't been contacted recently
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const { data, error } = await supabase
      .from('network_contacts')
      .select('*')
      .eq('user_id', userId)
      .lt('last_interaction_date', threeMonthsAgo.toISOString())
      .order('relationship_strength', { ascending: false })
      .limit(10);

    if (error) throw error;
    return data || [];
  }

  async getContactStats(userId: string) {
    const supabase = this.supabaseService.getClient();
    
    const { data: contacts, error } = await supabase
      .from('network_contacts')
      .select('industry, relationship_strength, total_interactions, referrals_given, referrals_received, job_opportunities_sourced')
      .eq('user_id', userId);

    if (error) throw error;

    const stats = {
      total: contacts?.length || 0,
      byIndustry: {} as Record<string, number>,
      averageStrength: 0,
      totalInteractions: 0,
      totalReferralsGiven: 0,
      totalReferralsReceived: 0,
      totalJobOpportunities: 0,
    };

    contacts?.forEach(contact => {
      if (contact.industry) {
        stats.byIndustry[contact.industry] = (stats.byIndustry[contact.industry] || 0) + 1;
      }
      stats.totalInteractions += contact.total_interactions || 0;
      stats.totalReferralsGiven += contact.referrals_given || 0;
      stats.totalReferralsReceived += contact.referrals_received || 0;
      stats.totalJobOpportunities += contact.job_opportunities_sourced || 0;
    });

    const totalStrength = contacts?.reduce((sum, c) => sum + (c.relationship_strength || 0), 0) || 0;
    stats.averageStrength = contacts?.length ? totalStrength / contacts.length : 0;

    return stats;
  }
}
