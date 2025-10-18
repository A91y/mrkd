export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Content Not Found</h2>
        <p className="text-muted-foreground mb-8">
          The markdown you're looking for doesn't exist or has expired.
        </p>
        <a
          href="/"
          className="px-6 py-3 bg-accent hover:bg-accent/90 text-white rounded-lg font-medium inline-block transition-colors"
        >
          Create Your Own
        </a>
      </div>
    </div>
  );
}
