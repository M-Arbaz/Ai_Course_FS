export default async function BlogTagPage({ params }) {
    const { tagSlug } = await params;

    return (
        <div style={{ padding: "100px", fontSize: "30px" }}>
            TAG PAGE WORKING: {tagSlug}
        </div>
    );
}