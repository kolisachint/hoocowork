import React, { useCallback, useMemo } from 'react';
import { GitBranch, GitCommitHorizontal } from 'lucide-react';

import type { ChatMessage } from '../../types/types';
import type { Project, TreeNode } from '../../../../types/app';
import { normalizedToChatMessages } from '../../hooks/useChatMessages';

import MessageComponent from './MessageComponent';

interface PiTreeChatProps {
  visibleMessages: ChatMessage[];
  treeNodes: Map<string, TreeNode>;
  activePath: string[];
  onSetActivePath: (path: string[]) => void;
  onForkAtNode: (nodeId: string) => void;
  createDiff: any;
  onFileOpen?: (filePath: string, diffInfo?: unknown) => void;
  onShowSettings?: () => void;
  onGrantToolPermission: (suggestion: { entry: string; toolName: string }) => { success: boolean };
  autoExpandTools?: boolean;
  showRawParameters?: boolean;
  showThinking?: boolean;
  selectedProject: Project;
  provider: 'pi';
}

export default function PiTreeChat({
  treeNodes,
  activePath,
  onSetActivePath,
  onForkAtNode,
  createDiff,
  onFileOpen,
  onShowSettings,
  onGrantToolPermission,
  autoExpandTools,
  showRawParameters,
  showThinking,
  selectedProject,
}: PiTreeChatProps) {
  const activeSet = useMemo(() => new Set(activePath), [activePath]);

  const getBranchPoints = useCallback(() => {
    const points: Array<{ nodeId: string; children: string[] }> = [];
    for (const [id, node] of treeNodes.entries()) {
      if (node.children.length > 1) {
        points.push({ nodeId: id, children: [...node.children] });
      }
    }
    return points;
  }, [treeNodes]);

  const branchPoints = getBranchPoints();

  const renderBranchSwitcher = (nodeId: string, children: string[]) => {
    return (
      <div className="my-2 rounded-lg border border-dashed border-border bg-muted/30 p-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <GitBranch className="h-3 w-3" />
          <span>Branch point</span>
        </div>
        <div className="mt-1 flex flex-wrap gap-1">
          {children.map((childId) => {
            const isActive = activeSet.has(childId);
            const childNode = treeNodes.get(childId);
            const label = childNode
              ? ((childNode.message.content as string | undefined)?.slice(0, 30) || '...')
              : childId.slice(0, 8);
            return (
              <button
                key={childId}
                onClick={() => {
                  const idx = activePath.indexOf(nodeId);
                  if (idx >= 0) {
                    const newPath = activePath.slice(0, idx + 1);
                    // Append this child and its deepest descendant
                    let current = childId;
                    newPath.push(current);
                    while (current) {
                      const n = treeNodes.get(current);
                      if (n && n.children.length > 0) {
                        current = n.children[n.children.length - 1];
                        newPath.push(current);
                      } else {
                        break;
                      }
                    }
                    onSetActivePath(newPath);
                  }
                }}
                className={`rounded px-2 py-0.5 text-xs ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const activeMessages = useMemo(() => {
    const msgs: ChatMessage[] = [];
    for (const nodeId of activePath) {
      const node = treeNodes.get(nodeId);
      if (node) {
        const converted = normalizedToChatMessages([node.message as any]);
        if (converted.length > 0) {
          msgs.push(converted[0]);
        }
      }
    }
    return msgs;
  }, [activePath, treeNodes]);

  return (
    <div className="space-y-3">
      {activeMessages.map((message, index) => {
        const nodeId = activePath[index];
        const prevMessage = index > 0 ? activeMessages[index - 1] : null;
        const branchPoint = branchPoints.find((bp) => bp.nodeId === nodeId);

        return (
          <React.Fragment key={nodeId}>
            <div className="group relative">
              <MessageComponent
                message={message}
                prevMessage={prevMessage}
                createDiff={createDiff}
                onFileOpen={onFileOpen}
                onShowSettings={onShowSettings}
                onGrantToolPermission={onGrantToolPermission}
                autoExpandTools={autoExpandTools}
                showRawParameters={showRawParameters}
                showThinking={showThinking}
                selectedProject={selectedProject}
                provider="pi"
              />
              <button
                onClick={() => onForkAtNode(nodeId)}
                className="absolute -right-1 -top-1 opacity-0 transition-opacity group-hover:opacity-100"
                title="Fork thread here"
              >
                <GitCommitHorizontal className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
              </button>
            </div>
            {branchPoint && renderBranchSwitcher(branchPoint.nodeId, branchPoint.children)}
          </React.Fragment>
        );
      })}
    </div>
  );
}
