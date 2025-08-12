export default function Table() {
    return (
      <table className="min-w-full bg-white shadow rounded">
        <thead>
          <tr>
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border px-4 py-2">John Doe</td>
            <td className="border px-4 py-2">Active</td>
          </tr>
        </tbody>
      </table>
    );
  }
  