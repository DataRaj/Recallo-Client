type PageProps = {
  params: Promise<{
    meetingId: string;
    locale: string;
  }>;
};

export default async function TranscriptDetailPage({ params }: PageProps) {
  const { meetingId } = await params;
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-4 text-[#2C3E2D]">Transcript Detail</h1>
      <p className="text-[#8D7A7A]">Transcript for meeting: {meetingId}</p>
    </div>
  );
}
