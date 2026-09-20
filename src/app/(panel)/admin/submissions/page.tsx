import SubmissionRegistry from '@/features/submissions/components/SubmissionRegistry';
import { getAllSubmissions } from '@/actions/submissions';
import { connection } from 'next/server';

export const metadata = {
    title: "Submissions | IJITEST",
};

export default async function AdminSubmissions({
    searchParams: _searchParams
}: {
    searchParams: Promise<{ status?: string, q?: string }>
}) {
    await connection();
    const res = await getAllSubmissions();

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

    return (
        <SubmissionRegistry 
            role="admin" 
            submissions={allSubmissions} 
            stats={statsResult} 
        />
    );
}
