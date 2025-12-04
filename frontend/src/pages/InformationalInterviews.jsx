import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from '../components/ui/Card';
import { Icon } from '../components/ui/Icon';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const InformationalInterviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [filteredInterviews, setFilteredInterviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [suggestedContacts, setSuggestedContacts] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  const [formData, setFormData] = useState({
    contactId: '',
    requestStatus: 'requested',
    scheduledTime: '',
    prepNotes: '',
    outcomeNotes: '',
  });

  const statusOptions = ['requested', 'scheduled', 'completed', 'declined'];

  useEffect(() => {
    fetchCurrentUser();
    fetchInterviews();
    fetchContacts();
    fetchStats();
    fetchSuggestedContacts();
  }, []);

  useEffect(() => {
    filterInterviews();
  }, [interviews, searchTerm, filterStatus, activeTab]);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCurrentUserId(response.data.userId);
    } catch (err) {
      console.error('Error fetching current user:', err);
    }
  };

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/informational-interviews`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInterviews(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching interviews:', err);
      setError('Failed to load interviews');
    } finally {
      setLoading(false);
    }
  };

  const fetchContacts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/informational-interviews/contacts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setContacts(response.data || []);
    } catch (err) {
      console.error('Error fetching contacts:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/informational-interviews/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchSuggestedContacts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/informational-interviews/suggested-contacts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuggestedContacts(response.data || []);
    } catch (err) {
      console.error('Error fetching suggested contacts:', err);
    }
  };

  const filterInterviews = () => {
    let filtered = [...interviews];
    const now = new Date().toISOString();

    if (activeTab === 'upcoming') {
      filtered = filtered.filter(interview => 
        interview.scheduled_time && 
        interview.scheduled_time >= now &&
        interview.request_status === 'scheduled'
      );
    } else if (activeTab === 'completed') {
      filtered = filtered.filter(interview => interview.request_status === 'completed');
    } else if (activeTab === 'planning') {
      filtered = filtered.filter(interview => interview.request_status === 'requested');
    }

    if (filterStatus) {
      filtered = filtered.filter(interview => interview.request_status === filterStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter(interview => {
        const contact = interview.professional_contacts;
        const searchLower = searchTerm.toLowerCase();
        return (
          contact?.name?.toLowerCase().includes(searchLower) ||
          contact?.company?.toLowerCase().includes(searchLower) ||
          contact?.job_title?.toLowerCase().includes(searchLower)
        );
      });
    }

    setFilteredInterviews(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (selectedInterview) {
        await axios.put(
          `${API}/informational-interviews/${selectedInterview.id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `${API}/informational-interviews`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      fetchInterviews();
      fetchStats();
      fetchSuggestedContacts();
      setShowAddModal(false);
      resetForm();
      setError(null);
    } catch (err) {
      console.error('Error saving interview:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to save interview';
      setError(errorMessage);
      alert('Error: ' + errorMessage);
    }
  };

  const resetForm = () => {
    setFormData({
      contactId: '',
      requestStatus: 'requested',
      scheduledTime: '',
      prepNotes: '',
      outcomeNotes: '',
    });
    setSelectedInterview(null);
  };

  const editInterview = (interview) => {
    setSelectedInterview(interview);
    setFormData({
      contactId: interview.contact_id || '',
      requestStatus: interview.request_status || 'requested',
      scheduledTime: interview.scheduled_time ? new Date(interview.scheduled_time).toISOString().slice(0, 16) : '',
      prepNotes: interview.prep_notes || '',
      outcomeNotes: interview.outcome_notes || '',
    });
    setShowAddModal(true);
  };

  const deleteInterview = async (interviewId) => {
    if (!confirm('Are you sure you want to delete this interview?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/informational-interviews/${interviewId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchInterviews();
      fetchStats();
      fetchSuggestedContacts();
    } catch (err) {
      console.error('Error deleting interview:', err);
      alert('Failed to delete interview');
    }
  };

  const viewInterviewDetails = (interview) => {
    setSelectedInterview(interview);
    setShowDetailModal(true);
  };

  const selectContact = (contact) => {
    setFormData({
      ...formData,
      contactId: contact.id,
    });
    setShowAddModal(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      requested: 'bg-yellow-100 text-yellow-800',
      scheduled: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      declined: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-black">Informational Interviews</h1>
          <p className="text-black">Request and manage informational interviews with your network contacts</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Icon name="add" size="sm" />
          New Interview
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Stats Dashboard */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Icon name="profile" size="lg" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Requested</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.requested}</p>
              </div>
              <Icon name="mail" size="lg" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold text-green-600">{stats.scheduled}</p>
              </div>
              <Icon name="calendar" size="lg" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-purple-600">{stats.completed}</p>
              </div>
              <Icon name="check" size="lg" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Declined</p>
                <p className="text-2xl font-bold text-red-600">{stats.declined}</p>
              </div>
              <Icon name="close" size="lg" />
            </div>
          </Card>
        </div>
      )}

      {/* Suggested Contacts */}
      {suggestedContacts.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold text-lg mb-3">Suggested Contacts for Informational Interviews</h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {suggestedContacts.map((contact) => (
              <div
                key={contact.id}
                className="flex-shrink-0 w-64 p-3 border border-gray-200 rounded-lg hover:border-blue-500 cursor-pointer transition"
                onClick={() => selectContact(contact)}
              >
                <p className="font-medium">{contact.name}</p>
                <p className="text-sm text-gray-600">{contact.job_title}</p>
                <p className="text-sm text-gray-500">{contact.company}</p>
                {contact.relationship_strength && (
                  <div className="mt-2 flex items-center gap-1 text-yellow-500">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < contact.relationship_strength ? 'opacity-100' : 'opacity-20'}>★</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tabs and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2">
          {['all', 'upcoming', 'planning', 'completed'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            placeholder="Search interviews..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Statuses</option>
            {statusOptions.map(status => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Interviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            Loading interviews...
          </div>
        ) : filteredInterviews.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No interviews found. Start by requesting your first informational interview!
          </div>
        ) : (
          filteredInterviews.map((interview) => (
            <Card
              key={interview.id}
              className="p-4 hover:shadow-lg transition cursor-pointer"
              onClick={() => viewInterviewDetails(interview)}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900">
                      {interview.professional_contacts?.name || 'Unknown Contact'}
                    </h3>
                    <p className="text-sm text-gray-600">{interview.professional_contacts?.job_title}</p>
                    <p className="text-sm text-gray-500">{interview.professional_contacts?.company}</p>
                  </div>
                  {interview.user_id === currentUserId && (
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          editInterview(interview);
                        }}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Icon name="edit" size="sm" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteInterview(interview.id);
                        }}
                        className="p-1 hover:bg-gray-100 rounded text-red-600"
                      >
                        <Icon name="delete" size="sm" />
                      </button>
                    </div>
                  )}
                </div>

                {interview.scheduled_time && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Icon name="calendar" size="sm" />
                    {new Date(interview.scheduled_time).toLocaleString()}
                  </div>
                )}

                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(interview.request_status)}`}>
                    {interview.request_status.charAt(0).toUpperCase() + interview.request_status.slice(1)}
                  </span>
                  {interview.prep_notes && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                      📝 Has prep notes
                    </span>
                  )}
                  {interview.outcome_notes && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                      ✓ Has outcome
                    </span>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">
                  {selectedInterview ? 'Edit Interview' : 'New Informational Interview'}
                </h2>
                <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-700">
                  <Icon name="close" size="md" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Network Contact *
                  </label>
                  <select
                    required
                    value={formData.contactId}
                    onChange={(e) => setFormData({ ...formData, contactId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a contact...</option>
                    {contacts.map(contact => (
                      <option key={contact.id} value={contact.id}>
                        {contact.name} - {contact.job_title} at {contact.company}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.requestStatus}
                    onChange={(e) => setFormData({ ...formData, requestStatus: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {statusOptions.map(status => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Scheduled Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.scheduledTime}
                    onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preparation Notes
                  </label>
                  <textarea
                    value={formData.prepNotes}
                    onChange={(e) => setFormData({ ...formData, prepNotes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="What do you want to prepare or research before the interview?"
                  />
                </div>

                {(formData.requestStatus === 'completed' || formData.requestStatus === 'declined') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Outcome Notes
                    </label>
                    <textarea
                      value={formData.outcomeNotes}
                      onChange={(e) => setFormData({ ...formData, outcomeNotes: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="What did you learn? Any key insights or follow-up actions?"
                    />
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {selectedInterview ? 'Update Interview' : 'Add Interview'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedInterview && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDetailModal(false)}
        >
          <div
            className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{selectedInterview.professional_contacts?.name}</h2>
                  <p className="text-gray-600">
                    {selectedInterview.professional_contacts?.job_title} at{' '}
                    {selectedInterview.professional_contacts?.company}
                  </p>
                  {selectedInterview.professional_contacts?.email && (
                    <p className="text-sm text-gray-500 mt-1">
                      📧 {selectedInterview.professional_contacts.email}
                    </p>
                  )}
                  {selectedInterview.professional_contacts?.phone && (
                    <p className="text-sm text-gray-500">
                      📞 {selectedInterview.professional_contacts.phone}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Icon name="close" size="md" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Interview Details</h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Status:</strong>{' '}
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(selectedInterview.request_status)}`}>
                        {selectedInterview.request_status.charAt(0).toUpperCase() + selectedInterview.request_status.slice(1)}
                      </span>
                    </p>
                    {selectedInterview.scheduled_time && (
                      <p>
                        <strong>Scheduled:</strong> {new Date(selectedInterview.scheduled_time).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>

                {selectedInterview.prep_notes && (
                  <div>
                    <h3 className="font-semibold mb-2">Preparation Notes</h3>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedInterview.prep_notes}</p>
                  </div>
                )}

                {selectedInterview.outcome_notes && (
                  <div>
                    <h3 className="font-semibold mb-2">Outcome Notes</h3>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedInterview.outcome_notes}</p>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4 border-t">
                  {selectedInterview.user_id === currentUserId && (
                    <button
                      onClick={() => {
                        setShowDetailModal(false);
                        editInterview(selectedInterview);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Icon name="edit" size="sm" />
                      Edit Interview
                    </button>
                  )}
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InformationalInterviews;
