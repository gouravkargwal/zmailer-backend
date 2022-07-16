const Campaign = require("../model/campaignModel");
const Tracking = require("../model/trackingModel");

exports.tracking = async (req, res) => {
  try {
    let name = req.body.name;
    console.log(req.body.name);
    const trackingImagePath = `/trackingImage/${req.file.filename}`;
    let imagePath = trackingImagePath;
    console.log(name, imagePath);
    const saveImage = await Tracking.create({
      name: name,
      imagePath: imagePath,
    });
    console.log(saveImage);
  } catch (error) {
    console.error(error);
  }
};

exports.trackingData = async (req, res) => {
  try {
    console.log(req.query);
    const { emailid } = req.query;

    const updateCampaignData = await Campaign.findOneAndUpdate(emailid, {
      $inc: { opened: 1 },
    });
    console.log(updateCampaignData);
    if (updateCampaignData) {
      res.status(200).json({
        message: "Tracking Update Successfully",
        data: updateCampaignData,
      });
    } else {
      res.status(404).json({
        error: "Tracking Update Failed",
      });
    }
  } catch (error) {
    if (error.name === "CastError") {
      res.status(404).json({
        error: "Tracking Update Failed",
        errorObj: error,
      });
    }
  }
};
