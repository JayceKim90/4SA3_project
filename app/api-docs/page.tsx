"use client";

export default function ApiDocsPage() {
  return (
    <div className="w-full h-screen">
      <iframe
        src="/api/swagger-doc"
        className="w-full h-full border-0"
        title="HobbyHop API Documentation"
      />
    </div>
  );
}
