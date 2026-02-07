// src/pages/Organization.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrgStore, useOrgs, useOrgLoading, useOrgError } from '../../store/org';
import { useUser } from '../../store/auth';

const Organization = () => {
  const navigate = useNavigate();
  const { getAllOrgs, createOrg, setCurrentOrg, clearError, loadCurrentOrg } = useOrgStore();
  const orgs = useOrgs();
  const isLoading = useOrgLoading();
  const error = useOrgError();
  const user = useUser();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    // Load organizations on component mount
    getAllOrgs();
    loadCurrentOrg();
  }, [getAllOrgs, loadCurrentOrg]);

  useEffect(() => {
    // Clear error after 5 seconds
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Auto-generate slug from name if slug is empty
    if (name === 'name' && !formData.slug) {
      const generatedSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData((prev) => ({
        ...prev,
        slug: generatedSlug,
      }));
    }

    // Clear form error when user types
    if (formError) {
      setFormError('');
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setFormError('Organization name is required');
      return false;
    }
    if (!formData.slug.trim()) {
      setFormError('Organization slug is required');
      return false;
    }
    if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      setFormError('Slug can only contain lowercase letters, numbers, and hyphens');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!validateForm()) {
      return;
    }

    try {
      await createOrg(formData);
      // Reset form and close modal on success
      setFormData({ name: '', slug: '' });
      setShowCreateForm(false);
    } catch (err) {
      setFormError(err.message || 'Failed to create organization');
    }
  };

  const handleSelectOrg = (membership) => {
    setCurrentOrg(membership.orgId);
    // Navigate to the organization page using the slug
    navigate(`/org/${membership.orgId?.slug}`);
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setFormData({ name: '', slug: '' });
    setFormError('');
  };

  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Get org status badge
  const getStatusBadge = (status = 'active') => {
    const statusConfig = {
      active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      suspended: { bg: 'bg-red-100', text: 'text-red-800', label: 'Suspended' },
    };

    const config = statusConfig[status.toLowerCase()] || statusConfig.active;

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  // Get role badge
  const getRoleBadge = (role) => {
    const roleConfig = {
      owner: { bg: 'bg-purple-100', text: 'text-purple-800' },
      admin: { bg: 'bg-blue-100', text: 'text-blue-800' },
      member: { bg: 'bg-gray-100', text: 'text-gray-800' },
    };

    const config = roleConfig[role.toLowerCase()] || roleConfig.member;

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {role}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* App Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">O</span>
              </div>
              <span className="text-xl font-bold text-gray-900">OrgHub</span>
            </div>

            {/* User Avatar */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/settings')}
                className="hidden sm:flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm font-medium">Settings</span>
              </button>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">
                  {user?.fullName || user?.email || 'User'}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-10 h-10 rounded-full" />
                ) : (
                  getInitials(user?.fullName || user?.email || 'User')
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 max-w-5xl">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {user?.fullName || user?.email || 'User'}
          </h1>
          <p className="text-gray-600">Manage your organizations and teams</p>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 mb-8"></div>

        {/* Section Title */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Your Organizations</h2>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 mb-6"></div>

        {/* Global Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Organizations List */}
        {isLoading && orgs.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading organizations...</p>
          </div>
        ) : orgs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <p className="text-gray-600 mb-4">No organizations yet</p>
            <p className="text-gray-500 text-sm">Create your first organization to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orgs.map((membership) => (
              <div
                key={membership._id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-200 group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Organization Name */}
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {membership.orgId?.name || 'Unnamed Organization'}
                      </h3>
                      {getRoleBadge(membership.role)}
                    </div>

                    {/* Status and Plan */}
                    <div className="flex items-center gap-4 mb-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">Status:</span>
                        {getStatusBadge(membership.orgId?.status)}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">Plan:</span>
                        <span className="font-medium text-gray-900">
                          {membership.orgId?.plan || 'Free'}
                        </span>
                      </div>
                    </div>

                    {/* Action Link */}
                    <button
                      onClick={() => handleSelectOrg(membership)}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors group-hover:gap-3 group-hover:translate-x-1 duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <span>
                        {membership.orgId?.status === 'pending'
                          ? 'Waiting for approval'
                          : membership.orgId?.status === 'suspended'
                          ? 'Contact owner'
                          : 'Open Dashboard'}
                      </span>
                    </button>

                    {/* Warning for suspended orgs */}
                    {membership.orgId?.status === 'suspended' && (
                      <div className="mt-3 flex items-center gap-2 text-sm text-orange-700 bg-orange-50 px-3 py-2 rounded">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span>Payment issue - please contact organization owner</span>
                      </div>
                    )}
                  </div>

                  {/* Arrow Icon */}
                  <div className="ml-4">
                    <svg 
                      className="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-colors" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-gray-200 my-8"></div>

        {/* Create New Organization Button */}
        <button
          onClick={() => setShowCreateForm(true)}
          className="w-full bg-white border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
        >
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center transition-colors">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-lg font-medium text-gray-700 group-hover:text-blue-700 transition-colors">
              Create New Organization
            </span>
          </div>
        </button>
      </main>

      {/* Create Organization Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h2 className="text-2xl font-bold mb-6">Create New Organization</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Organization Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Acme Inc."
                  disabled={isLoading}
                  autoFocus
                />
              </div>

              <div className="mb-6">
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                  Organization Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="acme-inc"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Lowercase letters, numbers, and hyphens only
                </p>
              </div>

              {formError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-red-800">{formError}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </span>
                  ) : (
                    'Create Organization'
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Organization;