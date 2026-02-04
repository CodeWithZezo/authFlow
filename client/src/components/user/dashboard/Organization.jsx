import React, { useState } from 'react';
import { Plus, Trash2, Building2, CheckCircle } from 'lucide-react';

const Organization = () => {
  const [organizations, setOrganizations] = useState([
    { id: 1, name: 'Acme Corp', role: 'Owner' },
    { id: 2, name: 'Dev Team', role: 'Admin' },
    { id: 3, name: 'Client Org', role: 'Member' },
  ]);

  const [orgName, setOrgName] = useState('');
  const [activeOrgId, setActiveOrgId] = useState(1);

  const createOrganization = () => {
    if (!orgName.trim()) return;

    setOrganizations([
      ...organizations,
      {
        id: Date.now(),
        name: orgName,
        role: 'Owner', // creator is always owner
      },
    ]);

    setOrgName('');
  };

  const deleteOrganization = (id, role) => {
    if (role !== 'Owner') {
      alert('Only owners can delete an organization.');
      return;
    }

    const confirmed = window.confirm(
      'Delete this organization? This action cannot be undone.'
    );
    if (!confirmed) return;

    setOrganizations(organizations.filter(org => org.id !== id));
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Organizations</h1>
          <p className="text-slate-400">
            Manage organizations and your role in each
          </p>
        </div>

        {/* Create Organization */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-400" />
            Create Organization
          </h2>

          <div className="flex gap-3">
            <input
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="Organization name"
              className="flex-1 px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={createOrganization}
              className="px-5 py-3 bg-indigo-600 rounded-lg text-white font-medium hover:bg-indigo-500 transition"
            >
              Create
            </button>
          </div>
        </div>

        {/* Organization List */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl divide-y divide-slate-800">
          {organizations.map(org => (
            <div
              key={org.id}
              className={`flex items-center justify-between p-5 ${
                activeOrgId === org.id ? 'bg-indigo-500/10' : ''
              }`}
            >
              {/* Left */}
              <div className="flex items-center gap-4">
                <Building2 className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-white font-medium">{org.name}</p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      org.role === 'Owner'
                        ? 'bg-green-500/20 text-green-400'
                        : org.role === 'Admin'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-slate-500/20 text-slate-300'
                    }`}
                  >
                    {org.role}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                {activeOrgId === org.id ? (
                  <span className="flex items-center gap-1 text-green-400 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    Active
                  </span>
                ) : (
                  <button
                    onClick={() => setActiveOrgId(org.id)}
                    className="px-4 py-2 text-sm bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition"
                  >
                    Open
                  </button>
                )}

                <button
                  onClick={() => deleteOrganization(org.id, org.role)}
                  className="text-red-400 hover:text-red-300 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Organization;
