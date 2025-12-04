import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from '../components/ui/Card';
import { Icon } from '../components/ui/Icon';

const ProfessionalContacts = () => {
  const API = import.meta?.env?.VITE_API_URL || 'http://localhost:3000';
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [reminders, setReminders] = useState([]);
  const [interactions, setInteractions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('');
  const [filterRelationship, setFilterRelationship] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    jobTitle: '',
    industry: '',
    relationshipType: 'professional',
    relationshipContext: '',
    linkedinUrl: '',
    notes: '',
    interests: '',
    relationshipStrength: 3,
    tags: [],
  });

  const relationshipTypes = ['professional', 'mentor', 'colleague', 'recruiter', 'alumni', 'client', 'other'];
  const industries = ['Technology', 'Finance', 'Healthcare', 'Education', 'Manufacturing', 'Consulting', 'Retail', 'Other'];

  useEffect(() => {
    fetchContacts();
    fetchStats();
    fetchReminders();
  }, []);

  useEffect(() => {
    filterContacts();
  }, [contacts, searchTerm, filterIndustry, filterRelationship, activeTab]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/contacts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setContacts(response.data || []);
    } catch (err) {
      console.error('Error fetching contacts:', err);
      setError('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/contacts/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchReminders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/contacts/reminders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReminders(response.data || []);
    } catch (err) {
      console.error('Error fetching reminders:', err);
    }
  };

  const fetchInteractions = async (contactId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/contacts/${contactId}/interactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInteractions(response.data || []);
    } catch (err) {
      console.error('Error fetching interactions:', err);
    }
  };

  const filterContacts = () => {
    let filtered = [...contacts];

    if (searchTerm) {
      filtered = filtered.filter(contact =>
        contact.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.job_title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterIndustry) {
      filtered = filtered.filter(contact => contact.industry === filterIndustry);
    }

    if (activeTab === 'recent') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      filtered = filtered.filter(contact => new Date(contact.last_interaction_date) >= thirtyDaysAgo);
    } else if (activeTab === 'needsAttention') {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      filtered = filtered.filter(contact => new Date(contact.last_interaction_date) < threeMonthsAgo);
    }

    setFilteredContacts(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (selectedContact) {
        await axios.put(`${API}/contacts/${selectedContact.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${API}/contacts`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      await fetchContacts();
      await fetchStats();
      setShowAddModal(false);
      resetForm();
    } catch (err) {
      console.error('Error saving contact:', err);
      setError('Failed to save contact');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (contactId) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/contacts/${contactId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchContacts();
      await fetchStats();
      setShowDetailModal(false);
    } catch (err) {
      console.error('Error deleting contact:', err);
      setError('Failed to delete contact');
    }
  };

  const handleAddInteraction = async (contactId, interactionData) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/contacts/${contactId}/interactions`, interactionData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchInteractions(contactId);
      await fetchContacts();
    } catch (err) {
      console.error('Error adding interaction:', err);
      setError('Failed to add interaction');
    }
  };

  const viewContactDetails = async (contact) => {
    setSelectedContact(contact);
    await fetchInteractions(contact.id);
    setShowDetailModal(true);
  };

  const editContact = (contact) => {
    setSelectedContact(contact);
    setFormData({
      name: contact.contact_name || '',
      email: contact.email_address || '',
      phone: contact.phone_number || '',
      company: contact.company || '',
      jobTitle: contact.job_title || '',
      industry: contact.industry || '',
      relationshipStrength: contact.relationship_strength || 3,
      notes: contact.notes || '',
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      jobTitle: '',
      industry: '',
      relationshipType: 'professional',
      relationshipContext: '',
      linkedinUrl: '',
      notes: '',
      interests: '',
      relationshipStrength: 3,
      tags: [],
    });
    setSelectedContact(null);
  };

  const getRelationshipColor = (strength) => {
    if (strength >= 4) return 'text-green-600';
    if (strength >= 3) return 'text-blue-600';
    return 'text-gray-600';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Professional Contacts</h1>
        <p className="mt-2 text-gray-600">Manage your professional network and track relationships</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Contacts</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Icon name="profile" size="lg" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Strength</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageStrength.toFixed(1)}</p>
              </div>
              <Icon name="brain" size="lg" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Industries</p>
                <p className="text-2xl font-bold text-gray-900">{Object.keys(stats.byIndustry).length}</p>
              </div>
              <Icon name="job" size="lg" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Reminders</p>
                <p className="text-2xl font-bold text-gray-900">{reminders.length}</p>
              </div>
              <Icon name="calendar" size="lg" />
            </div>
          </Card>
        </div>
      )}

      {/* Filters and Actions */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 flex gap-4 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select
              value={filterIndustry}
              onChange={(e) => setFilterIndustry(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Industries</option>
              {industries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>

          </div>
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Icon name="add" size="sm" variant="white" />
            Add Contact
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mt-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-2 px-1 ${activeTab === 'all' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          >
            All Contacts
          </button>
          <button
            onClick={() => setActiveTab('recent')}
            className={`pb-2 px-1 ${activeTab === 'recent' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          >
            Recently Contacted
          </button>
          <button
            onClick={() => setActiveTab('needsAttention')}
            className={`pb-2 px-1 ${activeTab === 'needsAttention' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          >
            Needs Attention
          </button>
        </div>
      </Card>

      {/* Contacts List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading contacts...</p>
        </div>
      ) : filteredContacts.length === 0 ? (
        <Card className="p-12 text-center">
          <Icon name="profile" size="xl" />
          <p className="mt-4 text-gray-600">No contacts found</p>
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Add Your First Contact
          </button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContacts.map((contact) => (
            <Card key={contact.id} className="p-4 hover:shadow-lg transition cursor-pointer" onClick={() => viewContactDetails(contact)}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900">{contact.contact_name}</h3>
                  <p className="text-sm text-gray-600">{contact.job_title}</p>
                  <p className="text-sm text-gray-500">{contact.company}</p>
                </div>
                <div className={`flex items-center gap-1 ${getRelationshipColor(contact.relationship_strength)}`}>
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < contact.relationship_strength ? 'opacity-100' : 'opacity-20'}>★</span>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                {contact.email_address && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Icon name="mail" size="sm" />
                    {contact.email_address}
                  </div>
                )}
                {contact.phone_number && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Icon name="phone" size="sm" />
                    {contact.phone_number}
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-600">
                  <Icon name="brain" size="sm" />
                  Interactions: {contact.total_interactions || 0}
                </div>
                {contact.job_opportunities_sourced > 0 && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Icon name="job" size="sm" />
                    Opportunities: {contact.job_opportunities_sourced}
                  </div>
                )}
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                <span className="px-2 py-1 bg-gray-100 rounded">{contact.connection_source || 'manual'}</span>
                <span>Last contact: {new Date(contact.last_interaction_date).toLocaleDateString()}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">{selectedContact ? 'Edit Contact' : 'Add New Contact'}</h2>
                <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-700">
                  <Icon name="close" size="md" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                    <input
                      type="text"
                      value={formData.jobTitle}
                      onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                    <select
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Industry</option>
                      {industries.map(industry => (
                        <option key={industry} value={industry}>{industry}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Relationship Type</label>
                    <select
                      value={formData.relationshipType}
                      onChange={(e) => setFormData({ ...formData, relationshipType: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {relationshipTypes.map(type => (
                        <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Relationship Strength</label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={formData.relationshipStrength}
                      onChange={(e) => setFormData({ ...formData, relationshipStrength: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <div className="text-center text-sm text-gray-600">{formData.relationshipStrength} / 5</div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
                  <input
                    type="url"
                    value={formData.linkedinUrl}
                    onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Relationship Context</label>
                  <textarea
                    value={formData.relationshipContext}
                    onChange={(e) => setFormData({ ...formData, relationshipContext: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={2}
                    placeholder="How did you meet? What's your connection?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Interests</label>
                  <input
                    type="text"
                    value={formData.interests}
                    onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Hobbies, interests, topics to discuss..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Additional notes about this contact..."
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : selectedContact ? 'Update Contact' : 'Add Contact'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}

      {/* Contact Detail Modal */}
      {showDetailModal && selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{selectedContact.contact_name}</h2>
                  <p className="text-gray-600">{selectedContact.job_title} at {selectedContact.company}</p>
                </div>
                <button onClick={() => setShowDetailModal(false)} className="text-gray-500 hover:text-gray-700">
                  <Icon name="close" size="md" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Contact Info */}
                <div>
                  <h3 className="font-semibold mb-2">Contact Information</h3>
                  <div className="space-y-2 text-sm">
                    {selectedContact.email_address && <p><strong>Email:</strong> {selectedContact.email_address}</p>}
                    {selectedContact.phone_number && <p><strong>Phone:</strong> {selectedContact.phone_number}</p>}
                    <p><strong>Company:</strong> {selectedContact.company || 'Not specified'}</p>
                    <p><strong>Industry:</strong> {selectedContact.industry || 'Not specified'}</p>
                    <p><strong>Connection Source:</strong> {selectedContact.connection_source || 'manual'}</p>
                    <p><strong>Relationship Strength:</strong> {selectedContact.relationship_strength} / 5</p>
                    <p><strong>Total Interactions:</strong> {selectedContact.total_interactions || 0}</p>
                    <p><strong>Referrals Given:</strong> {selectedContact.referrals_given || 0}</p>
                    <p><strong>Referrals Received:</strong> {selectedContact.referrals_received || 0}</p>
                    <p><strong>Job Opportunities:</strong> {selectedContact.job_opportunities_sourced || 0}</p>
                    <p><strong>First Contact:</strong> {new Date(selectedContact.first_contact_date).toLocaleDateString()}</p>
                    <p><strong>Last Interaction:</strong> {new Date(selectedContact.last_interaction_date).toLocaleDateString()}</p>
                  </div>
                </div>

                {selectedContact.notes && (
                  <div>
                    <h3 className="font-semibold mb-2">Notes</h3>
                    <p className="text-sm text-gray-700">{selectedContact.notes}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-4 pt-4 border-t">
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      editContact(selectedContact);
                    }}
                    className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Edit Contact
                  </button>
                  <button
                    onClick={() => handleDelete(selectedContact.id)}
                    className="px-6 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ProfessionalContacts;
