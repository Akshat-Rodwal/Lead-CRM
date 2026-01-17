import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import StatusBadge from "./StatusBadge";

const LeadTable = ({ leads }) => {
    const navigate = useNavigate();

    const handleClick = (id) => {
        navigate(`/leads/${id}`);
    };

    return (
        <>
            <div className="hidden overflow-hidden rounded-xl bg-white shadow-sm md:block">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Name
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Email
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Phone
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Source
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Status
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                                Created
                            </th>
                            <th className="px-2 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                        {leads.map((lead) => (
                            <tr
                                key={lead._id}
                                onClick={() => handleClick(lead._id)}
                                className="group cursor-pointer transition-colors hover:bg-gray-50"
                            >
                                <td className="px-4 py-3 text-sm text-gray-900">
                                    {lead.name}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500">
                                    {lead.email}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500">
                                    {lead.phone}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500">
                                    {lead.source}
                                </td>
                                <td className="px-4 py-3">
                                    <StatusBadge status={lead.status} />
                                </td>
                                <td className="px-4 py-3 text-right text-xs text-gray-500">
                                    {new Date(
                                        lead.createdAt
                                    ).toLocaleDateString()}
                                </td>
                                <td className="px-2 py-3 text-right">
                                    <ChevronRight className="h-4 w-4 text-gray-300 opacity-0 transition-opacity group-hover:opacity-100" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="space-y-3 md:hidden">
                {leads.map((lead) => (
                    <div
                        key={lead._id}
                        onClick={() => handleClick(lead._id)}
                        className="cursor-pointer rounded-xl bg-white p-4 shadow-sm transition-transform hover:shadow-md active:scale-[0.99]"
                    >
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900">
                                {lead.name}
                            </p>
                            <StatusBadge status={lead.status} />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                            {lead.email}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                            {lead.phone}
                        </p>
                        <div className="mt-2 flex justify-between text-xs text-gray-400">
                            <span>{lead.source}</span>
                            <span>
                                {new Date(lead.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

export default LeadTable;
