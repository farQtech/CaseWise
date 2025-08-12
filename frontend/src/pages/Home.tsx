import React from "react";
import Navbar from "../components/Navbar";
import StatsCard from "../components/StatsCard";
import Table from "../components/Table";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="p-6 grid grid-cols-3 gap-4">
        <StatsCard title="Users" value="1,234" />
        <StatsCard title="Orders" value="567" />
        <StatsCard title="Revenue" value="$12,345" />
      </div>
      <div className="p-6">
        <Table />
      </div>
    </div>
  );
}
