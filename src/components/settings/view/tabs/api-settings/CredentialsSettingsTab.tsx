import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';

import { authenticatedFetch } from '../../../../../utils/api';
import { copyTextToClipboard } from '../../../../../utils/clipboard';
import type { ApiKeyItem, GithubCredentialItem } from './types';

// Settings section component matching the design pattern
function SettingsSection({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="settings-section">
      <div className="settings-section-head">
        <div className="settings-section-title">{title}</div>
        {desc && <div className="settings-section-desc">{desc}</div>}
      </div>
      <div className="settings-section-body">{children}</div>
    </div>
  );
}

// Settings row component matching the design pattern
function SettingsRow({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="settings-row">
      <div className="settings-row-text">
        <div className="settings-row-label">{label}</div>
        {hint && <div className="settings-row-hint">{hint}</div>}
      </div>
      <div className="settings-row-ctrl">{children}</div>
    </div>
  );
}

// API Key row component
function ApiKeyRow({
  apiKey,
  onRevoke,
}: {
  apiKey: ApiKeyItem;
  onRevoke: (id: string) => void;
}) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  return (
    <div className="api-key-row">
      <div>
        <div className="api-key-name">{apiKey.key_name}</div>
        <div className="api-key-meta">
          {apiKey.last_used
            ? `last used ${formatDate(apiKey.last_used)}`
            : 'never used'}
          {' · '}
          created {formatDate(apiKey.created_at)}
        </div>
      </div>
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={() => onRevoke(apiKey.id)}
      >
        Revoke
      </button>
    </div>
  );
}

export default function CredentialsSettingsTab() {
  const { t } = useTranslation('settings');
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([]);
  const [githubCredentials, setGithubCredentials] = useState<GithubCredentialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewKeyForm, setShowNewKeyForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<{ keyName: string; apiKey: string } | null>(null);

  // Fetch API keys and credentials
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [apiKeysResponse, credentialsResponse] = await Promise.all([
        authenticatedFetch('/api/settings/api-keys'),
        authenticatedFetch('/api/settings/credentials?type=github_token'),
      ]);

      const apiKeysPayload = await apiKeysResponse.json();
      const credentialsPayload = await credentialsResponse.json();

      setApiKeys(apiKeysPayload.apiKeys || []);
      setGithubCredentials(credentialsPayload.credentials || []);
    } catch (error) {
      console.error('Error fetching credentials:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  // Create new API key
  const createApiKey = useCallback(async () => {
    if (!newKeyName.trim()) return;

    try {
      const response = await authenticatedFetch('/api/settings/api-keys', {
        method: 'POST',
        body: JSON.stringify({ keyName: newKeyName.trim() }),
      });

      const payload = await response.json();
      if (!response.ok || !payload.success) {
        console.error('Error creating API key:', payload.error || 'Failed to create API key');
        return;
      }

      if (payload.apiKey) {
        setNewlyCreatedKey({ keyName: payload.apiKey.keyName, apiKey: payload.apiKey.apiKey });
      }
      setNewKeyName('');
      setShowNewKeyForm(false);
      await fetchData();
    } catch (error) {
      console.error('Error creating API key:', error);
    }
  }, [fetchData, newKeyName]);

  // Delete API key
  const deleteApiKey = useCallback(async (keyId: string) => {
    if (!window.confirm(t('apiKeys.confirmDelete'))) return;

    try {
      const response = await authenticatedFetch(`/api/settings/api-keys/${keyId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const payload = await response.json();
        console.error('Error deleting API key:', payload.error || 'Failed to delete API key');
        return;
      }

      await fetchData();
    } catch (error) {
      console.error('Error deleting API key:', error);
    }
  }, [fetchData, t]);

  // Copy key to clipboard
  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await copyTextToClipboard(text);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  }, []);

  if (loading) {
    return (
      <>
        <div className="settings-h1">{t('mainTabs.apiTokens')}</div>
        <div className="settings-sub">Personal access tokens for HooCowork&apos;s REST API + git provider credentials.</div>
        <div className="settings-row" style={{ color: 'var(--ink-3)' }}>Loading...</div>
      </>
    );
  }

  const githubConfigured = githubCredentials.length > 0 && githubCredentials.some(c => c.is_active);

  return (
    <>
      <div className="settings-h1">{t('mainTabs.apiTokens')}</div>
      <div className="settings-sub">Personal access tokens for HooCowork&apos;s REST API + git provider credentials.</div>

      {/* Newly Created Key Alert */}
      {newlyCreatedKey && (
        <div className="settings-section">
          <div className="settings-section-body">
            <div className="rounded-lg border p-4" style={{ borderColor: 'var(--warn)', background: 'var(--warn-1)' }}>
              <div className="font-medium mb-2">Save your API key</div>
              <div className="text-sm mb-3" style={{ color: 'var(--ink-3)' }}>
                This is the only time you&apos;ll see this key. Store it securely.
              </div>
              <code className="block p-2 rounded mb-3 text-sm" style={{ background: 'var(--paper)', fontFamily: 'var(--font-mono)' }}>
                {newlyCreatedKey.apiKey}
              </code>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => copyToClipboard(newlyCreatedKey.apiKey)}
                >
                  Copy
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setNewlyCreatedKey(null)}
                >
                  I&apos;ve saved it
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HooCowork API Keys Section */}
      <SettingsSection title="HooCowork API keys">
        {apiKeys.length === 0 ? (
          <div className="settings-row" style={{ color: 'var(--ink-3)' }}>No API keys created yet.</div>
        ) : (
          apiKeys.map((key) => (
            <ApiKeyRow key={key.id} apiKey={key} onRevoke={deleteApiKey} />
          ))
        )}

        {/* New Key Form */}
        {showNewKeyForm ? (
          <div className="settings-row">
            <div className="w-full rounded-lg border p-4" style={{ borderColor: 'var(--line)', background: 'var(--paper)' }}>
              <input
                className="input mb-3"
                type="text"
                placeholder="Key name (e.g., CLI on laptop)"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void createApiKey();
                }}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => void createApiKey()}
                  disabled={!newKeyName.trim()}
                >
                  Generate
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    setShowNewKeyForm(false);
                    setNewKeyName('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="btn btn-outline btn-sm mt-4"
            onClick={() => setShowNewKeyForm(true)}
          >
            <Plus size={14} className="mr-1" />
            Generate new key
          </button>
        )}
      </SettingsSection>

      {/* Git Credentials Section */}
      <SettingsSection title="Git credentials">
        <SettingsRow
          label="GitHub"
          hint={githubConfigured ? 'github_pat_… (stored locally, never sent to the agent)' : 'not configured'}
        >
          <button type="button" className="btn btn-outline btn-sm">
            {githubConfigured ? 'Update token' : 'Add token'}
          </button>
        </SettingsRow>
        <SettingsRow label="GitLab" hint="not configured">
          <button type="button" className="btn btn-outline btn-sm">Add token</button>
        </SettingsRow>
        <SettingsRow label="Bitbucket" hint="not configured">
          <button type="button" className="btn btn-outline btn-sm">Add token</button>
        </SettingsRow>
      </SettingsSection>
    </>
  );
}
