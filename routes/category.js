var express = require('express');
var router = express.Router();
let Category = require('../models/category');
const mongoose = require('mongoose');
let CONSTANTS = require('../utils/constant')

//insert category
router.post('/insert', async function (req, res, next) {

    try {

        let request = req.body;
        let name = request.name;
        let categoryId = request.categoryId;
        let userRole = request.userRole;
        if (name == null || name == "" || name == undefined) {
            throw { msg: "Name can't be blank" }
        }

        if (categoryId != null && categoryId != undefined) {
            /* check id for valid or not */
            let category = await Category.findById(new mongoose.Types.ObjectId(categoryId));

            if (category == null) {
                throw {
                    msg: "Invalid CategoryId"
                };
            }
        } else {
            categoryId = null;
            if (userRole == CONSTANTS.SUPERVISOR) {
                throw {
                    msg: 'Supervisor only allow to add sub categories'
                }
            }
        }

        /* 
        RegExp object to make a regex with a variable, add the 'i' flag if you want the search to be case insensitive
        */
        const nameRegex = new RegExp(name, 'i');
        let category = await Category.findOne({ "name": nameRegex });
        if (category) {
            throw { msg: "Category details is already exist.. please enter another" };
        }

        /* sotoring to database */
        const CategoryModel = new Category({
            _id: new mongoose.Types.ObjectId(),
            name: name,
            categoryId: categoryId
        });

        await CategoryModel.save();

        /* response */
        res.status(200).json({
            succes: true,
            message: "Category details created"
        })
    } catch (err) {
        /* response */
        res.status(200).json({
            succes: false,
            message: err.msg == undefined ? "Something Went Wrong" : err.msg
        })
    }

});

/* update category by id */
router.post('/update', async function (req, res, next) {

    try {

        let request = req.body;
        let id = request.id;
        let name = request.name;
        let categoryId = request.categoryId;
        let userRole = request.userRole;
        /* body validation */
        if (id == null || id == "" || id == undefined) {
            throw { msg: "Id can't be blank" }
        } else if (name == null || name == "" || name == undefined) {
            throw { msg: "Name can't be blank" }
        }

        if (categoryId != null && categoryId != undefined) {
            /* check id for valid or not */
            let category = await Category.findById(new mongoose.Types.ObjectId(categoryId));

            if (category == null) {
                throw {
                    msg: "Invalid CategoryId"
                };
            }
        } else {
            categoryId = null;
            if (userRole == CONSTANTS.SUPERVISOR) {
                throw {
                    msg: 'Supervisor only allow to update sub categories'
                }
            }
        }

        /* 
        RegExp object to make a regex with a variable, add the 'i' flag if you want the search to be case insensitive
        */
        const nameRegex = new RegExp(name, 'i');
        let category = await Category.findOne(
            {
                "name": nameRegex,
                _id: {
                    $ne: new mongoose.Types.ObjectId(id)
                }
            });
        if (category) {
            throw { msg: "Category details is already exist.. please enter another" };
        }

        /* updating to database */
        await
            Category.findByIdAndUpdate(new mongoose.Types.ObjectId(id), {
                $set: {
                    name: request.name,
                    categoryId: categoryId
                }
            });

        /* response */
        res.status(200).json({
            succes: true,
            message: "Category details updated"
        });
    } catch (err) {
        /* response */
        res.status(200).json({
            succes: false,
            message: err.msg == undefined ? "Something Went Wrong" : err.msg
        })
    }

});

/* get category details by id */
router.get('/get-category-details/:id', async function (req, res, next) {

    try {

        let id = req.params.id;

        /* body validation */
        if (id == null || id == "" || id == undefined) {
            throw { msg: "Id can't be blank" }
        }

        /* find category details by id with needed keys */
        let category = await Category.findById(new mongoose.Types.ObjectId(id), "_id name categoryId");

        /* response */
        res.status(200).json({
            succes: true,
            category: category
        })

    } catch (exception) {
        /* response */
        res.status(200).json({
            succes: false,
            message: err.msg == undefined ? "Something Went Wrong" : err.msg
        })
    }

});

/* delete category by id */
router.get('/delete/:id', async function (req, res, next) {

    try {

        let id = req.params.id;
        let userRole = req.body.userRole;

        /* check id for valid or not */
        let category = await Category.findById(new mongoose.Types.ObjectId(id));

        if (category == null) {
            throw {
                msg: "Invalid Request"
            };
        }

        if (category.categoryId == null) {
            if (userRole == CONSTANTS.SUPERVISOR) {
                throw {
                    msg: 'Supervisor only allow to update sub categories'
                }
            }
        }

        /* delete category details by id */
        await
            Category.deleteOne({ _id: new mongoose.Types.ObjectId(id) }, function (err) {
                if (err) {
                    throw err;
                }
                return res;
            });

        /* response */
        res.status(200).json({
            succes: true,
            message: "Category Deleted"
        })
    } catch (err) {
        /* response */
        res.status(200).json({
            succes: false,
            message: err.msg == undefined ? "Something Went Wrong" : err.msg
        })
    }
});

/* fetch categories by pagination */
router.get('/fetch-categories', async function (req, res, next) {

    try {

        /* find categories with needed keys */
        let categories = await Category.find({ categoryId: null }, "_id name");

        /* response */
        res.status(200).json({
            succes: true,
            categories: categories
        });

    } catch (exception) {
        /* response */
        res.status(200).json({
            succes: false,
            message: "Something Went Wrong"
        })
    }

});

/* fetch categories by pagination */
router.get('/fetch-sub-categories/:categoryId', async function (req, res, next) {

    try {

        let categoryId = req.params.categoryId;

        /* find categories with needed keys */
        let categories = await Category.find({ categoryId: categoryId }, "_id name");

        /* response */
        res.status(200).json({
            succes: true,
            categories: categories
        });

    } catch (exception) {
        /* response */
        res.status(200).json({
            succes: false,
            message: "Something Went Wrong"
        })
    }

});

/* get all categories with sub categories */
let getAllCategories = async (categoryId) => {

    /* find categories with needed keys */
    let categories = await Category.find({ categoryId: categoryId }, "_id name");


    for (let i = 0; i < categories.length; i++) {
        let category = (categories[i]);
        console.log(category.id);
        /* find categories with needed keys */
        let sub_categories = await getAllCategories(categories[i].id);
        categories[i] = {
            id: category.id,
            name: category.name,
            sub_categories: sub_categories
        };
    }

    console.log(categories);
    return categories;
}

/* fetch all categories by level */
router.get('/fetch-all-categories', async function (req, res, next) {

    try {

        let categories = await getAllCategories(null);

        /* response */
        res.status(200).json({
            succes: true,
            categories: categories
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