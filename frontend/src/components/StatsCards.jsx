import { Users, CheckCircle2, Sparkles } from "lucide-react";

const StatsCards = ({ totalLeads, convertedLeads, leadsByStatus }) => {
    const total = totalLeads || 0;
    const converted = convertedLeads || 0;
    const conversionRate =
        total > 0 ? ((converted / total) * 100).toFixed(1) : 0;

    const newCount =
        leadsByStatus.find((item) => item.status === "New")?.count || 0;

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="animate-fade-in-up rounded-xl bg-white p-4 shadow-sm transition-transform hover:shadow-md hover:ring-1 hover:ring-indigo-100">
                <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-indigo-600" />
                    <p className="text-sm text-gray-500">Total Leads</p>
                </div>
                <p className="mt-2 text-2xl font-semibold text-gray-900">
                    {total}
                </p>
            </div>

            <div className="animate-fade-in-up rounded-xl bg-white p-4 shadow-sm transition-transform hover:shadow-md hover:ring-1 hover:ring-emerald-100">
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <p className="text-sm text-gray-500">Converted Leads</p>
                </div>
                <p className="mt-2 text-2xl font-semibold text-emerald-600">
                    {converted}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                    Conversion Rate: {conversionRate}%
                </p>
            </div>

            <div className="animate-fade-in-up rounded-xl bg-white p-4 shadow-sm transition-transform hover:shadow-md hover:ring-1 hover:ring-blue-100">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-blue-600" />
                    <p className="text-sm text-gray-500">New Leads</p>
                </div>
                <p className="mt-2 text-2xl font-semibold text-blue-600">
                    {newCount}
                </p>
            </div>
        </div>
    );
};

export default StatsCards;
