var express = require('express');
var router = express.Router();
let Product = require('../models/product');
let Category = require('../models/category');
const mongoose = require('mongoose');

//insert product
router.post('/insert', async function (req, res, next) {

    try {

        let request = req.body;
        let name = request.name;
        let mrp = request.mrp;
        let categoryIds = request.categoryIds;
        let userRole = request.userRole;

        /* user authentication */
        if (userRole == CONSTANTS.SUPERVISOR) {
            throw {
                msg: 'Admin only not allow add products'
            }
        }

        if (name == null || name == "" || name == undefined) {
            throw { msg: "Name can't be blank" }
        } else if (mrp == null || mrp == "" || mrp == undefined) {
            throw { msg: "Mrp can't be blank" }
        } else if (isNaN(mrp)) {
            throw { msg: "Mrp can't be blank" }
        } else if (categoryIds == null || categoryIds == "" || categoryIds == undefined) {
            throw { msg: "Minimum One Category mandatory" }
        } else if (!Array.isArray(categoryIds)) {
            throw { msg: "Categories must be in array format" }
        }

        for (let i = 0; i < categoryIds.length; i++) {
            /* check id for valid or not */
            let category = await Category.findById(new mongoose.Types.ObjectId(categoryIds[i]));

            if (category == null) {
                throw {
                    msg: "Invalid CategoryId : " + categoryIds[i]
                };
            }
        }

        /* 
        RegExp object to make a regex with a variable, add the 'i' flag if you want the search to be case insensitive
        */
        const nameRegex = new RegExp(name, 'i');
        let category = await Product.findOne({ "name": nameRegex });
        if (category) {
            throw { msg: "Category details is already exist.. please enter another" };
        }

        /* sotoring to database */
        const ProductModel = new Product({
            _id: new mongoose.Types.ObjectId(),
            name: name,
            mrp: mrp,
            categoryIds: categoryIds
        });

        await ProductModel.save();

        /* response */
        res.status(200).json({
            succes: true,
            message: "Product details created"
        })
    } catch (err) {
        /* response */
        res.status(200).json({
            succes: false,
            message: err.msg == undefined ? "Something Went Wrong" : err.msg
        })
    }

});

/* update product by id */
router.post('/update', async function (req, res, next) {

    try {

        let request = req.body;
        let id = request.id;
        let name = request.name;
        let mrp = request.mrp;
        let categoryIds = request.categoryIds;
        let userRole = request.userRole;

        /* user authentication */
        if (userRole == CONSTANTS.SUPERVISOR) {
            throw {
                msg: 'Admin only not allow update products'
            }
        }

        /* body validation */
        if (id == null || id == "" || id == undefined) {
            throw { msg: "Id can't be blank" }
        } else if (name == null || name == "" || name == undefined) {
            throw { msg: "Name can't be blank" }
        } else if (mrp == null || mrp == "" || mrp == undefined) {
            throw { msg: "Mrp can't be blank" }
        } else if (isNaN(mrp)) {
            throw { msg: "Mrp can't be blank" }
        } else if (categoryIds == null || categoryIds == "" || categoryIds == undefined) {
            throw { msg: "Minimum One Category mandatory" }
        } else if (!Array.isArray(categoryIds)) {
            throw { msg: "Categories must be in array format" }
        }


        for (let i = 0; i < categoryIds.length; i++) {
            /* check id for valid or not */
            let category = await Category.findById(new mongoose.Types.ObjectId(categoryIds[i]));

            if (category == null) {
                throw {
                    msg: "Invalid CategoryId : " + categoryIds[i]
                };
            }
        }


        /* 
        RegExp object to make a regex with a variable, add the 'i' flag if you want the search to be case insensitive
        */
        const nameRegex = new RegExp(name, 'i');
        let product = await Product.findOne(
            {
                "name": nameRegex,
                _id: {
                    $ne: new mongoose.Types.ObjectId(id)
                }
            });
        if (product) {
            throw { msg: "Product details is already exist.. please enter another" };
        }

        /* updating to database */
        await
            Product.findByIdAndUpdate(new mongoose.Types.ObjectId(id), {
                $set: {
                    name: request.name,
                    mrp: mrp,
                    categoryIds: categoryIds
                }
            });

        /* response */
        res.status(200).json({
            succes: true,
            message: "Product details updated"
        });
    } catch (err) {
        /* response */
        res.status(200).json({
            succes: false,
            message: err.msg == undefined ? "Something Went Wrong" : err.msg
        })
    }

});

/* get product details by id */
router.get('/get-product-details/:id', async function (req, res, next) {

    try {

        let id = req.params.id;

        /* body validation */
        if (id == null || id == "" || id == undefined) {
            throw { msg: "Id can't be blank" }
        }

        /* find product details by id with needed keys */
        let product = await Product.findById(new mongoose.Types.ObjectId(id), "_id name mrp categoryIds");

        /* response */
        res.status(200).json({
            succes: true,
            product: product
        })

    } catch (exception) {
        /* response */
        res.status(200).json({
            succes: false,
            message: err.msg == undefined ? "Something Went Wrong" : err.msg
        })
    }

});

/* delete product by id */
router.get('/delete/:id', async function (req, res, next) {

    try {

        let id = req.params.id;
        let userRole = req.body.userRole;

        /* user authentication */
        if (userRole == CONSTANTS.SUPERVISOR) {
            throw {
                msg: 'Admin only not allow delete products'
            }
        }

        /* check id for valid or not */
        let product = await Product.findById(new mongoose.Types.ObjectId(id));

        if (product == null) {
            throw {
                msg: "Invalid Request"
            };
        }

        /* delete product details by id */
        await
            Product.deleteOne({ _id: new mongoose.Types.ObjectId(id) }, function (err) {
                if (err) {
                    throw err;
                }
                return res;
            });

        /* response */
        res.status(200).json({
            succes: true,
            message: "Product Deleted"
        })
    } catch (err) {
        /* response */
        res.status(200).json({
            succes: false,
            message: err.msg == undefined ? "Something Went Wrong" : err.msg
        })
    }
});

/* fetch products by pagination */
router.post('/fetch-products', async function (req, res, next) {

    try {

        let request = req.body;
        let pageNumber = request.pageNumber;
        let pageSize = request.pageSize;

        /* skip count calculate */
        if (pageSize != 0 && pageNumber != 0) {
            page = (pageSize * (pageNumber - 1));
        }

        /* find products with needed keys */
        let products = await Product.find({}, "_id name mrp categoryIds").skip(page).limit(pageSize).sort({ _id: -1 });

        /* response */
        res.status(200).json({
            succes: true,
            categories: products
        });

    } catch (exception) {
        /* response */
        res.status(200).json({
            succes: false,
            message: "Something Went Wrong"
        })
    }

});

/* fetch product by category */
router.post('/fetch-product-by-category/:categoryId', async function (req, res, next) {

    try {

        let categoryId = req.params.categoryId;
        let request = req.body;
        let pageNumber = request.pageNumber;
        let pageSize = request.pageSize;

        /* skip count calculate */
        if (pageSize != 0 && pageNumber != 0) {
            page = (pageSize * (pageNumber - 1));
        }

        /* find products with needed keys */
        let products = await Product.find({
            categoryIds: {
                $in: [categoryId]
            }
        }, "_id name mrp categoryIds").skip(page).limit(pageSize).sort({ _id: -1 });

        /* response */
        res.status(200).json({
            succes: true,
            products: products
        });

    } catch (exception) {
        /* response */
        res.status(200).json({
            succes: false,
            message: "Something Went Wrong"
        })
    }

});

module.exports = router;