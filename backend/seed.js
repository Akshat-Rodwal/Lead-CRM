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

