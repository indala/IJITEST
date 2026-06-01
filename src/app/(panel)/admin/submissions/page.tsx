import SubmissionRegistry from '@/features/submissions/components/SubmissionRegistry';
import { getAllSubmissions } from '@/actions/submissions';

export const metadata = {
    title: "Submissions | IJITEST",
};

export const dynamic = 'force-dynamic';

export default async function AdminSubmissions({
    searchParams
}: {
    searchParams: Promise<{ status?: string, q?: string }>
}) {
    const { status, q } = await searchParams;
    const currentStatus = status || 'all';
    const res = await getAllSubmissions(q ? { q } : {});

    if (!res.success) {
        return <div className="p-10 text-center font-black uppercase tracking-widest text-rose-500">Error: {res.error}</div>;
    }

    const allSubmissions = res.data || [];
    
    const statsResult = {
        total: allSubmissions.length,
        submitted: allSubmissions.filter(s => s.status === 'submitted').length,
        underReview: allSubmissions.filter(s => s.status === 'underReview').length,
        published: allSubmissions.filter(s => s.status === 'published').length,
        rejected: allSubmissions.filter(s => s.status === 'rejected').length
    };

    const filteredSubmissions = currentStatus === 'all'
        ? allSubmissions
        : allSubmissions.filter(s => s.status === currentStatus);

    return (
        <SubmissionRegistry 
            role="admin" 
            submissions={filteredSubmissions} 
            stats={statsResult} 
            currentStatus={currentStatus} 
        />
    );
}
