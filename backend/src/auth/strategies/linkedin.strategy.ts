import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
// @ts-ignore types are not always available for this package in TS projects
import { Strategy } from 'passport-linkedin-oauth2';

@Injectable()
export class LinkedInStrategy extends PassportStrategy(Strategy, 'linkedin') {
  constructor() {
    const clientID = process.env.LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    const callbackURL = process.env.LINKEDIN_CALLBACK_URL || 'http://localhost:3000/auth/linkedin/callback';

    super({
      clientID: clientID || 'missing-client-id',
      clientSecret: clientSecret || 'missing-client-secret',
      callbackURL,
      scope: ['r_liteprofile', 'r_emailaddress'],
      state: true,
    });
  }

  // LinkedIn returns profile with id, displayName, emails, name, etc.
  async validate(_accessToken: string, _refreshToken: string, profile: any, done: Function) {
    const email = profile.emails?.[0]?.value;
    const firstname = profile.name?.givenName || profile.displayName?.split(' ')?.[0];
    const lastname = profile.name?.familyName || profile.displayName?.split(' ')?.slice(1).join(' ');
    const user = { email, firstname, lastname };
    done(null, user);
  }
}
