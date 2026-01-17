import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import StatsCards from "../components/StatsCards";
import LeadsChart from "../components/LeadsChart";
import { fetchLeadStats } from "../services/api";

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const loadStats = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await fetchLeadStats();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [navigate]);

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-10">
        <h1 className="mb-4 text-2xl font-semibold text-gray-900">
          Dashboard
        </h1>

        {error && (
          <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        )}

        {loading && <p>Loading dashboard...</p>}

        {!loading && stats && (
          <>
            <StatsCards
              totalLeads={stats.totalLeads}
              convertedLeads={stats.convertedLeads}
              leadsByStatus={stats.leadsByStatus}
            />

            <div className="mt-8 rounded-xl bg-white p-4 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Leads by Status
              </h2>
              <LeadsChart data={stats.leadsByStatus} />
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default Dashboard;

