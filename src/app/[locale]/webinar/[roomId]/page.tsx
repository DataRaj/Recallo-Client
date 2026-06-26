type PageProps = {
  params: Promise<{
    roomId: string;
    locale: string;
  }>;
};

export default async function WebinarRoomPage({ params }: PageProps) {
  const { roomId } = await params;
  return (
    <div className="flex items-center justify-center h-screen bg-[#273338] text-[#FBF5DD]">
      <h1>Webinar Room: {roomId}</h1>
    </div>
  );
}
