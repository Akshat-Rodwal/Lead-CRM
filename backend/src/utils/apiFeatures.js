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

