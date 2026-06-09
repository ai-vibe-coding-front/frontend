type EventDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { id } = await params;

  return (
    <main>
      <h1>Event Detail</h1>
      <p>Event ID: {id}</p>
    </main>
  );
}
