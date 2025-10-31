export default function Features() {
  const features = [
    { title: 'Instant Transfers', text: 'Move money when you need it.' },
    { title: 'Insights', text: 'Get monthly summaries and trends.' },
    { title: 'Multi-Device', text: 'Access from web and mobile.' }
  ];

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 grid md:grid-cols-3 gap-6">
      {features.map((f) => (
        <div key={f.title} className="p-6 border rounded-lg hover:shadow-md transition">
          <h4 className="text-lg font-semibold mb-1">{f.title}</h4>
          <p className="text-gray-600 text-sm">{f.text}</p>
        </div>
      ))}
    </section>
  );
}