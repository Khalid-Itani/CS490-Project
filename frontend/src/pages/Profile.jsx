import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from '../components/ui/Card';
import { Icon } from '../components/ui/Icon';

const API = import.meta?.env?.VITE_API_URL || 'http://localhost:3000';

export default function Profile() {
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    title: '',
    bio: '',
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
    profilePicture: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [importing, setImporting] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [linkedinUrlInput, setLinkedinUrlInput] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showMessage('Please log in to view your profile', 'error');
        setLoading(false);
        return;
      }

      console.log('Fetching profile with token:', token?.substring(0, 20) + '...');
      const response = await axios.get(`${API}/profile/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Profile response:', response.data);
      
      if (response.data) {
        setProfile({
          firstName: response.data.firstName || '',
          lastName: response.data.lastName || '',
          email: response.data.email || '',
          phone: response.data.phone || '',
          location: response.data.location || '',
          title: response.data.title || '',
          bio: response.data.bio || '',
          linkedinUrl: response.data.linkedinUrl || '',
          githubUrl: response.data.githubUrl || '',
          portfolioUrl: response.data.portfolioUrl || '',
          profilePicture: response.data.profilePicture || ''
        });
        setPreviewUrl(response.data.profilePicture || null);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      if (error.response?.status === 401) {
        showMessage('Session expired. Please log in again.', 'error');
      } else {
        showMessage(error.response?.data?.message || 'Failed to load profile', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      console.log('Saving profile data:', profile);
      
      const response = await axios.put(`${API}/profile`, profile, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Save response:', response.data);
      showMessage('Profile updated successfully!', 'success');
      setIsEditing(false);
      // Refresh the profile data to show updated values
      await fetchProfile();
    } catch (error) {
      console.error('Error saving profile:', error);
      console.error('Error details:', error.response?.data);
      showMessage(error.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setPreviewUrl(profile.profilePicture || null);
    fetchProfile(); // Reset to original data
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showMessage('Please select an image file', 'error');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showMessage('Image must be less than 5MB', 'error');
      return;
    }

    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API}/profile/upload-picture`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.url) {
        setProfile({ ...profile, profilePicture: response.data.url });
        setPreviewUrl(response.data.url);
        showMessage('Profile picture uploaded successfully', 'success');
        
        // Trigger a custom event to update navbar avatar
        window.dispatchEvent(new CustomEvent('profilePictureUpdated', { 
          detail: { url: response.data.url } 
        }));
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      showMessage(error.response?.data?.message || 'Failed to upload image', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setProfile({ ...profile, profilePicture: '' });
    setPreviewUrl(null);
  };

  const handleImportFromLinkedIn = async () => {
    if (!linkedinUrlInput || !linkedinUrlInput.includes('linkedin.com')) {
      showMessage('Please enter a valid LinkedIn URL', 'error');
      return;
    }

    setImporting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API}/profile/import-linkedin`,
        { linkedinUrl: linkedinUrlInput },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success && response.data.data) {
        const importedData = response.data.data;
        
        // Populate form with imported data, but don't overwrite existing data unless it's empty
        setProfile(prev => ({
          ...prev,
          firstName: importedData.firstName || prev.firstName,
          lastName: importedData.lastName || prev.lastName,
          title: importedData.title || prev.title,
          location: importedData.location || prev.location,
          bio: importedData.bio || prev.bio,
          linkedinUrl: importedData.linkedinUrl || prev.linkedinUrl,
        }));

        showMessage('LinkedIn profile imported successfully!', 'success');
        setShowImportModal(false);
        setLinkedinUrlInput('');
      } else {
        showMessage(response.data.message || 'Failed to import LinkedIn profile', 'error');
      }
    } catch (error) {
      console.error('Error importing LinkedIn profile:', error);
      showMessage(error.response?.data?.message || 'Failed to import LinkedIn profile', 'error');
    } finally {
      setImporting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Toast notification */}
      {message && (
        <div
          className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white z-50 ${
            message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Page header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? 'Edit Profile' : 'My Profile'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditing 
              ? 'Update your personal and professional information'
              : 'View your profile information'
            }
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isEditing && (
            <button
              type="button"
              onClick={() => setShowImportModal(true)}
              className="px-4 py-2 rounded-lg bg-blue-100 text-blue-700 font-medium hover:bg-blue-200 transition flex items-center gap-2"
            >
              <Icon name="download" />
              Import from LinkedIn
            </button>
          )}
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition flex items-center gap-2"
            >
              <Icon name="edit" />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSave}>
        {/* Profile Picture */}
        <Card className="mb-6">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Icon name="user" />
              Profile Picture
            </h2>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-200">
                    <Icon name="user" size="xl" className="text-gray-400" />
                  </div>
                )}
                {isEditing && previewUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    title="Remove picture"
                  >
                    <Icon name="close" size="sm" />
                  </button>
                )}
              </div>
              
              {isEditing && (
                <div className="flex-1">
                  <label className="block">
                    <span className="sr-only">Choose profile photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-lg file:border-0
                        file:text-sm file:font-medium
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100
                        cursor-pointer"
                      disabled={uploading}
                    />
                  </label>
                  <p className="text-sm text-gray-500 mt-2">
                    JPG, PNG or GIF. Max size 5MB.
                  </p>
                  {uploading && (
                    <p className="text-sm text-blue-600 mt-2 flex items-center gap-2">
                      <Icon name="loading" className="animate-spin" />
                      Uploading...
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Personal Information */}
        <Card className="mb-6">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Icon name="user" />
              Personal Information
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="firstName">
                  First Name *
                </label>
                {isEditing ? (
                  <input
                    id="firstName"
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="John"
                    value={profile.firstName}
                    onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                  />
                ) : (
                  <p className="text-gray-900 py-2">{profile.firstName || '—'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="lastName">
                  Last Name *
                </label>
                {isEditing ? (
                  <input
                    id="lastName"
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Doe"
                    value={profile.lastName}
                    onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                  />
                ) : (
                  <p className="text-gray-900 py-2">{profile.lastName || '—'}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="email">
                  Email *
                </label>
                {isEditing ? (
                  <input
                    id="email"
                    type="email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="john.doe@example.com"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  />
                ) : (
                  <p className="text-gray-900 py-2">{profile.email || '—'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="phone">
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    id="phone"
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="(555) 555-5555"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  />
                ) : (
                  <p className="text-gray-900 py-2">{profile.phone || '—'}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="location">
                Location
              </label>
              {isEditing ? (
                <input
                  id="location"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="San Francisco, CA"
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                />
              ) : (
                <p className="text-gray-900 py-2">{profile.location || '—'}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Professional Information */}
        <Card className="mb-6">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Icon name="job" />
              Professional Information
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="title">
                Current Title / Role
              </label>
              {isEditing ? (
                <input
                  id="title"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Senior Software Engineer"
                  value={profile.title}
                  onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                />
              ) : (
                <p className="text-gray-900 py-2">{profile.title || '—'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="bio">
                Professional Bio
              </label>
              {isEditing ? (
                <>
                  <textarea
                    id="bio"
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Write a brief summary about your professional background, skills, and career goals..."
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    This will appear on your profile and may be used in cover letters
                  </p>
                </>
              ) : (
                <p className="text-gray-900 py-2 whitespace-pre-wrap">{profile.bio || '—'}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Social Links */}
        <Card className="mb-6">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Icon name="share" />
              Social & Professional Links
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="linkedinUrl">
                LinkedIn Profile
              </label>
              {isEditing ? (
                <input
                  id="linkedinUrl"
                  type="url"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://linkedin.com/in/yourprofile"
                  value={profile.linkedinUrl}
                  onChange={(e) => setProfile({ ...profile, linkedinUrl: e.target.value })}
                />
              ) : profile.linkedinUrl ? (
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline py-2 flex items-center gap-2"
                >
                  {profile.linkedinUrl}
                  <Icon name="external-link" size="sm" />
                </a>
              ) : (
                <p className="text-gray-900 py-2">—</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="githubUrl">
                GitHub Profile
              </label>
              {isEditing ? (
                <input
                  id="githubUrl"
                  type="url"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://github.com/yourusername"
                  value={profile.githubUrl}
                  onChange={(e) => setProfile({ ...profile, githubUrl: e.target.value })}
                />
              ) : profile.githubUrl ? (
                <a
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline py-2 flex items-center gap-2"
                >
                  {profile.githubUrl}
                  <Icon name="external-link" size="sm" />
                </a>
              ) : (
                <p className="text-gray-900 py-2">—</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="portfolioUrl">
                Portfolio / Website
              </label>
              {isEditing ? (
                <input
                  id="portfolioUrl"
                  type="url"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://yourportfolio.com"
                  value={profile.portfolioUrl}
                  onChange={(e) => setProfile({ ...profile, portfolioUrl: e.target.value })}
                />
              ) : profile.portfolioUrl ? (
                <a
                  href={profile.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline py-2 flex items-center gap-2"
                >
                  {profile.portfolioUrl}
                  <Icon name="external-link" size="sm" />
                </a>
              ) : (
                <p className="text-gray-900 py-2">—</p>
              )}
            </div>
          </div>
        </Card>

        {/* Action Buttons - Only show when editing */}
        {isEditing && (
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 bg-white font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Icon name="loading" className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Icon name="save" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        )}
      </form>

      {/* LinkedIn Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Icon name="download" />
                Import from LinkedIn
              </h3>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setLinkedinUrlInput('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <Icon name="close" />
              </button>
            </div>
            
            <p className="text-gray-600 text-sm mb-4">
              Enter your LinkedIn profile URL to automatically import your profile information.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                LinkedIn Profile URL
              </label>
              <input
                type="url"
                placeholder="https://www.linkedin.com/in/yourprofile"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={linkedinUrlInput}
                onChange={(e) => setLinkedinUrlInput(e.target.value)}
                disabled={importing}
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowImportModal(false);
                  setLinkedinUrlInput('');
                }}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
                disabled={importing}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImportFromLinkedIn}
                disabled={importing || !linkedinUrlInput}
                className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {importing ? (
                  <>
                    <Icon name="loading" className="animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Icon name="download" />
                    Import
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-4">
              Note: This will fill in empty fields with data from your LinkedIn profile. Existing data won't be overwritten.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
