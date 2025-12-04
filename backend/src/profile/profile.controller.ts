import { Controller, Get, Put, Post, Body, Req, UnauthorizedException, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { SupabaseService } from '../supabase/supabase.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import axios from 'axios';

@Controller('profile')
export class ProfileController {
  constructor(private supabase: SupabaseService) {}

  @Get('overview')
  async getProfileOverview(@Req() req) {
    const userId = req.query.userId ? String(req.query.userId) : null;
    if (!userId) {
      return { message: 'provide userId as query param for overview' };
    }

    const client = this.supabase.getClient();

    // Fetch recent education, certifications, projects
    const [education, certifications, projects] = await Promise.all([
      client.from('education').select('*').eq('user_id', userId).order('start_date', { ascending: false }).limit(5),
      client.from('certifications').select('*').eq('user_id', userId).order('date_earned', { ascending: false }).limit(5),
      client.from('projects').select('*').eq('user_id', userId).order('start_date', { ascending: false }).limit(6),
    ]);

    // Fetch counts
    const [educationCount, certificationCount, projectCount] = await Promise.all([
      client.from('education').select('id', { count: 'exact', head: true }).eq('user_id', userId),
      client.from('certifications').select('id', { count: 'exact', head: true }).eq('user_id', userId),
      client.from('projects').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    ]);

    // Calculate completion
    const completion = await this.calculateProfileCompletion(userId);

    return {
      summary: {
        educationCount: educationCount.count ?? 0,
        certificationCount: certificationCount.count ?? 0,
        projectCount: projectCount.count ?? 0,
      },
      recent: {
        education: education.data ?? [],
        certifications: certifications.data ?? [],
        projects: projects.data ?? [],
      },
      completion,
    };
  }

  // very small heuristic for profile completion
  private async calculateProfileCompletion(userId: string) {
    const client = this.supabase.getClient();
    const totalSections = 4; // employment, skills, education, projects (approx)
    const checks: number[] = [];
    const educCount = (await client.from('education').select('id', { count: 'exact', head: true }).eq('user_id', userId)).count ?? 0;
    checks.push(educCount > 0 ? 1 : 0);
    const certCount = (await client.from('certifications').select('id', { count: 'exact', head: true }).eq('user_id', userId)).count ?? 0;
    checks.push(certCount > 0 ? 1 : 0);
    const projectCount = (await client.from('projects').select('id', { count: 'exact', head: true }).eq('user_id', userId)).count ?? 0;
    checks.push(projectCount > 0 ? 1 : 0);
    // rudimentary skill/employment detection: look for job applications as proxy
    const apps = (await client.from('job_applications').select('id', { count: 'exact', head: true }).eq('user_id', userId)).count ?? 0;
    checks.push(apps > 0 ? 1 : 0);

    const score = Math.round((checks.reduce((a, b) => a + b, 0) / totalSections) * 100);
    return { score, sections: { education: educCount, certifications: certCount, projects: projectCount, applications: apps } };
  }

  /**
   * GET /profile/me
   * Fetches the authenticated user's profile
   */
  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getMyProfile(@Req() req) {
    const userId = req.user?.userId || req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    const client = this.supabase.getClient();
    const { data, error } = await client
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      return { message: 'Failed to fetch profile', error: error.message };
    }

    return {
      firstName: data.firstname,
      lastName: data.lastname,
      email: data.email,
      phone: data.phone,
      location: data.location,
      title: data.title,
      bio: data.bio,
      linkedinUrl: data.linkedin_url,
      githubUrl: data.github_url,
      portfolioUrl: data.portfolio_url,
      profilePicture: data.profile_picture
    };
  }

  /**
   * POST /profile/upload-picture
   * Uploads a profile picture to Supabase Storage
   */
  @Post('upload-picture')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadProfilePicture(@Req() req, @UploadedFile() file: Express.Multer.File) {
    const userId = req.user?.userId || req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    if (!file) {
      return { message: 'No file provided' };
    }

    try {
      const client = this.supabase.getClient();
      const fileExt = extname(file.originalname);
      const fileName = `${userId}-${Date.now()}${fileExt}`;
      const filePath = `profile-pictures/${fileName}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await client.storage
        .from('avatars')
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: true,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return { message: 'Failed to upload image', error: uploadError.message };
      }

      // Get public URL
      const { data: urlData } = client.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      // Update user profile with new image URL
      const { error: updateError } = await client
        .from('users')
        .update({ profile_picture: publicUrl })
        .eq('id', userId);

      if (updateError) {
        console.error('Update error:', updateError);
        return { message: 'Failed to update profile', error: updateError.message };
      }

      return { message: 'Profile picture uploaded successfully', url: publicUrl };
    } catch (error) {
      console.error('Upload failed:', error);
      return { message: 'Failed to upload profile picture', error: error.message };
    }
  }

  /**
   * PUT /profile
   * Updates the user's profile
   */
  @Put()
  @UseGuards(AuthGuard('jwt'))
  async updateProfile(@Req() req, @Body() body) {
    const userId = req.user?.userId || req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    console.log('Updating profile for userId:', userId);
    console.log('Request body:', body);

    const {
      firstName,
      lastName,
      email,
      phone,
      location,
      title,
      bio,
      linkedinUrl,
      githubUrl,
      portfolioUrl
    } = body;

    const client = this.supabase.getClient();
    const updateFields: any = {};

    if (firstName !== undefined) updateFields.firstname = firstName;
    if (lastName !== undefined) updateFields.lastname = lastName;
    if (email !== undefined) updateFields.email = email;
    if (phone !== undefined) updateFields.phone = phone;
    if (location !== undefined) updateFields.location = location;
    if (title !== undefined) updateFields.title = title;
    if (bio !== undefined) updateFields.bio = bio;
    if (linkedinUrl !== undefined) updateFields.linkedin_url = linkedinUrl;
    if (githubUrl !== undefined) updateFields.github_url = githubUrl;
    if (portfolioUrl !== undefined) updateFields.portfolio_url = portfolioUrl;
    
    // Profile picture is handled separately via upload endpoint
    if (body.profilePicture !== undefined) updateFields.profile_picture = body.profilePicture;

    console.log('Update fields:', updateFields);

    if (Object.keys(updateFields).length === 0) {
      return { message: 'No profile fields provided' };
    }

    const { data, error } = await client
      .from('users')
      .update(updateFields)
      .eq('id', userId)
      .select();

    console.log('Supabase update result:', { data, error });

    if (error) {
      console.error('Supabase error:', error);
      return { message: 'Failed to update profile', error: error.message };
    }

    return { message: 'Profile updated successfully', data };
  }

  /**
   * POST /profile/import-linkedin
   * Imports profile data from LinkedIn URL
   */
  @Post('import-linkedin')
  @UseGuards(AuthGuard('jwt'))
  async importFromLinkedIn(@Req() req, @Body() body: { linkedinUrl: string }) {
    const userId = req.user?.userId || req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    const { linkedinUrl } = body;
    if (!linkedinUrl || !linkedinUrl.includes('linkedin.com')) {
      return { message: 'Invalid LinkedIn URL provided', success: false };
    }

    try {
      console.log('Importing LinkedIn profile from:', linkedinUrl);
      
      // Extract username from LinkedIn URL
      const usernameMatch = linkedinUrl.match(/linkedin\.com\/in\/([^\/\?]+)/);
      if (!usernameMatch) {
        return { message: 'Could not extract LinkedIn username from URL', success: false };
      }

      const username = usernameMatch[1];
      
      // Use SERP API to search for the LinkedIn profile
      const apiKey = process.env.SERP_API_KEY;
      if (!apiKey) {
        console.error('SERP_API_KEY not configured');
        return { message: 'LinkedIn import service not configured', success: false };
      }

      // Try to use LinkedIn Profile API if available
      // First attempt: Use SERP API's LinkedIn Profile scraper
      let profileData = null;
      
      try {
        // Try LinkedIn profile scraper endpoint
        const linkedinParams = {
          api_key: apiKey,
          engine: 'google',
          q: `site:linkedin.com/in/${username}`,
          num: 1,
        };

        const response = await axios.get('https://serpapi.com/search', { params: linkedinParams });
        const results = response.data?.organic_results || [];

        if (results.length === 0) {
          return { message: 'Could not find LinkedIn profile data', success: false };
        }

        profileData = results[0];
        
        // Check if we have rich_snippet with more detailed info
        if (profileData.rich_snippet) {
          console.log('Rich snippet found:', profileData.rich_snippet);
        }
        
        // Check for sitelinks (additional profile sections)
        if (profileData.sitelinks) {
          console.log('Sitelinks found:', profileData.sitelinks);
        }
      } catch (error) {
        console.error('Error fetching LinkedIn data:', error);
        return { message: 'Failed to fetch LinkedIn profile', success: false };
      }
      
      // Extract available data from search result
      let snippet = profileData.snippet || '';
      const title = profileData.title || '';
      
      // Try to get extended content from sitelinks or rich_snippet
      if (profileData.sitelinks?.inline) {
        const aboutLink = profileData.sitelinks.inline.find(link => 
          link.title?.toLowerCase().includes('about') || 
          link.title?.toLowerCase().includes('summary')
        );
        if (aboutLink?.snippet) {
          snippet = aboutLink.snippet + ' ' + snippet;
        }
      }
      
      // Check rich snippet for additional bio content
      if (profileData.rich_snippet?.top?.detected_extensions) {
        const extensions = profileData.rich_snippet.top.detected_extensions;
        if (typeof extensions === 'string' && extensions.length > snippet.length) {
          snippet = extensions;
        }
      }
      
      console.log('Raw title:', title);
      console.log('Raw snippet:', snippet);
      console.log('Full profile data:', JSON.stringify(profileData, null, 2));
      
      // Parse name from title (usually in format "Name - Title - LinkedIn")
      let firstName = '';
      let lastName = '';
      let jobTitle = '';
      let location = '';
      let bio = '';

      // Try to extract name from title
      const titleParts = title.split(' - ');
      if (titleParts.length > 0) {
        const nameParts = titleParts[0].trim().split(' ');
        if (nameParts.length >= 2) {
          firstName = nameParts[0];
          lastName = nameParts.slice(1).join(' ');
        } else if (nameParts.length === 1) {
          firstName = nameParts[0];
        }
      }

      // Extract full job title from title (everything between name and "LinkedIn")
      if (titleParts.length > 1) {
        // Join all middle parts (between name and "LinkedIn")
        const titleEndIndex = titleParts.findIndex(part => part.toLowerCase().includes('linkedin'));
        if (titleEndIndex > 1) {
          jobTitle = titleParts.slice(1, titleEndIndex).join(' - ').trim();
        } else if (titleParts.length > 1) {
          jobTitle = titleParts[1].trim();
        }
      }

      // Extract full snippet as bio, removing location markers
      // First, try to separate location from bio
      const snippetParts = snippet.split('·').map(s => s.trim()).filter(s => s.length > 0);
      
      const locationKeywords = /\b(United States|Canada|UK|United Kingdom|India|Australia|Germany|France|Spain|Italy|Netherlands|Sweden|Norway|Denmark|Finland|Ireland|New Zealand|Singapore|Hong Kong|Japan|South Korea|China|Brazil|Mexico|Argentina|Chile|Colombia|Peru|South Africa|Kenya|Nigeria|Egypt|Israel|UAE|Saudi Arabia|Turkey|Poland|Czech Republic|Austria|Switzerland|Belgium|Portugal|Greece|Romania|Hungary|Bulgaria|Croatia|Serbia|Slovenia|Slovakia|New York|California|Texas|Florida|Illinois|Pennsylvania|Ohio|Georgia|North Carolina|Michigan|New Jersey|Virginia|Washington|Arizona|Massachusetts|Tennessee|Indiana|Missouri|Maryland|Wisconsin|Colorado|Minnesota|South Carolina|Alabama|Louisiana|Kentucky|Oregon|Oklahoma|Connecticut|Utah|Iowa|Nevada|Arkansas|Mississippi|Kansas|New Mexico|Nebraska|West Virginia|Idaho|Hawaii|New Hampshire|Maine|Montana|Rhode Island|Delaware|South Dakota|North Dakota|Alaska|Vermont|Wyoming|DC|District of Columbia|London|Manchester|Birmingham|Liverpool|Glasgow|Edinburgh|Bristol|Leeds|Sheffield|Toronto|Montreal|Vancouver|Calgary|Ottawa|Edmonton|Winnipeg|Sydney|Melbourne|Brisbane|Perth|Adelaide|Auckland|Wellington|Christchurch|Dublin|Cork|Berlin|Munich|Hamburg|Frankfurt|Cologne|Stuttgart|Paris|Marseille|Lyon|Toulouse|Nice|Madrid|Barcelona|Valencia|Seville|Rome|Milan|Naples|Turin|Florence|Amsterdam|Rotterdam|The Hague|Utrecht|Stockholm|Gothenburg|Copenhagen|Oslo|Helsinki|Vienna|Zurich|Geneva|Brussels|Lisbon|Porto|Athens|Warsaw|Prague|Budapest|Bucharest|Sofia|Zagreb|Belgrade|Dublin|Bangalore|Mumbai|Delhi|Hyderabad|Chennai|Kolkata|Pune|Ahmedabad|Tokyo|Osaka|Kyoto|Shanghai|Beijing|Shenzhen|Guangzhou|São Paulo|Rio de Janeiro|Mexico City|Buenos Aires|Santiago|Bogotá|Lima|Johannesburg|Cape Town|Cairo|Tel Aviv|Jerusalem|Dubai|Abu Dhabi|Riyadh|Istanbul|Ankara)\b/i;
      
      snippetParts.forEach(part => {
        if (locationKeywords.test(part) && !location) {
          location = part;
        }
      });

      // Use entire snippet as bio (removing the location part if found)
      bio = snippet;
      if (location) {
        // Remove location from bio
        bio = bio.replace(location, '').replace(/\s*·\s*$/, '').replace(/^\s*·\s*/, '').trim();
      }
      
      // Clean up bio - remove excessive dots/bullets
      bio = bio.replace(/\s*·\s*/g, '. ').replace(/\.\s*\./g, '.').trim();
      if (bio && !bio.endsWith('.')) {
        bio += '.';
      }

      const extractedData = {
        firstName,
        lastName,
        title: jobTitle,
        location,
        bio,
        linkedinUrl,
      };

      console.log('Extracted LinkedIn data:', extractedData);

      return {
        success: true,
        message: 'LinkedIn profile data extracted successfully',
        data: extractedData,
      };

    } catch (error) {
      console.error('Failed to import LinkedIn profile:', error);
      return {
        success: false,
        message: 'Failed to import LinkedIn profile',
        error: error.message,
      };
    }
  }
}
