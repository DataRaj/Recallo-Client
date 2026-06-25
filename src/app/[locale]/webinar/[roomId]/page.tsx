export default function WebinarRoomPage({ params }: { params: { roomId: string } }) {
  return (
    <div className="flex items-center justify-center h-screen bg-[#273338] text-[#FBF5DD]">
      <h1>Webinar Room: {params.roomId}</h1>
    </div>
  );
}
