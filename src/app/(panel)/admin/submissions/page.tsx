import SubmissionRegistry from '@/features/submissions/components/SubmissionRegistry';
import { getAllSubmissions } from '@/actions/submissions';

export const dynamic = 'force-dynamic';

export default async function AdminSubmissions({
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
    const submissions = res.data || [];
    const error = res.error;
    
    const statsResult = {
        total: submissions?.length || 0,
        submitted: submissions?.filter(s => s.status === 'submitted').length || 0,
        underReview: submissions?.filter(s => s.status === 'under_review').length || 0,
        published: submissions?.filter(s => s.status === 'published').length || 0,
        rejected: submissions?.filter(s => s.status === 'rejected').length || 0
    };

    if (error) return <div>Error loading submissions: {error}</div>;

    return (
        <SubmissionRegistry 
            role="admin" 
            submissions={submissions} 
            stats={statsResult} 
            currentStatus={currentStatus} 
        />
    );
}
