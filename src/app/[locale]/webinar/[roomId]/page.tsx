type PageProps = {
  params: Promise<{
    roomId: string;
    locale: string;
  }>;
};

export default async function WebinarRoomPage({ params }: PageProps) {
  const { roomId } = await params;
  return (
    <div className="flex h-screen items-center justify-center bg-[var(--color-chat-bg)] text-[var(--color-chat-text)]">
      <h1>
        Webinar Room:
        {roomId}
      </h1>
    </div>
  );
}
