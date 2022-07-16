const fs = require("fs");
const createHttpError = require("http-errors");
const Domain = require("../model/domainModel");

exports.getDomain = async (req, res) => {
  try {
    let getDomain = Domain.find({});
    let total = Domain.countDocuments({});
    if (req.query.page) {
      const page = parseInt(req.query.page || "0");
      const PAGE_SIZE = 5;
      total = await total;
      getDomain = await getDomain.limit(PAGE_SIZE).skip(PAGE_SIZE * page);
      if (getDomain) {
        res.status(200).json({
          message: "Data send successfully!",
          body: {
            total: Math.ceil(total / PAGE_SIZE),
            getDomain,
          },
        });
      } else {
        res.status(404).json({
          error: "Error in fetching data",
        });
      }
    } else {
      getDomain = await getDomain;
      if (getDomain) {
        res.status(200).json({
          message: "Data send successfully!",
          body: {
            getDomain,
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
exports.addDomain = async (req, res) => {
  try {
    const { domain, selector, dkim } = req.body;
    Domain.findOne({ domain }, async function (err, domainExist) {
      if (err) throw err;
      if (domainExist) {
        console.log("Here");
        res.status(404).json({
          code: 404,
          error: "Domain already exists!!",
        });
        return;
      }
      const newDomain = await Domain.create({ domain, selector });
      if (!newDomain) throw createHttpError.NotImplemented();

      fs.writeFile(`./keys/${domain}.pem`, dkim, (err) => {
        if (err) throw createHttpError.InsufficientStorage("File not created!");
        else {
          res.status(200).json({
            message: "Domain added successfully!",
          });
        }
      });
    });
  } catch (error) {
    next(createHttpError.InternalServerError());
  }
};
exports.deleteDomain = async (req, res) => {
  try {
    console.log(req.body);
    const { domainId } = req.body;
    Domain.findOneAndDelete({ domainId }, async function (err, domain) {
      if (err) throw createHttpError.NotFound("Domain not found!");
      if (domain) {
        fs.unlink(`./keys/${domain.domain}.pem`, (err, result) => {
          if (err)
            throw createHttpError.InternalServerError("Domain not deleted!");
          res.status(200).json({
            code: 200,
            message: "Domain deleted successfully!!",
          });
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
