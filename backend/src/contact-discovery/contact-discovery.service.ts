import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

interface SerpResult {
  position: number;
  title: string;
  link: string;
  displayed_link?: string;
  snippet?: string;
  snippet_highlighted_words?: string[];
  source?: string;
}

interface SerpApiResponse {
  search_metadata?: {
    status?: string;
  };
  organic_results?: SerpResult[];
  error?: string;
}

export interface DiscoveredContact {
  id?: string;
  user_id: string;
  name: string;
  title: string;
  company: string;
  linkedin_url: string;
  snippet?: string;
  search_query?: string;
  is_saved: boolean;
  created_at?: string;
}

@Injectable()
export class ContactDiscoveryService {
  private readonly serpApiKey: string;
  private readonly serpApiUrl = 'https://serpapi.com/search.json';

  constructor(private readonly supabase: SupabaseService) {
    this.serpApiKey = process.env.SERP_API_KEY || '';
  }

  /**
   * Search for professionals using SERP API
   */
  async searchProfessionals(
    role: string,
    industry?: string,
    location?: string,
    limit: number = 10,
  ): Promise<DiscoveredContact[]> {
    if (!this.serpApiKey) {
      throw new Error('SERP_API_KEY is not configured');
    }

    // Build search query
    let query = `site:linkedin.com/in/ "${role}"`;
    if (industry) {
      query += ` "${industry}"`;
    }
    if (location) {
      query += ` "${location}"`;
    }

    // Make SERP API request
    const url = new URL(this.serpApiUrl);
    url.searchParams.append('q', query);
    url.searchParams.append('api_key', this.serpApiKey);
    url.searchParams.append('num', limit.toString());
    url.searchParams.append('engine', 'google');

    try {
      const response = await fetch(url.toString());
      const data: SerpApiResponse = await response.json();

      if (data.error) {
        throw new Error(`SERP API error: ${data.error}`);
      }

      if (!data.organic_results || data.organic_results.length === 0) {
        return [];
      }

      // Parse results and extract contact information
      const contacts: DiscoveredContact[] = [];
      
      for (const result of data.organic_results) {
        if (!result.link.includes('linkedin.com/in/')) continue;

        const contact = this.parseLinkedInResult(result, query);
        if (contact) {
          contacts.push(contact as DiscoveredContact);
        }
      }

      return contacts;
    } catch (error) {
      console.error('SERP API search failed:', error);
      throw new Error('Failed to search for professionals');
    }
  }

  /**
   * Parse LinkedIn search result into contact object
   */
  private parseLinkedInResult(
    result: SerpResult,
    searchQuery: string,
  ): Partial<DiscoveredContact> | null {
    try {
      // Extract name from title (usually "Name - Title - Company | LinkedIn")
      const titleParts = result.title.split(/[-|]/);
      const name = titleParts[0]?.trim() || 'Unknown';
      
      // Try to extract title and company
      let title = 'Professional';
      let company = 'Unknown Company';
      
      if (titleParts.length >= 2) {
        title = titleParts[1]?.trim() || title;
      }
      
      if (titleParts.length >= 3) {
        company = titleParts[2]?.replace('| LinkedIn', '').trim() || company;
      }

      // Alternative: try to extract from snippet
      if (result.snippet) {
        const snippetMatch = result.snippet.match(/(.+?)\s+at\s+(.+?)[\.\,]/);
        if (snippetMatch) {
          if (title === 'Professional') title = snippetMatch[1].trim();
          if (company === 'Unknown Company') company = snippetMatch[2].trim();
        }
      }

      return {
        name,
        title,
        company,
        linkedin_url: result.link,
        snippet: result.snippet || '',
        search_query: searchQuery,
        is_saved: false,
      };
    } catch (error) {
      console.error('Failed to parse LinkedIn result:', error);
      return null;
    }
  }

  /**
   * Save a discovered contact to the database
   */
  async saveDiscoveredContact(
    userId: string,
    contactData: Partial<DiscoveredContact>,
  ): Promise<DiscoveredContact> {
    const client = this.supabase.getClient();

    // Check if already exists
    const { data: existing } = await client
      .from('discovered_contacts')
      .select('*')
      .eq('user_id', userId)
      .eq('linkedin_url', contactData.linkedin_url)
      .single();

    if (existing) {
      // Update is_saved flag
      const { data: updated, error } = await client
        .from('discovered_contacts')
        .update({ is_saved: true, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return updated;
    }

    // Insert new contact
    const { data, error } = await client
      .from('discovered_contacts')
      .insert({
        user_id: userId,
        name: contactData.name,
        title: contactData.title,
        company: contactData.company,
        linkedin_url: contactData.linkedin_url,
        snippet: contactData.snippet,
        search_query: contactData.search_query,
        is_saved: true,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Add discovered contact to user's network_contacts
   */
  async addToNetwork(
    userId: string,
    discoveredContactId: string,
  ): Promise<any> {
    const client = this.supabase.getClient();

    // Get the discovered contact
    const { data: discovered, error: fetchError } = await client
      .from('discovered_contacts')
      .select('*')
      .eq('id', discoveredContactId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !discovered) {
      throw new Error('Discovered contact not found');
    }

    // Check if already in network
    const { data: existing } = await client
      .from('network_contacts')
      .select('id')
      .eq('user_id', userId)
      .eq('linkedin_url', discovered.linkedin_url)
      .single();

    if (existing) {
      throw new Error('Contact already exists in your network');
    }

    // Add to network_contacts
    const { data: networkContact, error: insertError } = await client
      .from('network_contacts')
      .insert({
        user_id: userId,
        contact_name: discovered.name,
        job_title: discovered.title,
        company: discovered.company,
        linkedin_url: discovered.linkedin_url,
        relationship_type: 'prospect',
        notes: `Discovered via search: ${discovered.search_query || 'N/A'}`,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Mark as added to network
    await client
      .from('discovered_contacts')
      .update({ is_saved: true })
      .eq('id', discoveredContactId);

    return networkContact;
  }

  /**
   * Get saved discovered contacts for a user
   */
  async getSavedContacts(userId: string): Promise<DiscoveredContact[]> {
    const client = this.supabase.getClient();

    const { data, error } = await client
      .from('discovered_contacts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_saved', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Delete a discovered contact
   */
  async deleteDiscoveredContact(
    userId: string,
    contactId: string,
  ): Promise<void> {
    const client = this.supabase.getClient();

    const { error } = await client
      .from('discovered_contacts')
      .delete()
      .eq('id', contactId)
      .eq('user_id', userId);

    if (error) throw error;
  }

  /**
   * Get search suggestions based on popular roles
   */
  getSuggestedSearches(): Array<{ role: string; industry?: string }> {
    return [
      { role: 'Chief Technology Officer', industry: 'Technology' },
      { role: 'Engineering Manager', industry: 'Software' },
      { role: 'Product Manager', industry: 'Tech' },
      { role: 'Chief Executive Officer', industry: 'Startup' },
      { role: 'Venture Capital Partner', industry: 'Finance' },
      { role: 'Head of Engineering', industry: 'AI' },
      { role: 'Director of Product', industry: 'SaaS' },
      { role: 'VP of Engineering', industry: 'Cloud' },
      { role: 'Chief Marketing Officer', industry: 'Digital Marketing' },
      { role: 'Data Science Lead', industry: 'Machine Learning' },
    ];
  }
}
