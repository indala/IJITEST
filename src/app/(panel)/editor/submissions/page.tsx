import SubmissionRegistry from '@/features/submissions/components/SubmissionRegistry';
import { getAllSubmissions } from '@/actions/submissions';

export const dynamic = 'force-dynamic';

export default async function EditorSubmissions({
    searchParams
}: {
    searchParams: Promise<{ status?: string, q?: string }>
}) {
    const { status, q } = await searchParams;
    const currentStatus = status || 'all';
    const res = await getAllSubmissions({ 
        status: currentStatus, 
        ...(q ? { q } : {}) 
    });
    if (!res.success) {
        return <div className="p-10 text-center font-black uppercase tracking-widest text-rose-500">Error: {res.error}</div>;
    }
    const submissions = res.data;
    
    const statsResult = {
        total: submissions?.length || 0,
        submitted: submissions?.filter(s => s.status === 'submitted').length || 0,
        underReview: submissions?.filter(s => s.status === 'underReview').length || 0,
        published: submissions?.filter(s => s.status === 'published').length || 0,
        rejected: submissions?.filter(s => s.status === 'rejected').length || 0
    };


    return (
        <SubmissionRegistry 
            role="editor" 
            submissions={submissions} 
            stats={statsResult} 
            currentStatus={currentStatus} 
        />
    );
}
