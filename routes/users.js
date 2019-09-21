var express = require('express');
var router = express.Router();
let User = require('../models/user');
let FUNC = require('../utils/functions')
const mongoose = require('mongoose');

//insert user
router.post('/insert', async function (req, res, next) {

  try {

    let request = req.body;
    let name = request.name;
    let emailId = request.emailId;
    let mobNo = request.mobNo;
    let role = request.role;
    let username = request.username;
    let password = request.password;
    if (name == null || name == "" || name == undefined) {
      throw { msg: "Name can't be blank" }
    } else if (emailId == null || emailId == "" || emailId == undefined) {
      throw { msg: "Email-Id can't be blank" }
    } else if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(emailId))) {
      /* 
      Example of valid email id

      mysite@ourearth.com
      my.ownsite@ourearth.org
      mysite@you.me.net
      Example of invalid email id

      mysite.ourearth.com [@ is not present]
      mysite@.com.my [ tld (Top Level domain) can not start with dot "." ]
      @you.me.net [ No character before @ ]
      mysite123@gmail.b [ ".b" is not a valid tld ]
      mysite@.org.org [ tld can not start with dot "." ]
      .mysite@mysite.org [ an email should not be start with "." ]
      mysite()*@gmail.com [ here the regular expression only allows character, digit, underscore, and dash ]
      mysite..1234@yahoo.com [double dots are not allowed]
      */
      throw { msg: "Invalid Email Id" }
    } else if (mobNo == null || mobNo == "" || mobNo == undefined) {
      throw { msg: "Mobile No can't be blank" }
    } else if (isNaN(mobNo)) {
      throw { msg: "Invalid Mobile No" }
    } else if (role == null || role == "" || role == undefined) {
      throw { msg: "Role can't be blank" }
    } else if (!(['ADMIN', 'SUPERVISOR']).includes(role)) {
      throw { msg: "Invalid Role" }
    } else if (username == null || username == "" || username == undefined) {
      throw { msg: "username can't be blank" }
    } else if (password == null || password == "" || password == undefined) {
      throw { msg: "Password can't be blank" }
    }

    /* 
      RegExp object to make a regex with a variable, add the 'i' flag if you want the search to be case insensitive
    */
    const usernameRegex = new RegExp(username, 'i');
    let user = await User.findOne({ "username": usernameRegex });
    if (user) {
      throw { msg: "User with same user name already exist" };
    }

    /* sotoring to database */
    const UserModel = new User({
      _id: new mongoose.Types.ObjectId(),
      name: name,
      emailId: emailId,
      mobno: mobNo,
      role: role,
      username: username,
      password: FUNC.encodedPassword(password)
    });

    await UserModel.save();

    /* response */
    res.status(200).json({
      succes: true,
      message: "User details created"
    })
  } catch (err) {
    /* response */
    res.status(200).json({
      succes: false,
      message: err.msg == undefined ? "Something Went Wrong" : err.msg
    })
  }

});

/* update user by id */
router.post('/update', async function (req, res, next) {

  try {

    let request = req.body;
    let id = request.id;
    let name = request.name;
    let emailId = request.emailId;
    let mobNo = request.mobNo;
    let role = request.role;
    let username = request.username;
    let password = request.password;

    if (id == null || id == "" || id == undefined) {
      throw { msg: "Id can't be blank" }
    } else if (name == null || name == "" || name == undefined) {
      throw { msg: "Name can't be blank" }
    } else if (emailId == null || emailId == "" || emailId == undefined) {
      throw { msg: "Email-Id can't be blank" }
    } else if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(emailId))) {
      /* 
      Example of valid email id

      mysite@ourearth.com
      my.ownsite@ourearth.org
      mysite@you.me.net
      Example of invalid email id

      mysite.ourearth.com [@ is not present]
      mysite@.com.my [ tld (Top Level domain) can not start with dot "." ]
      @you.me.net [ No character before @ ]
      mysite123@gmail.b [ ".b" is not a valid tld ]
      mysite@.org.org [ tld can not start with dot "." ]
      .mysite@mysite.org [ an email should not be start with "." ]
      mysite()*@gmail.com [ here the regular expression only allows character, digit, underscore, and dash ]
      mysite..1234@yahoo.com [double dots are not allowed]
      */
      throw { msg: "Invalid Email Id" }
    } else if (mobNo == null || mobNo == "" || mobNo == undefined) {
      throw { msg: "Mobile No can't be blank" }
    } else if (isNaN(mobNo)) {
      throw { msg: "Invalid Mobile No" }
    } else if (role == null || role == "" || role == undefined) {
      throw { msg: "Role can't be blank" }
    } else if (!(['ADMIN', 'SUPERVISOR']).includes(role)) {
      throw { msg: "Invalid Role" }
    } else if (username == null || username == "" || username == undefined) {
      throw { msg: "username can't be blank" }
    } else if (password == null || password == "" || password == undefined) {
      throw { msg: "Password can't be blank" }
    }

    /* 
      RegExp object to make a regex with a variable, add the 'i' flag if you want the search to be case insensitive
    */
    const usernameRegex = new RegExp(username, 'i');
    let user = await User.findOne({
      "username": usernameRegex,
      _id: {
        $ne: new mongoose.Types.ObjectId(id)
      }
    });
    if (user) {
      throw { msg: "User with same user name already exist" };
    }

    /* update user details */
    await UserModel.findByIdAndUpdate(new mongoose.Types.ObjectId(id), {
      name: name,
      emailId: emailId,
      mobno: mobNo,
      role: role,
      username: username,
      password: FUNC.encodedPassword(password)
    });

    /* response */
    res.status(200).json({
      succes: true,
      message: "User details updated"
    })
  } catch (err) {
    /* response */
    res.status(200).json({
      succes: false,
      message: err.msg == undefined ? "Something Went Wrong" : err.msg
    })
  }

});

/* get user details by id */
router.get('/get-user-details/:id', async function (req, res, next) {

  try {

    let id = req.params.id;

    /* body validation */
    if (id == null || id == "" || id == undefined) {
      throw { msg: "Id can't be blank" }
    }

    /* find user details by id with needed keys */
    let user = await User.findById(new mongoose.Types.ObjectId(id), "_id name emailId mobno role username");

    /* response */
    res.status(200).json({
      succes: true,
      user: user
    })

  } catch (exception) {
    /* response */
    res.status(200).json({
      succes: false,
      message: err.msg == undefined ? "Something Went Wrong" : err.msg
    })
  }

});

/* delete user by id */
router.get('/delete/:id', async function (req, res, next) {

  try {

    let id = req.params.id;

    /* check id for valid or not */
    let user = await User.findById(new mongoose.Types.ObjectId(id));

    if (user == null) {
      throw {
        msg: "Invalid Request"
      };
    }

    /* delete user details by id */
    await
      User.deleteOne({ _id: new mongoose.Types.ObjectId(id) }, function (err) {
        if (err) {
          throw err;
        }
        return res;
      });

    /* response */
    res.status(200).json({
      succes: true,
      message: "User Deleted"
    })
  } catch (err) {
    /* response */
    res.status(200).json({
      succes: false,
      message: err.msg == undefined ? "Something Went Wrong" : err.msg
    })
  }
});

/* fetch users by pagination */
router.get('/fetch-users', async function (req, res, next) {

  try {

    /* find users with needed keys */
    let users = await User.find({ categoryId: null }, "_id name emailId mobno role username");

    /* response */
    res.status(200).json({
      succes: true,
      users: users
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
