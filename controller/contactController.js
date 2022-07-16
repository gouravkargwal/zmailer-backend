const fs = require("fs");
const csv = require("csvtojson");
const Contact = require("../model/contactModel");
const EmailList = require("../model/emailListModel");

exports.addContact = async (req, res) => {
  try {
    if (req.file.filename) {
      console.log("Hello");
      let gd = await JSON.parse(JSON.stringify(req.body));
      const csvFilePath = `./csv/${req.file.filename}`;
      let result = await csv().fromFile(csvFilePath);
      if (result) {
        let emailList = { name: req.body.group, count: result.length };

        const emailListData = await EmailList.create(emailList);

        let emailListDataString = JSON.stringify(emailListData);
        let emailListDataObject = JSON.parse(emailListDataString);
        let campId = emailListDataObject._id;
        if (emailListData) {
          let sendData;
          for (let i = 0; i < result.length; i++) {
            let data = {
              firstname: result[i].firstname,
              lastname: result[i].lastname,
              email: result[i].email,
              emailinglistid: campId,
            };

            sendData = await Contact.create(data);
          }
          if (sendData) {
            const filePath = csvFilePath;
            fs.unlink(filePath, function (err) {
              if (err && err.code == "ENOENT") {
                // file doens't exist
                console.info("File doesn't exist, won't remove it.");
              } else if (err) {
                // other errors, e.g. maybe we don't have enough permission
                console.error("Error occurred while trying to remove file");
              } else {
                console.info(`removed`);
              }
            });
            res.status(200).json({
              message: "File upload successful!",
            });
          } else {
            res.status(404).json({
              error: "File upload failed!",
            });
          }
        } else {
          res.status(404).json({
            error: "File upload failed!",
          });
        }
      }
    } else {
      console.log("file fetching else");
      res.status(404).json({
        error: "File fetching failed!",
      });
    }
  } catch (error) {
    res.status(500).json({
      error: "Something went wrong!",
    });
  }
};

exports.getContact = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || "0";
    const PAGE_SIZE = 5;
    const getContact = await EmailList.find({})
      .select("name count")
      .skip(PAGE_SIZE * page)
      .limit(PAGE_SIZE);

    const total = await EmailList.countDocuments();

    if (getContact) {
      res.status(200).json({
        message: "Data fetched successfully!",
        body: {
          getContact,
          total: Math.ceil((total + 1) / PAGE_SIZE),
        },
      });
    } else {
      res.status(404).json({
        error: "Data fetch failed!",
      });
    }
  } catch (error) {
    res.status(500).json({
      error: "Something went wrong!",
    });
  }
};

exports.deleteContact = async (req, res) => {
  try {
    console.log(req.body);
    const { emailinglistid } = req.body;
    const deletedContact = await Contact.deleteMany({
      emailinglistid: { $in: emailinglistid },
    });
    console.log(deletedContact);
    const deletedList = await EmailList.findByIdAndDelete({
      _id: emailinglistid,
    });
    console.log(deletedList, "list");
    if (deletedContact.deletedCount != 0 && deletedList.deletedCount != 0) {
      res.status(200).json({
        code: 200,
        message: "Contact deleted successfully!!",
      });
    } else {
      res.status(404).json({
        code: 404,
        error: "Contact deletion failed!",
      });
    }
  } catch (error) {
    res.status(500).json({
      code: 500,
      error: "Something went wrong",
    });
  }
};
