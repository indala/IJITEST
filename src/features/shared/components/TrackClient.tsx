'use client';

import { useState, useEffect, useRef, useActionState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSettingsContext } from '@/components/providers/SettingsContext';
import { trackManuscript } from '@/actions/track';
import { type ActionResponse, type TrackedManuscript, type Submission, type User as DBUser, type JournalSettings } from "@/db/types";
import { TrackSearchForm } from './track/TrackSearchForm';
import { TrackedManuscriptCard } from './track/TrackedManuscriptCard';
import { TrackErrorCard } from './track/TrackErrorCard';

interface TrackClientProps {
    journalShortName?: JournalSettings['journalShortName'];
}

export default function TrackClient({ journalShortName }: TrackClientProps) {
    const settings = useSettingsContext();
    const searchParams = useSearchParams();
    const [paperIdInput, setPaperIdInput] = useState<Submission['paperId']>(searchParams.get('id') || '');
    const [emailInput, setEmailInput] = useState<DBUser['email']>('');

    const [localState, setLocalState] = useState<ActionResponse<{ manuscript: TrackedManuscript }> | null>(null);

    const [, formAction] = useActionState(
        async (
            _prevState: ActionResponse<{ manuscript: TrackedManuscript }> | null,
            formData: FormData
        ): Promise<ActionResponse<{ manuscript: TrackedManuscript }> | null> => {
            const paperId = formData.get('paperId') as string;
            const email = formData.get('email') as string;
            if (!paperId || !paperId.trim()) {
                const err: ActionResponse<{ manuscript: TrackedManuscript }> = { success: false, error: "Manuscript ID is required." };
                setLocalState(err);
                return err;
            }
            if (!email || !email.trim()) {
                const err: ActionResponse<{ manuscript: TrackedManuscript }> = { success: false, error: "Email Address is required." };
                setLocalState(err);
                return err;
            }
            setLocalState(null);
            const result = await trackManuscript(paperId.trim(), email.trim());
            setLocalState(result);
            return result;
        },
        null
    );

    const manuscript = localState?.success ? localState.data?.manuscript : null;
    const errorMessage = localState?.success ? null : localState?.error;
    const isSuccess = !!localState?.success;
    const isError = localState !== null && !localState.success;

    const resultsRef = useRef<HTMLDivElement>(null);
    const resolvedShortName = journalShortName || settings['journalShortName'] || '';

    useEffect(() => {
        if ((isSuccess || isError) && resultsRef.current) {
            const offset = 80;
            const elementPosition = resultsRef.current.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    }, [isSuccess, isError]);

    return (
        <section className="container-responsive py-6 sm:py-8">
            <TrackSearchForm
                paperIdInput={paperIdInput}
                emailInput={emailInput}
                onPaperIdChange={(val) => {
                    setPaperIdInput(val);
                    setLocalState(null);
                }}
                onEmailChange={(val) => {
                    setEmailInput(val);
                    setLocalState(null);
                }}
                formAction={formAction}
                journalShortName={resolvedShortName}
            />

            <div id="tracking-results" ref={resultsRef} className="mt-6 sm:mt-8 scroll-mt-24 max-w-3xl mx-auto w-full">
                {isSuccess && manuscript && (
                    <TrackedManuscriptCard manuscript={manuscript} />
                )}

                {isError && (
                    <TrackErrorCard
                        errorMessage={errorMessage}
                        onRetry={() => setLocalState(null)}
                    />
                )}
            </div>
        </section>
    );
}
