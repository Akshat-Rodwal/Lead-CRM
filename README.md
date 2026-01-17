# Lead Management Dashboard (Mini CRM)

Production-ready full-stack lead management dashboard built with:

- Frontend: React (Vite) + Tailwind CSS + React Router + Recharts
- Backend: Node.js + Express
- Database: MongoDB Atlas (Free Tier)
- Auth: Simple JWT login with hardcoded admin credentials (via environment variables)

This repository is structured as a real project that a fresher can clone, install, and run.

---

## Folder Structure

```text
full stack/
  backend/
    package.json
    .env.example
    seed.js
    server.js
    src/
      app.js
      config/
        db.js
      models/
        Lead.js
      controllers/
        authController.js
        leadController.js
      routes/
        authRoutes.js
        leadRoutes.js
      middleware/
        authMiddleware.js
      utils/
        apiFeatures.js

  frontend/
    package.json
    index.html
    vite.config.js
    tailwind.config.js
    postcss.config.cjs
    .env.example
    src/
      main.jsx
      App.jsx
      index.css
      services/
        api.js
      components/
        Navbar.jsx
        StatsCards.jsx
        LeadsChart.jsx
        StatusBadge.jsx
        LeadTable.jsx
        Pagination.jsx
      pages/
        Login.jsx
        Dashboard.jsx
        Leads.jsx
        LeadDetail.jsx
```

---

## Backend

### Tech

- Node.js
- Express
- MongoDB Atlas
- Mongoose
- JSON Web Tokens (JWT)
- Faker (for seeding)

### Setup

From the project root:

```bash
cd "backend"
npm install
```

Create a `.env` file based on `.env.example`:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin@123
```

`MONGO_URI` must be a valid MongoDB Atlas URI with a user that has read/write access.

### Run backend

Development:

```bash
cd "backend"
npm run dev
```

Production-style:

```bash
npm start
```

The API will be available at `http://localhost:5000`.

### Seed database

The seed script inserts 500 fake leads.

```bash
cd "backend"
npm run seed
```

This connects to `MONGO_URI`, removes existing leads, and inserts new ones.

### Backend files

#### backend/package.json

```json
{
  "name": "lead-crm-backend",
  "version": "1.0.0",
  "description": "Lead Management Dashboard backend",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "seed": "node seed.js"
  },
  "dependencies": {
    "@faker-js/faker": "^8.4.1",
    "cors": "^2.8.5",
    "dotenv": "^16.4.0",
    "express": "^4.19.2",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.5.0"
  },
  "devDependencies": {
    "nodemon": "^3.1.0"
  }
}
```

#### backend/.env.example

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin@123
```

#### backend/src/config/db.js

```js
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
```

#### backend/src/models/Lead.js

```js
const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    source: {
      type: String,
      enum: ["Website", "Referral", "Ads", "Social", "Other"],
      default: "Website"
    },
    status: {
      type: String,
      enum: ["New", "Contacted", "Converted", "Lost"],
      default: "New"
    }
  },
  {
    timestamps: true
  }
);

const Lead = mongoose.model("Lead", leadSchema);

module.exports = Lead;
```

#### backend/src/utils/apiFeatures.js

```js
class APIFeatures {
  constructor(queryString) {
    this.queryString = queryString || {};
  }

  buildFilter() {
    const filter = {};

    if (this.queryString.search) {
      const regex = new RegExp(this.queryString.search, "i");
      filter.$or = [{ name: regex }, { email: regex }];
    }

    if (this.queryString.status && this.queryString.status !== "All") {
      filter.status = this.queryString.status;
    }

    if (this.queryString.source && this.queryString.source !== "All") {
      filter.source = this.queryString.source;
    }

    return filter;
  }

  buildSort() {
    const sortableFields = ["createdAt", "name"];
    const sortBy = this.queryString.sortBy;
    const sortOrder = this.queryString.sortOrder;

    const field = sortableFields.includes(sortBy) ? sortBy : "createdAt";
    const direction = sortOrder === "asc" ? 1 : -1;

    return { [field]: direction };
  }

  getPaginationDefaults() {
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = parseInt(this.queryString.limit, 10) || 10;
    const skip = (page - 1) * limit;

    return { page, limit, skip };
  }
}

module.exports = APIFeatures;
```

#### backend/src/middleware/authMiddleware.js

```js
const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    if (!header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, token missing" });
    }

    const token = header.split(" ")[1];
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      return res.status(500).json({ message: "JWT_SECRET is not configured" });
    }

    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    return res.status(401).json({ message: "Not authorized, token invalid" });
  }
};

module.exports = { protect };
```

#### backend/src/controllers/leadController.js

```js
const Lead = require("../models/Lead");
const APIFeatures = require("../utils/apiFeatures");

const getLeads = async (req, res) => {
  try {
    const features = new APIFeatures(req.query);
    const filter = features.buildFilter();
    const sort = features.buildSort();
    const { page, limit, skip } = features.getPaginationDefaults();

    const total = await Lead.countDocuments(filter);
    const leads = await Lead.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(total / limit) || 1;

    res.json({
      data: leads,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    });
  } catch (error) {
    console.error("Error fetching leads:", error.message);
    res.status(500).json({ message: "Server error fetching leads" });
  }
};

const getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }
    res.json(lead);
  } catch (error) {
    console.error("Error fetching lead:", error.message);
    res.status(500).json({ message: "Server error fetching lead" });
  }
};

const getLeadStats = async (_req, res) => {
  try {
    const totalLeads = await Lead.countDocuments({});
    const convertedLeads = await Lead.countDocuments({ status: "Converted" });

    const grouped = await Lead.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const leadsByStatus = grouped.map((item) => ({
      status: item._id,
      count: item.count
    }));

    res.json({
      totalLeads,
      convertedLeads,
      leadsByStatus
    });
  } catch (error) {
    console.error("Error fetching stats:", error.message);
    res.status(500).json({ message: "Server error fetching stats" });
  }
};

module.exports = {
  getLeads,
  getLeadById,
  getLeadStats
};
```

#### backend/src/controllers/authController.js

```js
const jwt = require("jsonwebtoken");

const login = (req, res) => {
  try {
    const { email, password } = req.body;
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    if (!adminEmail || !adminPassword) {
      return res.status(500).json({ message: "Admin credentials are not configured" });
    }

    if (email !== adminEmail || password !== adminPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: "JWT_SECRET is not configured" });
    }

    const token = jwt.sign({ email }, secret, { expiresIn: "7d" });

    res.json({
      message: "Login successful",
      user: { email },
      token
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Server error during login" });
  }
};

module.exports = { login };
```

#### backend/src/routes/leadRoutes.js

```js
const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { getLeads, getLeadById, getLeadStats } = require("../controllers/leadController");

const router = express.Router();

router.get("/", protect, getLeads);
router.get("/stats", protect, getLeadStats);
router.get("/:id", protect, getLeadById);

module.exports = router;
```

#### backend/src/routes/authRoutes.js

```js
const express = require("express");
const { login } = require("../controllers/authController");

const router = express.Router();

router.post("/login", login);

module.exports = router;
```

#### backend/src/app.js

```js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/leads", require("./routes/leadRoutes"));

app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error" });
});

module.exports = app;
```

#### backend/server.js

```js
const dotenv = require("dotenv");
const connectDB = require("./src/config/db");
const app = require("./src/app");

dotenv.config();

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start();
```

#### backend/seed.js

```js
const dotenv = require("dotenv");
dotenv.config();

const { faker } = require("@faker-js/faker");
const connectDB = require("./src/config/db");
const Lead = require("./src/models/Lead");

const generateLead = () => {
  const sources = ["Website", "Referral", "Ads", "Social", "Other"];
  const statuses = ["New", "Contacted", "Converted", "Lost"];

  return {
    name: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    phone: faker.phone.number("+1-###-###-####"),
    source: faker.helpers.arrayElement(sources),
    status: faker.helpers.arrayElement(statuses)
  };
};

const seedLeads = async () => {
  try {
    await connectDB();

    await Lead.deleteMany({});

    const count = 500;
    const leads = [];

    for (let i = 0; i < count; i += 1) {
      leads.push(generateLead());
    }

    await Lead.insertMany(leads);

    console.log(`Inserted ${leads.length} leads`);
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error.message);
    process.exit(1);
  }
};

seedLeads();
```

---

## Frontend

### Tech

- React (Vite)
- React Router
- Tailwind CSS
- Recharts

### Setup

From the project root:

```bash
cd "frontend"
npm install
```

Create `.env` for Vite based on `.env.example`:

```env
VITE_API_BASE_URL=http://localhost:5000
```

### Run frontend

```bash
cd "frontend"
npm run dev
```

Vite runs at `http://localhost:5173` by default.

Make sure `VITE_API_BASE_URL` points to your backend (local or deployed).

### Frontend files

#### frontend/package.json

```json
{
  "name": "lead-crm-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.28.0",
    "recharts": "^2.9.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react-swc": "^3.6.0",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.14",
    "vite": "^5.2.0"
  }
}
```

#### frontend/.env.example

```env
VITE_API_BASE_URL=http://localhost:5000
```

#### frontend/tailwind.config.js

```js
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {}
  },
  plugins: []
};
```

#### frontend/postcss.config.cjs

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
};
```

#### frontend/vite.config.js

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  }
});
```

#### frontend/index.html

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Lead Management Dashboard</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body class="bg-gray-50">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

#### frontend/src/index.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply bg-gray-50 text-gray-900;
}
```

#### frontend/src/main.jsx

```jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

#### frontend/src/App.jsx

```jsx
import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import LeadDetail from "./pages/LeadDetail";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/leads" element={<Leads />} />
      <Route path="/leads/:id" element={<LeadDetail />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;
```

#### frontend/src/services/api.js

```js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json"
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

export const login = async (email, password) => {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Login failed");
  }

  return res.json();
};

export const fetchLeadStats = async () => {
  const res = await fetch(`${API_BASE_URL}/api/leads/stats`, {
    headers: getAuthHeaders()
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Failed to fetch stats");
  }

  return res.json();
};

export const fetchLeads = async (params) => {
  const query = new URLSearchParams();

  if (params.search) query.set("search", params.search);
  if (params.status) query.set("status", params.status);
  if (params.source) query.set("source", params.source);

  query.set("sortBy", params.sortBy || "createdAt");
  query.set("sortOrder", params.sortOrder || "desc");
  query.set("page", String(params.page || 1));
  query.set("limit", String(params.limit || 10));

  const res = await fetch(`${API_BASE_URL}/api/leads?${query.toString()}`, {
    headers: getAuthHeaders()
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Failed to fetch leads");
  }

  return res.json();
};

export const fetchLeadById = async (id) => {
  const res = await fetch(`${API_BASE_URL}/api/leads/${id}`, {
    headers: getAuthHeaders()
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Failed to fetch lead");
  }

  return res.json();
};
```

#### frontend/src/components/Navbar.jsx

```jsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

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
    <header className="border-b bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-8">
        <div
          className="cursor-pointer text-lg font-semibold text-indigo-600"
          onClick={() => navigate("/dashboard")}
        >
          Lead CRM
        </div>
        <div className="flex items-center gap-4 text-sm">
          <button
            className={`text-gray-700 hover:text-gray-900 ${
              location.pathname === "/dashboard" ? "font-semibold" : ""
            }`}
            onClick={() => navigate("/dashboard")}
          >
            Dashboard
          </button>
          <button
            className={`text-gray-700 hover:text-gray-900 ${
              location.pathname.startsWith("/leads") ? "font-semibold" : ""
            }`}
            onClick={() => navigate("/leads")}
          >
            Leads
          </button>

          {email && (
            <span className="hidden text-gray-500 md:inline-block">{email}</span>
          )}

          <button
            onClick={handleLogout}
            className="rounded-md bg-red-500 px-3 py-1 text-xs font-medium text-white hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
```

#### frontend/src/components/StatsCards.jsx

```jsx
const StatsCards = ({ totalLeads, convertedLeads, leadsByStatus }) => {
  const total = totalLeads || 0;
  const converted = convertedLeads || 0;
  const conversionRate = total > 0 ? ((converted / total) * 100).toFixed(1) : 0;

  const newCount =
    leadsByStatus.find((item) => item.status === "New")?.count || 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <p className="text-sm text-gray-500">Total Leads</p>
        <p className="mt-2 text-2xl font-semibold text-gray-900">{total}</p>
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm">
        <p className="text-sm text-gray-500">Converted Leads</p>
        <p className="mt-2 text-2xl font-semibold text-emerald-600">
          {converted}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Conversion Rate: {conversionRate}%
        </p>
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm">
        <p className="text-sm text-gray-500">New Leads</p>
        <p className="mt-2 text-2xl font-semibold text-blue-600">
          {newCount}
        </p>
      </div>
    </div>
  );
};

export default StatsCards;
```

#### frontend/src/components/LeadsChart.jsx

```jsx
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const LeadsChart = ({ data }) => {
  const chartData =
    data && data.length > 0
      ? data
      : [
          { status: "New", count: 0 },
          { status: "Contacted", count: 0 },
          { status: "Converted", count: 0 },
          { status: "Lost", count: 0 }
        ];

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="status" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LeadsChart;
```

#### frontend/src/components/StatusBadge.jsx

```jsx
const statusStyles = {
  New: "bg-blue-50 text-blue-700",
  Contacted: "bg-yellow-50 text-yellow-700",
  Converted: "bg-emerald-50 text-emerald-700",
  Lost: "bg-red-50 text-red-700"
};

const StatusBadge = ({ status }) => {
  const classes = statusStyles[status] || "bg-gray-100 text-gray-700";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${classes}`}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
```

#### frontend/src/components/LeadTable.jsx

```jsx
import { useNavigate } from "react-router-dom";
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
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {leads.map((lead) => (
              <tr
                key={lead._id}
                onClick={() => handleClick(lead._id)}
                className="cursor-pointer hover:bg-gray-50"
              >
                <td className="px-4 py-3 text-sm text-gray-900">{lead.name}</td>
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
                  {new Date(lead.createdAt).toLocaleDateString()}
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
            className="cursor-pointer rounded-xl bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900">{lead.name}</p>
              <StatusBadge status={lead.status} />
            </div>
            <p className="mt-1 text-xs text-gray-500">{lead.email}</p>
            <p className="mt-1 text-xs text-gray-500">{lead.phone}</p>
            <div className="mt-2 flex justify-between text-xs text-gray-400">
              <span>{lead.source}</span>
              <span>{new Date(lead.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default LeadTable;
```

#### frontend/src/components/Pagination.jsx

```jsx
const Pagination = ({ page, totalPages, onPageChange }) => {
  const canPrev = page > 1;
  const canNext = page < totalPages;

  const handlePrev = () => {
    if (!canPrev) return;
    onPageChange(page - 1);
  };

  const handleNext = () => {
    if (!canNext) return;
    onPageChange(page + 1);
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3 text-sm shadow-sm">
      <div className="text-xs text-gray-500">
        Page {page} of {totalPages}
      </div>

      <div className="flex gap-2">
        <button
          onClick={handlePrev}
          disabled={!canPrev}
          className="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={handleNext}
          disabled={!canNext}
          className="rounded-md bg-gray-900 px-3 py-1 text-xs font-medium text-white disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
```

#### frontend/src/pages/Login.jsx

```jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/api";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("Admin@123");
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
      const data = await login(email, password);
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
        <h1 className="mb-2 text-center text-2xl font-bold text-gray-900">
          Lead Management Dashboard
        </h1>
        <p className="mb-6 text-center text-sm text-gray-500">
          Log in with the demo admin credentials.
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="admin@example.com"
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
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        {error && (
          <p className="mt-4 text-center text-sm text-red-600">{error}</p>
        )}
      </div>
    </main>
  );
};

export default Login;
```

#### frontend/src/pages/Dashboard.jsx

```jsx
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
```

#### frontend/src/pages/Leads.jsx

```jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import LeadTable from "../components/LeadTable";
import Pagination from "../components/Pagination";
import { fetchLeads } from "../services/api";

const Leads = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [source, setSource] = useState("All");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const pageSize = 10;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
  }, [navigate]);

  const loadLeads = async (pageNumber = page) => {
    try {
      setLoading(true);
      setError("");

      const data = await fetchLeads({
        search,
        status,
        source,
        sortBy: "createdAt",
        sortOrder: "desc",
        page: pageNumber,
        limit: pageSize
      });

      setLeads(data.data);
      setTotalPages(data.pagination.totalPages || 1);
      setPage(data.pagination.page || pageNumber);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads(1);
  }, []);

  const handleApplyFilters = () => {
    loadLeads(1);
  };

  const handlePageChange = (value) => {
    loadLeads(value);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-10">
        <h1 className="mb-4 text-2xl font-semibold text-gray-900">Leads</h1>

        <div className="mb-4 flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm md:flex-row md:items-end md:justify-between">
          <div className="flex flex-1 flex-col gap-3 md:flex-row">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Search (Name or Email)
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search leads..."
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="w-full md:w-40">
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="All">All</option>
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Converted">Converted</option>
                <option value="Lost">Lost</option>
              </select>
            </div>

            <div className="w-full md:w-40">
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Source
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="All">All</option>
                <option value="Website">Website</option>
                <option value="Referral">Referral</option>
                <option value="Ads">Ads</option>
                <option value="Social">Social</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleApplyFilters}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Apply
          </button>
        </div>

        {error && (
          <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        )}

        {loading ? (
          <p>Loading leads...</p>
        ) : leads.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500">No leads found.</p>
        ) : (
          <>
            <LeadTable leads={leads} />
            <div className="mt-4">
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default Leads;
```

#### frontend/src/pages/LeadDetail.jsx

```jsx
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
```

---

## API Overview

Base URL:

- Local: `http://localhost:5000`
- Render/Railway: `https://your-backend-service.onrender.com` (update in env)

### Auth

`POST /api/auth/login`

Body:

```json
{
  "email": "admin@example.com",
  "password": "Admin@123"
}
```

Response:

```json
{
  "message": "Login successful",
  "user": { "email": "admin@example.com" },
  "token": "JWT_TOKEN_HERE"
}
```

Use the token in:

```http
Authorization: Bearer JWT_TOKEN_HERE
```

### Leads

`GET /api/leads`

Query parameters:

- `search`: optional, searches `name` and `email`
- `status`: `New | Contacted | Converted | Lost | All`
- `source`: `Website | Referral | Ads | Social | Other | All`
- `sortBy`: `createdAt | name`
- `sortOrder`: `asc | desc`
- `page`: page number
- `limit`: page size

Response:

```json
{
  "data": [],
  "pagination": {
    "total": 0,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

`GET /api/leads/:id`

Returns a single lead by ID.

`GET /api/leads/stats`

Returns:

```json
{
  "totalLeads": 0,
  "convertedLeads": 0,
  "leadsByStatus": [
    { "status": "New", "count": 0 },
    { "status": "Contacted", "count": 0 },
    { "status": "Converted", "count": 0 },
    { "status": "Lost", "count": 0 }
  ]
}
```

All lead endpoints require a valid JWT token.

---

## Demo Credentials

Default admin credentials (from `.env.example`):

- Email: `admin@example.com`
- Password: `Admin@123`

You can change these in `backend/.env`.

---

## Deployment

### MongoDB Atlas

1. Create a free cluster on MongoDB Atlas.
2. Create a database user with read/write access.
3. Whitelist IPs or allow `0.0.0.0/0` for development.
4. Copy the connection string and use it as `MONGO_URI` in backend environment variables.

### Backend (Render or Railway)

Steps for Render:

1. Push this project to GitHub.
2. On Render, create a new Web Service.
3. Choose the `backend` folder as the root.
4. Build command: `npm install`.
5. Start command: `npm start`.
6. Set environment variables:
   - `PORT` (Render usually provides this automatically)
   - `MONGO_URI`
   - `JWT_SECRET`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
7. Deploy and note the URL, for example:

   - `https://lead-crm-backend.onrender.com`

For Railway, follow a similar process, creating a Node service with the `backend` directory and the same environment variables.

### Frontend (Vercel)

1. Push the repo to GitHub.
2. On Vercel, import the project.
3. Set the root directory to `frontend`.
4. Vercel detects Vite automatically.
5. Set environment variables:
   - `VITE_API_BASE_URL=https://lead-crm-backend.onrender.com`
6. Deploy and note the frontend URL, for example:

   - `https://lead-crm-frontend.vercel.app`

Update the README with your actual URLs if desired.

---

## How To Run Locally (Quick Steps)

1. Clone the repository.
2. Backend:

   ```bash
   cd "backend"
   npm install
   cp .env.example .env
   # edit .env with your MONGO_URI, JWT_SECRET, credentials
   npm run seed
   npm run dev
   ```

3. Frontend:

   ```bash
   cd "../frontend"
   npm install
   cp .env.example .env
   # ensure VITE_API_BASE_URL matches your backend URL
   npm run dev
   ```

4. Open `http://localhost:5173` in the browser.

5. Log in with the demo credentials and explore:

   - Dashboard analytics
   - Leads list with search, filters, pagination
   - Lead detail page

#   L e a d - C R M  
 