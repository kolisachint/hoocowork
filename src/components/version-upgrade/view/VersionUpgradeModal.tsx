import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { authenticatedFetch } from "../../../utils/api";
import { ReleaseInfo } from "../../../types/sharedTypes";
import { copyTextToClipboard } from "../../../utils/clipboard";
import type { InstallMode } from "../../../hooks/useVersionCheck";
import { IS_PLATFORM } from "../../../constants/config";

interface VersionUpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    releaseInfo: ReleaseInfo | null;
    currentVersion: string;
    latestVersion: string | null;
    installMode: InstallMode;
}

const RELOAD_COUNTDOWN_START = 30;

export function VersionUpgradeModal({
    isOpen,
    onClose,
    releaseInfo,
    currentVersion,
    latestVersion,
    installMode
}: VersionUpgradeModalProps) {
    const { t } = useTranslation('common');
    const upgradeCommand = installMode === 'npm'
        ? t('versionUpdate.npmUpgradeCommand')
        : IS_PLATFORM
            ? 'npm run update:platform'
            : 'git checkout main && git pull && npm install';
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateOutput, setUpdateOutput] = useState('');
    const [updateError, setUpdateError] = useState('');
    const [reloadCountdown, setReloadCountdown] = useState<number | null>(null);

    useEffect(() => {
        if (!IS_PLATFORM || reloadCountdown === null || reloadCountdown <= 0) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            setReloadCountdown((previousCountdown) => {
                if (previousCountdown === null) {
                    return null;
                }

                return Math.max(previousCountdown - 1, 0);
            });
        }, 1000);

        return () => window.clearTimeout(timeoutId);
    }, [reloadCountdown]);

    const handleUpdateNow = useCallback(async () => {
        setIsUpdating(true);
        setUpdateOutput('Starting update...\n');
        setReloadCountdown(IS_PLATFORM ? RELOAD_COUNTDOWN_START : null);
        setUpdateError('');

        try {
            // Call the backend API to run the update command
            const response = await authenticatedFetch('/api/system/update', {
                method: 'POST',
            });

            const data = await response.json();

            if (response.ok) {
                setUpdateOutput(prev => prev + data.output + '\n');
                setUpdateOutput(prev => prev + '\n✅ Update completed successfully!\n');
                setUpdateOutput(prev => prev + 'Please restart the server to apply changes.' + '\n');
            } else {
                setUpdateError(data.error || 'Update failed');
                setUpdateOutput(prev => prev + '\n❌ Update failed: ' + (data.error || 'Unknown error') + '\n');
            }
        } catch (error: any) {
            setUpdateError(error.message);
            setUpdateOutput(prev => prev + '\n❌ Update failed: ' + error.message + '\n');
        } finally {
            setIsUpdating(false);
        }
    }, []);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            {/* Backdrop */}
            <button
                className="fixed inset-0"
                onClick={onClose}
                aria-label={t('versionUpdate.ariaLabels.closeModal')}
            />

            {/* Modal */}
            <div className="modal-shell relative mx-4 w-full max-w-2xl">
                {/* Header */}
                <div className="modal-head">
                    <div className="modal-head-title">
                        <div className="modal-head-icon">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                            </svg>
                        </div>
                        <div>
                            <h3>{t('versionUpdate.title')}</h3>
                            <p className="text-xs text-[var(--ink-3)] m-0">
                                {releaseInfo?.title || t('versionUpdate.newVersionReady')}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-md p-1.5 text-[var(--ink-4)] hover:bg-[var(--paper-2)] hover:text-[var(--ink-2)]"
                    >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="modal-body">
                    {/* Version Info */}
                    <div className="vupg-versions">
                        <div className="vupg-vrow">
                            <span className="vupg-vrow-label">{t('versionUpdate.currentVersion')}</span>
                            <span className="vupg-vrow-val">{currentVersion}</span>
                        </div>
                        <div className="vupg-vrow latest">
                            <span className="vupg-vrow-label">{t('versionUpdate.latestVersion')}</span>
                            <span className="vupg-vrow-val">{latestVersion}</span>
                        </div>
                    </div>

                    {/* Changelog */}
                    {releaseInfo?.body && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium text-[var(--ink)] m-0">{t('versionUpdate.whatsNew')}</h3>
                                {releaseInfo?.htmlUrl && (
                                    <a
                                        href={releaseInfo.htmlUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-xs text-[var(--brand-accent)] hover:underline hover:opacity-80"
                                    >
                                        {t('versionUpdate.viewFullRelease')}
                                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    </a>
                                )}
                            </div>
                            <div className="vupg-changelog">
                                {cleanChangelog(releaseInfo.body)}
                            </div>
                        </div>
                    )}

                    {/* Update Output */}
                    {(updateOutput || updateError) && (
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium text-[var(--ink)] m-0">{t('versionUpdate.updateProgress')}</h3>
                            <div className="max-h-48 overflow-y-auto rounded-[var(--radius-2)] border border-[var(--line)] bg-[#0E0E0C] p-4">
                                <pre className="whitespace-pre-wrap font-mono text-xs text-[var(--ok)] m-0">{updateOutput}</pre>
                            </div>
                            {IS_PLATFORM && reloadCountdown !== null && (
                                <div className="border-[var(--brand-accent)]/30 rounded-md border bg-[var(--brand-accent-soft)] px-3 py-2 text-xs text-[var(--brand-accent)]">
                                    {reloadCountdown === 0
                                        ? 'Refresh the page now. If that doesn\'t work, RESTART the environment.'
                                        : `Refresh the page in ${reloadCountdown} ${reloadCountdown === 1 ? 'second' : 'seconds'}. If that doesn\'t work, RESTART the environment.`}
                                </div>
                            )}
                            {updateError && (
                                <div className="border-[var(--err)]/30 rounded-md border bg-[var(--err-soft)] px-3 py-2 text-xs text-[var(--err)]">
                                    {updateError}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Upgrade Instructions */}
                    {!isUpdating && !updateOutput && (
                        <div className="space-y-3">
                            <h3 className="text-sm font-medium text-[var(--ink)] m-0">{t('versionUpdate.manualUpgrade')}</h3>
                            <div className="vupg-cmd">
                                {upgradeCommand}
                            </div>
                            <p className="text-xs text-[var(--ink-3)] m-0">
                                {t('versionUpdate.manualUpgradeHint')}
                            </p>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="modal-foot">
                    <button
                        onClick={onClose}
                        className="btn btn-sm btn-ghost"
                    >
                        {updateOutput ? t('versionUpdate.buttons.close') : t('versionUpdate.buttons.later')}
                    </button>
                    {!updateOutput && (
                        <>
                            <button
                                onClick={() => copyTextToClipboard(upgradeCommand)}
                                className="btn btn-sm btn-outline"
                            >
                                {t('versionUpdate.buttons.copyCommand')}
                            </button>
                            <button
                                onClick={handleUpdateNow}
                                disabled={isUpdating}
                                className="btn btn-sm btn-solid"
                            >
                                {isUpdating ? (
                                    <>
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        {t('versionUpdate.buttons.updating')}
                                    </>
                                ) : (
                                    t('versionUpdate.buttons.updateNow')
                                )}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

// Clean up changelog by removing GitHub-specific metadata
const cleanChangelog = (body: string) => {
    if (!body) return '';

    return body
        // Remove full commit hashes (40 character hex strings)
        .replace(/\b[0-9a-f]{40}\b/gi, '')
        // Remove short commit hashes (7-10 character hex strings at start of line or after dash/space)
        .replace(/(?:^|\s|-)([0-9a-f]{7,10})\b/gi, '')
        // Remove "Full Changelog" links
        .replace(/\*\*Full Changelog\*\*:.*$/gim, '')
        // Remove compare links (e.g., https://github.com/.../compare/v1.0.0...v1.0.1)
        .replace(/https?:\/\/github\.com\/[^\/]+\/[^\/]+\/compare\/[^\s)]+/gi, '')
        // Clean up multiple consecutive empty lines
        .replace(/\n\s*\n\s*\n/g, '\n\n')
        // Trim whitespace
        .trim();
};
