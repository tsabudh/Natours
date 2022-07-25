class APIfeatures {
  constructor(query, queryString) {
    this.query = query;
    // console.log(queryString);

    this.queryString = queryString;
  }

  filter() {
    //  1A) FILTERING

    const queryObj = { ...this.queryString };
    const excludedFields = ['sort', 'page', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    //  1B) ADVANCED FILTERING

    const queryStr = JSON.stringify(queryObj).replace(
      /\b(gt|gte|lt|lte)\b/g,
      (matchedItems) => `$${matchedItems}`
    );
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    //  2) SORTING   queryObject.sort('property1 property2');
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' '); //eg: 'price ratingsAverage
      this.query = this.query.sort(sortBy);
    } else {
      // query = query.sort('-createdAt');
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limit() {
    // 3) LIMITING FIELDS
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    // 4) PAGINGINATION DEFAULT_LIMIT

    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 3;

    // console.log(this.query.limit);
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);

    // query = query.skip(2).limit(3);
    // if (this.queryString.page) {
    //   const numTours = this.query.countDocuments();
    //   if (skip >= numTours) throw new Error('This page does not exist.');
    // }

    return this;
  }
}

module.exports = APIfeatures;
