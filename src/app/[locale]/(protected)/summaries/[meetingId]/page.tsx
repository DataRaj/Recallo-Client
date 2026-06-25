export default function SummaryDetailPage({ params }: { params: { meetingId: string } }) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-4 text-[#2C3E2D]">Summary Detail</h1>
      <p className="text-[#8D7A7A]">Summary for meeting: {params.meetingId}</p>
    </div>
  );
}
