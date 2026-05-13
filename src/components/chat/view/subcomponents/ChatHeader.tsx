import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { ProjectSession, LLMProvider } from '../../../../types/app';

type TokenBudgetLike = Record<string, unknown> | null | undefined;

type ChatHeaderProps = {
  session: ProjectSession | null;
  currentSessionId: string | null;
  provider: LLMProvider | string;
  modelLabel: string;
  permissionMode?: string;
  isProcessing: boolean;
  isConnected: boolean;
  tokenBudget?: TokenBudgetLike;
  totalMessages?: number;
  onCopySessionId?: () => void;
};

function formatNumber(value?: number): string {
  if (typeof value !== 'number' || !isFinite(value)) return '–';
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return String(Math.round(value));
}

function formatTimestamp(value?: string | number | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const ChatHeader = memo(function ChatHeader({
  session,
  currentSessionId,
  provider,
  modelLabel,
  permissionMode,
  isProcessing,
  isConnected,
  tokenBudget,
  totalMessages,
  onCopySessionId,
}: ChatHeaderProps) {
  const { t } = useTranslation('chat');

  const sessionId = currentSessionId || session?.id || null;
  const sessionLabel = session?.summary || session?.title || session?.name || session?.id || t('header.newSession', { defaultValue: 'New session' });
  const truncatedId = sessionId ? `${sessionId.slice(0, 8)}…${sessionId.slice(-4)}` : '—';
  const lastActivity = (session?.lastActivity as string | undefined) || (session?.updated_at as string | undefined) || session?.createdAt;

  const statusTone: 'ok' | 'warn' | 'default' = useMemo(() => {
    if (isProcessing) return 'warn';
    if (isConnected) return 'ok';
    return 'default';
  }, [isProcessing, isConnected]);

  const statusLabel = isProcessing
    ? t('header.statusProcessing', { defaultValue: 'processing' })
    : isConnected
      ? t('header.statusConnected', { defaultValue: 'connected' })
      : t('header.statusIdle', { defaultValue: 'idle' });

  const tokenUsed = typeof tokenBudget?.used === 'number' ? (tokenBudget!.used as number) : undefined;
  const tokenTotal = typeof tokenBudget?.total === 'number' ? (tokenBudget!.total as number) : undefined;
  const tokenPercent = tokenUsed && tokenTotal ? Math.min(100, Math.round((tokenUsed / tokenTotal) * 100)) : null;

  const handleCopyId = () => {
    if (!sessionId) return;
    if (onCopySessionId) {
      onCopySessionId();
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(sessionId);
    }
  };

  return (
    <header className="chat-header-stack" data-component="chat-header">
      <div className="chat-header chat-header-info">
        <div className="chat-title">
          <span className="chat-eyebrow">{t('header.session', { defaultValue: 'Session' })}</span>
          <span className="chat-name" title={sessionId ?? undefined}>{sessionLabel}</span>
        </div>
        <div className="chat-meta">
          <span className="badge badge-default" title={t('header.providerLabel', { defaultValue: 'Provider' })}>
            {String(provider)}
          </span>
          {modelLabel ? (
            <span className="badge badge-info" title={t('header.modelLabel', { defaultValue: 'Active model' })}>
              {modelLabel}
            </span>
          ) : null}
          {permissionMode ? (
            <span className="badge badge-default" title={t('header.modeLabel', { defaultValue: 'Permission mode' })}>
              {t(`codex.modes.${permissionMode}`, { defaultValue: permissionMode })}
            </span>
          ) : null}
          <span className={`badge badge-${statusTone}`} title={t('header.statusLabel', { defaultValue: 'Connection status' })}>
            <span className="chat-status-dot" aria-hidden /> {statusLabel}
          </span>
          {sessionId ? (
            <button
              type="button"
              className="chat-meta-id"
              onClick={handleCopyId}
              title={t('header.copyId', { defaultValue: 'Copy full session ID' })}
            >
              <span className="chat-meta-id-label">id</span>
              <span className="chat-meta-id-value">{truncatedId}</span>
            </button>
          ) : null}
          {tokenPercent !== null ? (
            <span className="chat-meta-tokens" title={t('header.tokenUsage', { defaultValue: 'Token usage' })}>
              <span className="chat-meta-id-label">tok</span>
              <span className="chat-meta-id-value">{formatNumber(tokenUsed)} / {formatNumber(tokenTotal)} ({tokenPercent}%)</span>
            </span>
          ) : null}
          {typeof totalMessages === 'number' ? (
            <span className="chat-meta-count" title={t('header.messageCount', { defaultValue: 'Message count' })}>
              <span className="chat-meta-id-label">msg</span>
              <span className="chat-meta-id-value">{totalMessages}</span>
            </span>
          ) : null}
          {lastActivity ? (
            <span className="chat-meta-time">
              <span className="chat-meta-id-label">updated</span>
              <span className="chat-meta-id-value">{formatTimestamp(lastActivity)}</span>
            </span>
          ) : null}
        </div>
      </div>
    </header>
  );
});

export default ChatHeader;
