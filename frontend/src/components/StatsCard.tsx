export default function StatsCard({ title, value }: { title: string, value: string }) {
    return (
      <div className="bg-white p-4 shadow rounded">
        <h3 className="text-gray-500">{title}</h3>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    );
  }
  