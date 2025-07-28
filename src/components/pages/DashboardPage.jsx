import { useState, useEffect } from "react";
import DashboardStats from "@/components/organisms/DashboardStats";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import * as dealsService from "@/services/api/dealsService";

const DashboardPage = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDeals = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await dealsService.getAll();
      setDeals(data);
    } catch (err) {
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeals();
  }, []);

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadDeals} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-700 to-accent-700 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-gray-600 mt-1">Overview of your lifetime deals and savings</p>
      </div>

      <DashboardStats deals={deals} />
    </div>
  );
};

export default DashboardPage;