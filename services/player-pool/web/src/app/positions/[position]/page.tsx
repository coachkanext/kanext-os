export default async function PositionPage({ params }: { params: Promise<{ position: string }> }) {
  const { position } = await params;
  return (
    <div className="max-w-[900px] mx-auto px-4 py-12 text-center">
      <h1 className="text-2xl font-black text-slate-900 uppercase tracking-wide mb-2">Position Rankings</h1>
      <p className="text-slate-400 text-sm">Coming soon — Position: {decodeURIComponent(position)}</p>
    </div>
  );
}
