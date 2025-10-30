import React from 'react';
import ProfileSkills from '../components/profile/ProfileSkills';

export default function Profile() {

  return (
    <div className="space-y-10">
      {/* Profile Info */}
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>

        <form className="space-y-6 max-w-3xl">
          {/* Basic info grid — stacks on mobile, 2 cols on sm+, 3 cols on lg */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="form-label" htmlFor="firstName">First name</label>
              <input id="firstName" className="input w-full" placeholder="Ada" />
            </div>
            <div>
              <label className="form-label" htmlFor="lastName">Last name</label>
              <input id="lastName" className="input w-full" placeholder="Lovelace" />
            </div>
            <div>
              <label className="form-label" htmlFor="role">Role</label>
              <input id="role" className="input w-full" placeholder="Frontend Engineer" />
            </div>
          </div>

          {/* Contact row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label" htmlFor="email">Email</label>
              <input id="email" type="email" className="input w-full" placeholder="you@example.com" />
            </div>
            <div>
              <label className="form-label" htmlFor="phone">Phone</label>
              <input id="phone" className="input w-full" placeholder="(555) 555-5555" />
            </div>
          </div>

          {/* Bio area */}
          <div>
            <label className="form-label" htmlFor="bio">Bio</label>
            <textarea id="bio" rows={4} className="input w-full" placeholder="A short bio…" />
            <p className="form-help">This appears on your profile.</p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button className="btn btn-primary btn-md touch-target" type="submit">Save changes</button>
            <button className="btn btn-secondary btn-md touch-target" type="button">Cancel</button>
          </div>
        </form>
      </div>

      {/* New Skills Section */}
      <section className="mt-10 border-t pt-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Skills & Proficiency</h2>
        <p className="text-sm text-gray-600 mb-6">
          Add, categorize, and reorder your skills to showcase your expertise.
        </p>
        <ProfileSkills userId={userId} />
      </section>
    </div>
  );
}
