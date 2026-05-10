import React, { useState } from 'react';
import type { Question } from '../../../types/types';

interface QuestionAnswerContentProps {
  questions: Question[];
  answers: Record<string, string>;
  className?: string;
}

// Exception to the stateless ContentRenderer pattern: multi-question navigation requires local state.
export const QuestionAnswerContent: React.FC<QuestionAnswerContentProps> = ({
  questions,
  answers,
  className = '',
}) => {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  if (!questions || questions.length === 0) {
    return null;
  }

  const hasAnyAnswer = Object.keys(answers || {}).length > 0;
  const total = questions.length;

  return (
    <div className={`space-y-2 ${className}`}>
      {questions.map((q, idx) => {
        const answer = answers?.[q.question];
        const answerLabels = answer ? answer.split(', ') : [];
        const skipped = !answer;
        const isExpanded = expandedIdx === idx;

        return (
          <div
            key={idx}
            className="overflow-hidden rounded-[var(--radius-2)] border border-[var(--line)] bg-[var(--paper-2)]"
          >
            <button
              type="button"
              onClick={() => setExpandedIdx(isExpanded ? null : idx)}
              className="flex w-full items-start gap-2.5 px-3 py-2 text-left transition-colors hover:bg-[var(--paper-2)]"
            >
              <div className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full ${
                answerLabels.length > 0
                  ? 'bg-[var(--brand-accent-soft)]'
                  : 'bg-[var(--paper-3)]'
              }`}>
                {answerLabels.length > 0 ? (
                  <svg className="h-2.5 w-2.5 text-[var(--brand-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <div className="h-1.5 w-1.5 rounded-full bg-[var(--line)]" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {q.header && (
                    <span className="inline-flex items-center rounded border border-[var(--brand-accent)]/30 bg-[var(--brand-accent-soft)] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[var(--brand-accent)]">
                      {q.header}
                    </span>
                  )}
                  {total > 1 && (
                    <span className="text-[10px] tabular-nums text-[var(--ink-4)]">
                      {idx + 1}/{total}
                    </span>
                  )}
                </div>
                <div className="mt-0.5 text-xs leading-snug text-[var(--ink-3)]">
                  {q.question}
                </div>

                {!isExpanded && answerLabels.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {answerLabels.map((lbl) => {
                      const isCustom = !q.options.some(o => o.label === lbl);
                      return (
                        <span
                          key={lbl}
                          className="inline-flex items-center gap-1 rounded-md bg-[var(--brand-accent-soft)] px-1.5 py-0.5 text-[11px] font-medium text-[var(--brand-accent)]"
                        >
                          {lbl}
                          {isCustom && (
                            <span className="text-[9px] font-normal text-[var(--brand-accent)]/70">(custom)</span>
                          )}
                        </span>
                      );
                    })}
                  </div>
                )}

                {!isExpanded && skipped && hasAnyAnswer && (
                  <span className="mt-1 inline-block text-[10px] italic text-[var(--ink-4)]">
                    Skipped
                  </span>
                )}
              </div>

              <svg
                className={`mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[var(--ink-4)] transition-transform duration-200 ${
                  isExpanded ? 'rotate-180' : ''
                }`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isExpanded && (
              <div className="border-t border-[var(--line)] px-3 pb-2.5 pt-0.5">
                <div className="ml-6.5 space-y-1">
                  {q.options.map((opt) => {
                    const wasSelected = answerLabels.includes(opt.label);
                    return (
                      <div
                        key={opt.label}
                        className={`flex items-start gap-2 rounded-lg px-2.5 py-1.5 text-[12px] ${
                          wasSelected
                            ? 'border border-[var(--brand-accent)]/30 bg-[var(--brand-accent-soft)]'
                            : 'text-[var(--ink-4)]'
                        }`}
                      >
                        <div className={`mt-0.5 h-3.5 w-3.5 flex-shrink-0 ${q.multiSelect ? 'rounded-[3px]' : 'rounded-full'} flex items-center justify-center border-[1.5px] ${
                          wasSelected
                            ? 'border-[var(--brand-accent)] bg-[var(--brand-accent)]'
                            : 'border-[var(--line-2)]'
                        }`}>
                          {wasSelected && (
                            <svg className="h-2 w-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className={wasSelected ? 'font-medium text-[var(--ink)]' : ''}>
                            {opt.label}
                          </span>
                          {opt.description && (
                            <span className={`mt-0.5 block text-[11px] ${
                              wasSelected ? 'text-[var(--brand-accent)]/70' : 'text-[var(--ink-4)]'
                            }`}>
                              {opt.description}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {answerLabels.filter(lbl => !q.options.some(o => o.label === lbl)).map(lbl => (
                    <div
                      key={lbl}
                      className="flex items-start gap-2 rounded-lg border border-[var(--brand-accent)]/30 bg-[var(--brand-accent-soft)] px-2.5 py-1.5 text-[12px]"
                    >
                      <div className={`mt-0.5 h-3.5 w-3.5 flex-shrink-0 ${q.multiSelect ? 'rounded-[3px]' : 'rounded-full'} flex items-center justify-center border-[1.5px] border-[var(--brand-accent)] bg-[var(--brand-accent)]`}>
                        <svg className="h-2 w-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-medium text-[var(--ink)]">{lbl}</span>
                        <span className="ml-1 text-[10px] text-[var(--brand-accent)]">(custom)</span>
                      </div>
                    </div>
                  ))}

                  {skipped && hasAnyAnswer && (
                    <div className="px-2.5 py-1 text-[11px] italic text-[var(--ink-4)]">
                      No answer provided
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {!hasAnyAnswer && total === 1 && (
        <div className="text-[11px] italic text-[var(--ink-4)]">
          Skipped
        </div>
      )}
    </div>
  );
};
