import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from '../components/ui/Card';
import { Icon } from '../components/ui/Icon';

const API_URL = 'http://localhost:3000';

export default function ContactDiscovery() {
  const [searchResults, setSearchResults] = useState([]);
  const [savedContacts, setSavedContacts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('search'); // 'search' or 'saved'
  
  // Search filters
  const [role, setRole] = useState('');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [limit, setLimit] = useState(10);

  // Toast notification
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch suggestions on mount
  useEffect(() => {
    fetchSuggestions();
    if (view === 'saved') {
      fetchSavedContacts();
    }
  }, [view]);

  const fetchSuggestions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/contact-discovery/suggestions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setSuggestions(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    }
  };

  const fetchSavedContacts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/contact-discovery/saved`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setSavedContacts(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch saved contacts:', error);
      showToast('Failed to load saved contacts', 'error');
    }
  };

  const handleSearch = async (e) => {
    e?.preventDefault();
    
    if (!role.trim()) {
      showToast('Please enter a role to search', 'error');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        role: role.trim(),
        ...(industry && { industry: industry.trim() }),
        ...(location && { location: location.trim() }),
        limit: limit.toString(),
      });

      const response = await axios.get(
        `${API_URL}/contact-discovery/search?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSearchResults(response.data.data);
        if (response.data.data.length === 0) {
          showToast('No contacts found. Try adjusting your search.', 'info');
        } else {
          showToast(`Found ${response.data.data.length} contacts`, 'success');
        }
      }
    } catch (error) {
      console.error('Search failed:', error);
      showToast(error.response?.data?.message || 'Search failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setRole(suggestion.role);
    setIndustry(suggestion.industry || '');
    // Auto-submit after a brief delay
    setTimeout(() => {
      document.getElementById('search-form').requestSubmit();
    }, 100);
  };

  const handleSaveContact = async (contact) => {
    try {
      const token = localStorage.getItem('token');
      
      // Extract only the fields the backend expects
      const contactData = {
        name: contact.name,
        title: contact.title,
        company: contact.company,
        linkedin_url: contact.linkedin_url,
        snippet: contact.snippet || '',
        search_query: contact.search_query || ''
      };
      
      const response = await axios.post(
        `${API_URL}/contact-discovery/save`,
        contactData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        showToast('Contact saved successfully', 'success');
        // Update the search results to mark as saved
        setSearchResults(prev =>
          prev.map(c =>
            c.linkedin_url === contact.linkedin_url
              ? { ...c, is_saved: true, id: response.data.data.id }
              : c
          )
        );
      }
    } catch (error) {
      console.error('Failed to save contact:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to save contact';
      showToast(errorMsg, 'error');
    }
  };

  const handleAddToNetwork = async (contactId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/contact-discovery/${contactId}/add-to-network`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        showToast('Contact added to your network!', 'success');
        fetchSavedContacts();
      }
    } catch (error) {
      console.error('Failed to add to network:', error);
      showToast(
        error.response?.data?.message || 'Failed to add to network',
        'error'
      );
    }
  };

  const handleDeleteContact = async (contactId) => {
    if (!confirm('Remove this contact from saved?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/contact-discovery/${contactId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast('Contact removed', 'success');
      fetchSavedContacts();
    } catch (error) {
      console.error('Failed to delete contact:', error);
      showToast('Failed to delete contact', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Discover Industry Contacts
          </h1>
          <p className="text-gray-600">
            Search for professionals on LinkedIn using AI-powered discovery
          </p>
        </div>

        {/* Toast Notification */}
        {toast && (
          <div
            className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white z-50 ${
              toast.type === 'success'
                ? 'bg-green-500'
                : toast.type === 'error'
                ? 'bg-red-500'
                : 'bg-blue-500'
            }`}
          >
            {toast.message}
          </div>
        )}

        {/* View Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setView('search')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              view === 'search'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Icon name="search" className="inline mr-2" />
            Search
          </button>
          <button
            onClick={() => setView('saved')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              view === 'saved'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Icon name="bookmark" className="inline mr-2" />
            Saved ({savedContacts.length})
          </button>
        </div>

        {/* Search View */}
        {view === 'search' && (
          <>
            {/* Search Form */}
            <Card className="mb-6">
              <form id="search-form" onSubmit={handleSearch} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role *
                    </label>
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="e.g., Chief Technology Officer"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Industry
                    </label>
                    <input
                      type="text"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      placeholder="e.g., Technology"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g., San Francisco"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Results Limit
                    </label>
                    <select
                      value={limit}
                      onChange={(e) => setLimit(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <Icon name="loader" className="animate-spin mr-2" />
                      Searching...
                    </span>
                  ) : (
                    <span>
                      <Icon name="search" className="inline mr-2" />
                      Search Contacts
                    </span>
                  )}
                </button>
              </form>
            </Card>

            {/* Suggested Searches */}
            {suggestions.length > 0 && searchResults.length === 0 && (
              <Card className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Popular Searches
                </h3>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition text-sm font-medium"
                    >
                      {suggestion.role}
                      {suggestion.industry && ` in ${suggestion.industry}`}
                    </button>
                  ))}
                </div>
              </Card>
            )}

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Search Results ({searchResults.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {searchResults.map((contact, idx) => (
                    <Card key={idx} className="hover:shadow-lg transition">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {contact.name}
                          </h3>
                          <p className="text-blue-600 font-medium">
                            {contact.title}
                          </p>
                          <p className="text-gray-600">{contact.company}</p>
                          {contact.snippet && (
                            <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                              {contact.snippet}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                          <a
                            href={contact.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                            title="View LinkedIn Profile"
                          >
                            <Icon name="external-link" />
                          </a>
                          {!contact.is_saved && (
                            <button
                              onClick={() => handleSaveContact(contact)}
                              className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition"
                              title="Save Contact"
                            >
                              <Icon name="bookmark" />
                            </button>
                          )}
                          {contact.is_saved && (
                            <div className="p-2 bg-gray-100 text-gray-400 rounded-lg">
                              <Icon name="check" />
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Saved Contacts View */}
        {view === 'saved' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Saved Contacts ({savedContacts.length})
            </h2>
            {savedContacts.length === 0 ? (
              <Card>
                <div className="text-center py-12">
                  <Icon name="bookmark" className="text-gray-400 text-5xl mx-auto mb-4" />
                  <p className="text-gray-500">No saved contacts yet</p>
                  <button
                    onClick={() => setView('search')}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Start Searching
                  </button>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedContacts.map((contact) => (
                  <Card key={contact.id} className="hover:shadow-lg transition">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {contact.name}
                        </h3>
                        <p className="text-blue-600 font-medium">
                          {contact.title}
                        </p>
                        <p className="text-gray-600">{contact.company}</p>
                        {contact.search_query && (
                          <p className="text-xs text-gray-400 mt-2">
                            Found via: {contact.search_query}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <a
                          href={contact.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                          title="View LinkedIn Profile"
                        >
                          <Icon name="external-link" />
                        </a>
                        <button
                          onClick={() => handleAddToNetwork(contact.id)}
                          className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition"
                          title="Add to Network"
                        >
                          <Icon name="user-plus" />
                        </button>
                        <button
                          onClick={() => handleDeleteContact(contact.id)}
                          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                          title="Remove"
                        >
                          <Icon name="trash" />
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
