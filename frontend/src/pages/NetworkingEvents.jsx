import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from '../components/ui/Card';
import { Icon } from '../components/ui/Icon';

const NetworkingEvents = () => {
  const API = import.meta?.env?.VITE_API_URL || 'http://localhost:3000';
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventConnections, setEventConnections] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEventType, setFilterEventType] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);

  const [formData, setFormData] = useState({
    eventName: '',
    eventDate: '',
    eventTime: '',
    location: '',
    eventType: 'in-person',
    industry: '',
    description: '',
    organizer: '',
    registrationUrl: '',
    attendanceStatus: 'planning',
    networkingGoals: [],
    targetConnections: 3,
    preparationNotes: '',
  });

  const eventTypes = ['in-person', 'virtual', 'hybrid', 'conference', 'meetup', 'workshop', 'career-fair', 'other'];
  const industries = ['Technology', 'Finance', 'Healthcare', 'Education', 'Manufacturing', 'Consulting', 'Retail', 'Other'];
  const attendanceStatuses = ['planning', 'registered', 'attended', 'cancelled'];

  useEffect(() => {
    fetchCurrentUser();
    fetchEvents();
    fetchStats();
  }, []);

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

  useEffect(() => {
    filterEvents();
  }, [events, searchTerm, filterEventType, filterIndustry, activeTab]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/networking/events`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvents(response.data || []);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/networking/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchEventConnections = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/networking/events/${eventId}/connections`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEventConnections(response.data || []);
    } catch (err) {
      console.error('Error fetching event connections:', err);
    }
  };

  const filterEvents = () => {
    let filtered = [...events];
    const now = new Date().toISOString();

    if (activeTab === 'upcoming') {
      filtered = filtered.filter(event => event.event_date >= now);
    } else if (activeTab === 'past') {
      filtered = filtered.filter(event => event.event_date < now);
    }

    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.event_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.organizer?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterEventType) {
      filtered = filtered.filter(event => event.event_type === filterEventType);
    }

    if (filterIndustry) {
      filtered = filtered.filter(event => event.industry === filterIndustry);
    }

    setFilteredEvents(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (selectedEvent) {
        await axios.put(`${API}/networking/events/${selectedEvent.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${API}/networking/events`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      fetchEvents();
      fetchStats();
      setShowAddModal(false);
      resetForm();
    } catch (err) {
      console.error('Error saving event:', err);
      setError('Failed to save event');
    }
  };

  const resetForm = () => {
    setFormData({
      eventName: '',
      eventDate: '',
      eventTime: '',
      location: '',
      eventType: 'in-person',
      industry: '',
      description: '',
      organizer: '',
      registrationUrl: '',
      attendanceStatus: 'planning',
      networkingGoals: [],
      targetConnections: 3,
      preparationNotes: '',
    });
    setSelectedEvent(null);
  };

  const editEvent = (event) => {
    setSelectedEvent(event);
    setFormData({
      eventName: event.event_name || '',
      eventDate: event.event_date?.split('T')[0] || '',
      eventTime: event.event_time || '',
      location: event.location || '',
      eventType: event.event_type || 'in-person',
      industry: event.industry || '',
      description: event.description || '',
      organizer: event.organizer || '',
      registrationUrl: event.registration_url || '',
      attendanceStatus: event.attendance_status || 'planning',
      networkingGoals: event.networking_goals || [],
      targetConnections: event.target_connections || 3,
      preparationNotes: event.preparation_notes || '',
    });
    setShowAddModal(true);
  };

  const deleteEvent = async (eventId) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/networking/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchEvents();
      fetchStats();
    } catch (err) {
      console.error('Error deleting event:', err);
      setError('Failed to delete event');
    }
  };

  const viewEventDetails = (event) => {
    setSelectedEvent(event);
    fetchEventConnections(event.id);
    setShowDetailModal(true);
  };

  const updateEventStatus = async (eventId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API}/networking/events/${eventId}`, 
        { attendanceStatus: status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchEvents();
    } catch (err) {
      console.error('Error updating event status:', err);
    }
  };

  const updateROI = async (eventId, rating) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API}/networking/events/${eventId}`, 
        { roiRating: rating },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchEvents();
      fetchStats();
    } catch (err) {
      console.error('Error updating ROI:', err);
    }
  };

  const getEventTypeColor = (type) => {
    const colors = {
      'in-person': 'text-blue-600 bg-blue-50',
      'virtual': 'text-green-600 bg-green-50',
      'hybrid': 'text-purple-600 bg-purple-50',
      'conference': 'text-orange-600 bg-orange-50',
      'meetup': 'text-pink-600 bg-pink-50',
      'workshop': 'text-indigo-600 bg-indigo-50',
      'career-fair': 'text-red-600 bg-red-50',
    };
    return colors[type] || 'text-gray-600 bg-gray-50';
  };

  const getStatusColor = (status) => {
    const colors = {
      'planning': 'text-gray-600 bg-gray-100',
      'registered': 'text-blue-600 bg-blue-100',
      'attended': 'text-green-600 bg-green-100',
      'cancelled': 'text-red-600 bg-red-100',
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading events...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Networking Events</h1>
          <p className="text-gray-600 mt-1">Track events and build strategic professional relationships</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Icon name="add" size="sm" variant="white" />
          Add Event
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Stats Dashboard */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalEvents}</p>
              </div>
              <Icon name="calendar" size="lg" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Connections</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalConnections}</p>
              </div>
              <Icon name="profile" size="lg" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Connections/Event</p>
                <p className="text-2xl font-bold text-green-600">{stats.averageConnectionsPerEvent.toFixed(1)}</p>
              </div>
              <Icon name="analytics" size="lg" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Follow-up Rate</p>
                <p className="text-2xl font-bold text-purple-600">{stats.followUpRate.toFixed(0)}%</p>
              </div>
              <Icon name="check" size="lg" />
            </div>
          </Card>
        </div>
      )}

      {/* Tabs and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeTab === 'upcoming'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeTab === 'past'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Past
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeTab === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
        </div>

        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            value={filterEventType}
            onChange={(e) => setFilterEventType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            {eventTypes.map(type => (
              <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
            ))}
          </select>
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
      </div>

      {/* Events List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEvents.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No events found. Add your first networking event!
          </div>
        ) : (
          filteredEvents.map((event) => (
            <Card key={event.id} className="p-4 hover:shadow-lg transition cursor-pointer" onClick={() => viewEventDetails(event)}>
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-lg text-gray-900 flex-1">{event.event_name}</h3>
                  {event.user_id === currentUserId && (
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          editEvent(event);
                        }}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Icon name="edit" size="sm" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteEvent(event.id);
                        }}
                        className="p-1 hover:bg-gray-100 rounded text-red-600"
                      >
                        <Icon name="delete" size="sm" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Icon name="calendar" size="sm" />
                    {new Date(event.event_date).toLocaleDateString()} {event.event_time}
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Icon name="location" size="sm" />
                      {event.location}
                    </div>
                  )}
                  {event.organizer && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Icon name="company" size="sm" />
                      {event.organizer}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getEventTypeColor(event.event_type)}`}>
                    {event.event_type}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(event.attendance_status)}`}>
                    {event.attendance_status}
                  </span>
                  {event.industry && (
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                      {event.industry}
                    </span>
                  )}
                </div>

                {event.attendance_status === 'attended' && (
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Connections: {event.actual_connections_made || 0}</span>
                      <span className="text-gray-600">Follow-ups: {event.follow_ups_completed || 0}</span>
                    </div>
                    {event.roi_rating > 0 && (
                      <div className="mt-1 flex items-center gap-1">
                        <span className="text-xs text-gray-600">ROI:</span>
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < event.roi_rating ? 'text-yellow-500' : 'text-gray-300'}>★</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Add/Edit Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">{selectedEvent ? 'Edit Event' : 'Add New Event'}</h2>
                <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-700">
                  <Icon name="close" size="md" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.eventName}
                    onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.eventDate}
                      onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                    <input
                      type="time"
                      value={formData.eventTime}
                      onChange={(e) => setFormData({ ...formData, eventTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="City, State or Virtual Platform"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                    <select
                      value={formData.eventType}
                      onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {eventTypes.map(type => (
                        <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                    <select
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select industry</option>
                      {industries.map(industry => (
                        <option key={industry} value={industry}>{industry}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Organizer</label>
                  <input
                    type="text"
                    value={formData.organizer}
                    onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Registration URL</label>
                  <input
                    type="url"
                    value={formData.registrationUrl}
                    onChange={(e) => setFormData({ ...formData, registrationUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={formData.attendanceStatus}
                      onChange={(e) => setFormData({ ...formData, attendanceStatus: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {attendanceStatuses.map(status => (
                        <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Connections</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.targetConnections}
                      onChange={(e) => setFormData({ ...formData, targetConnections: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preparation Notes</label>
                  <textarea
                    value={formData.preparationNotes}
                    onChange={(e) => setFormData({ ...formData, preparationNotes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Research attendees, prepare elevator pitch, bring business cards..."
                  />
                </div>

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
                    {selectedEvent ? 'Update Event' : 'Add Event'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      {showDetailModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowDetailModal(false)}>
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{selectedEvent.event_name}</h2>
                  <p className="text-gray-600">{new Date(selectedEvent.event_date).toLocaleDateString()} {selectedEvent.event_time}</p>
                </div>
                <button onClick={() => setShowDetailModal(false)} className="text-gray-500 hover:text-gray-700">
                  <Icon name="close" size="md" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Event Information</h3>
                  <div className="space-y-2 text-sm">
                    {selectedEvent.location && <p><strong>Location:</strong> {selectedEvent.location}</p>}
                    {selectedEvent.organizer && <p><strong>Organizer:</strong> {selectedEvent.organizer}</p>}
                    <p><strong>Type:</strong> {selectedEvent.event_type}</p>
                    {selectedEvent.industry && <p><strong>Industry:</strong> {selectedEvent.industry}</p>}
                    <p><strong>Status:</strong> {selectedEvent.attendance_status}</p>
                    {selectedEvent.registration_url && (
                      <p><strong>Registration:</strong> <a href={selectedEvent.registration_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Link</a></p>
                    )}
                  </div>
                </div>

                {selectedEvent.description && (
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-sm text-gray-700">{selectedEvent.description}</p>
                  </div>
                )}

                {selectedEvent.preparation_notes && (
                  <div>
                    <h3 className="font-semibold mb-2">Preparation Notes</h3>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedEvent.preparation_notes}</p>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-2">Networking Goals</h3>
                  <p className="text-sm text-gray-700">
                    Target Connections: {selectedEvent.target_connections}
                    {selectedEvent.actual_connections_made !== undefined && (
                      <span className="ml-2 text-green-600">
                        (Actual: {selectedEvent.actual_connections_made})
                      </span>
                    )}
                  </p>
                </div>

                {selectedEvent.attendance_status === 'attended' && (
                  <div>
                    <h3 className="font-semibold mb-2">Post-Event Metrics</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Connections Made:</strong> {selectedEvent.actual_connections_made || 0}</p>
                      <p><strong>Follow-ups Completed:</strong> {selectedEvent.follow_ups_completed || 0}</p>
                      <div>
                        <strong>ROI Rating:</strong>
                        <div className="flex items-center gap-1 mt-1">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <button
                              key={rating}
                              onClick={() => updateROI(selectedEvent.id, rating)}
                              className="text-2xl hover:scale-110 transition"
                            >
                              <span className={rating <= (selectedEvent.roi_rating || 0) ? 'text-yellow-500' : 'text-gray-300'}>★</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {eventConnections.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Connections Made</h3>
                    <div className="space-y-2">
                      {eventConnections.map((connection) => (
                        <div key={connection.id} className="p-3 bg-gray-50 rounded-lg text-sm">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{connection.network_contacts?.contact_name}</p>
                              <p className="text-gray-600">{connection.network_contacts?.job_title} at {connection.network_contacts?.company}</p>
                            </div>
                            {connection.follow_up_completed ? (
                              <span className="text-green-600 text-xs">✓ Followed up</span>
                            ) : (
                              <button
                                onClick={async () => {
                                  const token = localStorage.getItem('token');
                                  await axios.put(
                                    `${API}/networking/events/${selectedEvent.id}/connections/${connection.contact_id}/follow-up`,
                                    {},
                                    { headers: { Authorization: `Bearer ${token}` } }
                                  );
                                  fetchEventConnections(selectedEvent.id);
                                  fetchEvents();
                                }}
                                className="text-xs text-blue-600 hover:underline"
                              >
                                Mark followed up
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4 border-t">
                  {selectedEvent.user_id === currentUserId && (
                    <button
                      onClick={() => {
                        setShowDetailModal(false);
                        editEvent(selectedEvent);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Icon name="edit" size="sm" />
                      Edit Event
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

export default NetworkingEvents;
