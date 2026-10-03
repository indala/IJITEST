import { ReviewsRegistry } from '@/features/reviews/components/ReviewsRegistry';

export const metadata = {
    title: "Reviews",
};

export default function EditorReviews() {
    return <ReviewsRegistry role="editor" />;
}
