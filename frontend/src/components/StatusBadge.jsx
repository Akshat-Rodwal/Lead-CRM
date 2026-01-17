const statusStyles = {
    New: "bg-blue-50 text-blue-700",
    Contacted: "bg-yellow-50 text-yellow-700",
    Converted: "bg-emerald-50 text-emerald-700",
    Lost: "bg-red-50 text-red-700",
};

const StatusBadge = ({ status }) => {
    const classes = statusStyles[status] || "bg-gray-100 text-gray-700";

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${classes}`}
        >
            <span
                className={`inline-block h-2 w-2 rounded-full ${
                    status === "New"
                        ? "bg-blue-600 animate-pulse-soft"
                        : status === "Converted"
                        ? "bg-emerald-600"
                        : status === "Contacted"
                        ? "bg-yellow-600"
                        : status === "Lost"
                        ? "bg-red-600"
                        : "bg-gray-500"
                }`}
            />
            <span>{status}</span>
        </span>
    );
};

export default StatusBadge;
