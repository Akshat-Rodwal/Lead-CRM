import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    ListChecks,
    ChartBar,
    LogOut,
    CircleUser,
} from "lucide-react";

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState("");

    useEffect(() => {
        const storedEmail = localStorage.getItem("userEmail") || "";
        setEmail(storedEmail);
    }, [location.pathname]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userEmail");
        navigate("/login");
    };

    return (
        <header className="border-b bg-white/80 backdrop-blur">
            <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-8">
                <div
                    className="flex cursor-pointer items-center gap-2 text-lg font-semibold text-indigo-600 transition-transform hover:scale-[1.02]"
                    onClick={() => navigate("/dashboard")}
                >
                    <ChartBar className="h-5 w-5" />
                    <span>Lead CRM</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                    <button
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900 ${
                            location.pathname === "/dashboard"
                                ? "font-semibold"
                                : ""
                        }`}
                        onClick={() => navigate("/dashboard")}
                    >
                        <LayoutDashboard className="h-4 w-4" />
                        <span>Dashboard</span>
                    </button>
                    <button
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900 ${
                            location.pathname.startsWith("/leads")
                                ? "font-semibold"
                                : ""
                        }`}
                        onClick={() => navigate("/leads")}
                    >
                        <ListChecks className="h-4 w-4" />
                        <span>Leads</span>
                    </button>

                    {email && (
                        <span className="hidden items-center gap-1 rounded-md px-2 py-1 text-gray-500 md:inline-flex">
                            <CircleUser className="h-4 w-4" />
                            {email}
                        </span>
                    )}

                    <button
                        onClick={handleLogout}
                        className="inline-flex items-center gap-1 rounded-md bg-red-500 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-red-600 active:scale-[0.98]"
                    >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                    </button>
                </div>
            </nav>
        </header>
    );
};

export default Navbar;
