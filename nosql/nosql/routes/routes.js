const express = require("express");
const router = express.Router();
const Product = require("../models/products");
const multer = require("multer");
const fs = require("fs");

// image upload
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  },
});

var upload = multer({
  storage: storage,
}).single("image");

// Insert an product into database route
router.post("/add", upload, (req, res) => {
  const product = new Product({
    name: req.body.name,
    quantity: req.body.quantity,
    price: req.body.price,
    image: req.file.filename,
  });
  product.save((err) => {
    if (err) {
      res.json({ message: err.message, type: "danger" });
    } else {
      req.session.message = {
        type: "success",
        message: "Product added successfully!",
      };
      res.redirect("/");
    }
  });
});

// Get all products route
router.get("/", (req, res) => {
  Product.find().exec((err, products) => {
    if (err) {
      res.json({ message: err.message });
    } else {
      res.render("index", {
        title: "Home Page",
        products: products,
      });
    }
  });
});

router.get("/views/about.ejs", (req, res) => {
  Product.find().exec((err, products) => {
    if (err) {
      res.json({ message: err.message });
    } else {
      res.render("about", {
        title: "About Us",
        products: products,
      });
    }
  });
});

router.get("/add", (req, res) => {
  res.render("add_products", { title: "Add products" });
});

// Edit an product route
router.get("/edit/:id", (req, res) => {
  let id = req.params.id;
  Product.findById(id, (err, product) => {
    if (err) {
      res.redirect("/");
    } else {
      if (product == null) {
        res.redirect("/");
      } else {
        res.render("edit_products", {
          title: "Edit Product",
          product: product,
        });
      }
    }
  });
});

//update product route
router.post("/update/:id", upload, (req, res) => {
  let id = req.params.id;
  let new_image = "";

  if (req.file) {
    new_image = req.file.filename;
    try {
      fs.unlinkSync("./uploads/" + req.body.old_image);
    } catch (err) {
      console.log(err);
    }
  } else {
    new_image = req.body.old_image;
  }

  Product.findByIdAndUpdate(
    id,
    {
      name: req.body.name,
      quantity: req.body.quantity,
      price: req.body.price,
      image: new_image,
    },
    (err, result) => {
      if (err) {
        res.json({ message: err.message, type: "danger" });
      } else {
        req.session.message = {
          type: "success",
          message: "Product updated successfully!",
        };
        res.redirect("/");
      }
    }
  );
});

// Delete product route
router.get("/delete/:id", (req, res) => {
  let id = req.params.id;
  Product.findByIdAndRemove(id, (err, result) => {
    if (result.image != "") {
      try {
        fs.unlinkSync("./uploads/" + result.image);
      } catch (err) {
        console.log(err);
      }
    }

    if (err) {
      res.json({ message: err.message });
    } else {
      req.session.message = {
        type: "info",
        message: "Product deleted succesfully!",
      };
      res.redirect("/");
    }
  });
});

module.exports = router;
