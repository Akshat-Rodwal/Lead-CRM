import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signup } from "../services/api";

const Signup = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            navigate("/dashboard");
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError("");
            const data = await signup(email, password);
            localStorage.setItem("token", data.token);
            localStorage.setItem("userEmail", data.user.email);
            navigate("/dashboard");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-500 to-blue-600 px-4">
            <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
                <div className="mb-4 flex justify-center">
                    <div className="inline-flex rounded-md bg-gray-100 p-1">
                        <button
                            className="rounded-md px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-200"
                            onClick={() => navigate("/login")}
                        >
                            Sign In
                        </button>
                        <button
                            className="rounded-md bg-indigo-600 px-3 py-1 text-sm font-medium text-white"
                            onClick={() => navigate("/signup")}
                        >
                            Sign Up
                        </button>
                    </div>
                </div>
                <h1 className="mb-2 text-center text-2xl font-bold text-gray-900">
                    Create Account
                </h1>
                <p className="mb-6 text-center text-sm text-gray-500">
                    Sign up to access the dashboard.
                </p>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            type="email"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            type="password"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder="Your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="new-password"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
                    >
                        {loading ? "Signing up..." : "Sign Up"}
                    </button>
                </form>
                {error && (
                    <p className="mt-4 text-center text-sm text-red-600">
                        {error}
                    </p>
                )}
                <p className="mt-4 text-center text-xs text-gray-500">
                    Already have an account?{" "}
                    <a
                        href="/login"
                        className="text-indigo-600 hover:underline"
                    >
                        Log in
                    </a>
                </p>
            </div>
        </main>
    );
};

export default Signup;
