const User = require("../model/userModal");

exports.getUser = async (req, res) => {
  try {
    let getUser = User.find({});
    let total = User.countDocuments({});
    if (req.query.page) {
      const page = parseInt(req.query.page || "0");
      const PAGE_SIZE = 5;
      total = await total;
      getUser = await getUser.limit(PAGE_SIZE).skip(PAGE_SIZE * page);
      if (getUser) {
        res.status(200).json({
          message: "Data send successfully!",
          body: {
            total: Math.ceil(total / PAGE_SIZE),
            getUser,
          },
        });
      } else {
        res.status(404).json({
          error: "Error in fetching data",
        });
      }
    } else {
      getUser = await getUser;
      if (getUser) {
        res.status(200).json({
          message: "Data send successfully!",
          body: {
            getUser,
          },
        });
      } else {
        res.status(404).json({
          error: "Error in fetching data",
        });
      }
    }
  } catch (error) {
    res.status(404).json({
      error: "Error in fetching data",
    });
  }
};

exports.addUser = async (req, res) => {
  try {
    const { sender } = req.body;
    User.findOne({ sender }, async function (err, user) {
      if (err) throw err;
      if (user) {
        res.status(404).json({
          code: 404,
          error: "User already exists!!",
        });
        return;
      }
      const newUser = await User.create({ sender: sender });
      // console.log(newUser);
      if (newUser) {
        res.status(200).json({
          message: "User added successfully!",
        });
      } else {
        res.status(404).json({
          code: 404,
          msg: "User creation failed!",
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      msg: "Something went wrong",
    });
  }
};
exports.deleteUser = async (req, res) => {
  try {
    console.log(req.body);
    const { senderId } = req.body;
    User.findOneAndDelete({ senderId }, async function (err, user) {
      if (err) throw err;
      if (user) {
        res.status(200).json({
          code: 200,
          message: "User deleted successfully!!",
        });
        return;
      } else {
        res.status(404).json({
          code: 404,
          error: "User deletion failed!",
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      error: "Something went wrong",
    });
  }
};
