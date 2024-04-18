const Userdb = require("../models/userModel");
const Productdb = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const { isErrored } = require("nodemailer/lib/xoauth2");

//create product
const createProduct = asyncHandler(async (req, res) => {
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    const newProduct = await Productdb.create(req.body);
    res.json(newProduct);
  } catch (err) {
    throw new Error(err);
  }
});

//get a Product

const getProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const findProduct = await Productdb.findById(id);
    res.json(findProduct);
  } catch (error) {
    throw new Error(error);
  }
});

//get all products

const getAllProducts = asyncHandler(async (req, res) => {
  try {
    //Filter Products
    const queryObj = { ...req.query };
    console.log(queryObj);

    const excludeFields = ["page", "sort", "limit", "fields"];
    excludeFields.forEach((elem) => delete queryObj[elem]);
    let querystring = JSON.stringify(queryObj);
    queryStr = querystring.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );
    console.log(JSON.parse(queryStr));

    let query = Productdb.find(JSON.parse(queryStr));

    //Sorting

    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort({ createdAt: -1 });
    }
    //limiting the fields

    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v");
    }

    //pagination

    const page = req.query.page;
    const limit = req.query.limit;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
    if (req.query.page) {
      const productCount = await Productdb.countDocuments();
      if (skip >= productCount) throw new Error("This Page doesn't exists");
    }
    ;

    const products = await query;
    res.json(products);
  } catch (error) {
    throw new Error(error);
  }
});

//edit a products
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    const updateProduct = await Productdb.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updateProduct);
  } catch (error) {
    throw new Error(error);
  }
});

//delete product

const deleteProduct = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const deleteProduct = await Productdb.findByIdAndDelete(id);
    res.json(deleteProduct);
  } catch (error) {
    throw new Errror(error);
  }
});

const addToWishlist = asyncHandler(async (req, res) => {
  const { id } = req.user;
  console.log(id)
  const { productId } = req.body;

  try {
    const user = await Userdb.findById(id);
    const alreadyadded = user.wishList.find(
      (id) => id.toString() === productId
    );
    if (alreadyadded) {
      let user = await Userdb.findByIdAndUpdate(
        id,
        {
          $pull: { wishList: productId },
        },
        {
          new: true,
        }
      );
      res.json(user);
    } else {
      let user = await Userdb.findByIdAndUpdate(
        id,
        {
          $push: { wishList: productId },
        },
        {
          new: true,
        }
      );
      res.json(user);
    }
  } catch (err) {
    throw new Error(error);
  }
});

const rating = asyncHandler(async (req, res) => {
  const { id } = req.user;
  const { star, productId } = req.body;
  try {
    const product = await Productdb.findById(productId);
    let alreadyRated = product.ratings.find(
      (userId) => userId.postedBy.toString() === id.toString()
    );
    if (alreadyRated) {
      const updateRating = await Productdb.updateOne(
        {
          ratings: { $elemMatch: alreadyRated },
        },
        {
          $set: { "ratings.$.star": star },
        },
        {
          new: true,
        }
      );
    } else {
      const rateProduct = await Productdb.findByIdAndUpdate(
        productId,
        {
          $push: {
            ratings: {
              star: star,
              postedBy: id,
            },
          },
        },
        {
          new: true,
        }
      );
    }
    const getAllratings = await Productdb.findById(productId);
    let totalRating = getAllratings.ratings.length;
    let ratingSum = getAllratings.ratings
      .map((item) => item.star)
      .reduce((prev, curr) => prev + curr, 0);
      //average of all the ratings
    let actualrating = Math.round(ratingSum / totalRating);
    let finalproduct = await Productdb.findByIdAndUpdate(
      productId,
      {
        totalrating: actualrating,
      },
      { new: true }
    );
    res.json(finalproduct);
  } catch (error) {
    throw new Error(error);
  }
});
module.exports = {
  createProduct,
  getProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
  addToWishlist,
  rating,
};
