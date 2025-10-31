import { useEffect, useState } from 'react';

const slides = [
  { title: 'Automated Deposits', text: 'Set it and grow it.' },
  { title: 'Goal Tracking', text: 'Visualize your progress.' },
  { title: 'Secure & Reliable', text: 'Your money, protected.' }
];

export default function Carousel() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % slides.length), 3500);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <div className="overflow-hidden relative border rounded-lg">
        <div
          className="flex transition-transform duration-700"
          style={{ transform: `translateX(-${idx * 100}%)` }}
        >
          {slides.map((s, i) => (
            <div key={i} className="min-w-full p-12 bg-white">
              <h3 className="text-2xl font-semibold mb-2">{s.title}</h3>
              <p className="text-gray-600">{s.text}</p>
            </div>
          ))}
        </div>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`h-2 w-2 rounded-full ${i === idx ? 'bg-brand-600' : 'bg-gray-300'}`}
              onClick={() => setIdx(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}