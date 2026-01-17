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

