export default function TranscriptDetailPage({ params }: { params: { meetingId: string } }) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-4 text-[#2C3E2D]">Transcript Detail</h1>
      <p className="text-[#8D7A7A]">Transcript for meeting: {params.meetingId}</p>
    </div>
  );
}
