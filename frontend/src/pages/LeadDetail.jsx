import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import StatusBadge from "../components/StatusBadge";
import { fetchLeadById } from "../services/api";

const LeadDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [lead, setLead] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const loadLead = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await fetchLeadById(id);
        setLead(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadLead();
  }, [id, navigate]);

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 py-6 md:px-8 md:py-10">
        {loading && <p>Loading lead...</p>}

        {error && (
          <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        )}

        {lead && (
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h1 className="mb-2 text-xl font-semibold text-gray-900">
              {lead.name}
            </h1>
            <div className="mb-4">
              <StatusBadge status={lead.status} />
            </div>

            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <span className="font-medium">Email: </span>
                {lead.email}
              </p>
              <p>
                <span className="font-medium">Phone: </span>
                {lead.phone}
              </p>
              <p>
                <span className="font-medium">Source: </span>
                {lead.source}
              </p>
              <p>
                <span className="font-medium">Created At: </span>
                {new Date(lead.createdAt).toLocaleString()}
              </p>
              <p>
                <span className="font-medium">Updated At: </span>
                {new Date(lead.updatedAt).toLocaleString()}
              </p>
            </div>

            <button
              onClick={() => navigate(-1)}
              className="mt-6 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              Back
            </button>
          </div>
        )}
      </div>
    </main>
  );
};

export default LeadDetail;

