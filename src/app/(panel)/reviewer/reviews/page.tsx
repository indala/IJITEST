import { ReviewsRegistry } from '@/features/reviews/components/ReviewsRegistry';

export const metadata = {
    title: "Reviews | IJITEST",
};

export default function ReviewerReviews() {
    return <ReviewsRegistry role="reviewer" />;
}
