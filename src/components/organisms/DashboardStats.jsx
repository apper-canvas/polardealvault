import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";

const DashboardStats = ({ deals }) => {
  const stats = {
    total: deals.length,
    active: deals.filter(d => d.status === "Active").length,
    expired: deals.filter(d => d.status === "Expired").length,
    coming: deals.filter(d => d.status === "Coming Soon").length,
    soldOut: deals.filter(d => d.status === "Sold Out").length
  };

  const totalSavings = deals.reduce((sum, deal) => {
    const savings = deal.originalPrice - deal.ltdPrice;
    return sum + (savings > 0 ? savings : 0);
  }, 0);

  const avgSavings = stats.total > 0 ? totalSavings / stats.total : 0;

  const statCards = [
    {
      title: "Total Deals",
      value: stats.total,
      icon: "Zap",
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50"
    },
    {
      title: "Active Deals",
      value: stats.active,
      icon: "CheckCircle",
      gradient: "from-green-500 to-emerald-500",
      bgGradient: "from-green-50 to-emerald-50"
    },
    {
      title: "Total Savings",
      value: `$${totalSavings.toLocaleString()}`,
      icon: "DollarSign",
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50"
    },
    {
      title: "Avg Savings",
      value: `$${avgSavings.toFixed(0)}`,
      icon: "TrendingUp",
      gradient: "from-orange-500 to-red-500",
      bgGradient: "from-orange-50 to-red-50"
    }
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-50`} />
            <CardHeader className="relative pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${stat.gradient} flex items-center justify-center shadow-lg`}>
                  <ApperIcon name={stat.icon} className="h-4 w-4 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative pt-0">
              <div className={`text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                {stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ApperIcon name="PieChart" className="h-5 w-5 text-primary-600" />
              Deal Status Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: "Active", count: stats.active, variant: "active" },
                { label: "Coming Soon", count: stats.coming, variant: "coming" },
                { label: "Expired", count: stats.expired, variant: "expired" },
                { label: "Sold Out", count: stats.soldOut, variant: "soldout" }
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant={item.variant}>{item.label}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{item.count}</span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: stats.total > 0 ? `${(item.count / stats.total) * 100}%` : "0%"
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ApperIcon name="Target" className="h-5 w-5 text-primary-600" />
              Top Platforms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(
                deals.reduce((acc, deal) => {
                  acc[deal.platform] = (acc[deal.platform] || 0) + 1;
                  return acc;
                }, {})
              )
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([platform, count]) => (
                  <div key={platform} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-100 to-accent-100 rounded-lg flex items-center justify-center">
                        <ApperIcon name="Globe" className="h-4 w-4 text-primary-600" />
                      </div>
                      <span className="font-medium">{platform}</span>
                    </div>
                    <Badge variant="primary">{count} deals</Badge>
                  </div>
                ))}
              {stats.total === 0 && (
                <p className="text-gray-500 text-center py-4">No deals tracked yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardStats;