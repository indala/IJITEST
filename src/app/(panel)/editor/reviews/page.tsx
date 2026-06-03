import { ReviewsRegistry } from '@/features/reviews/components/ReviewsRegistry';

export const metadata = {
    title: "Reviews | IJITEST",
};

export default function EditorReviews() {
    return <ReviewsRegistry role="editor" />;
}
