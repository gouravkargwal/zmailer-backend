const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

const Contact = require("../model/contactModel");
const Campaign = require("../model/campaignModel");
const Unsubscribe = require("../model/unsubscribeModel");
const EmailList = require("../model/emailListModel");
const Domain = require("../model/domainModel");
const User = require("../model/userModal");
const appConstant = require("./../constant/appConstant");
const { v4: uuidv4 } = require("uuid");
const createHttpError = require("http-errors");

exports.sendMail = async (req, res, next) => {
  try {
    const { campaign, sender, subject, html, receiver, domain } = req.body;
    let receiverList = await Contact.find({
      emailinglistid: receiver,
      unsubscribe: false,
    });
    if (receiverList.length === 0) {
      console.log("No one here");
      res.status(404).json({
        message: "No email address found!",
      });
    } else {
      console.log(receiverList.length);
      let domainInfo = await Domain.findById({ _id: domain });
      console.log(domainInfo);
      let senderName = await User.findById({ _id: sender });
      console.log(senderName.sender);
      let transporter = nodemailer.createTransport({
        host: "mail.cashbite.in",
        port: 587,
        secure: false,
        auth: {
          user: "gourav",
          pass: 9414318317,
        },
        dkim: {
          domainName: domainInfo.domain,
          keySelector: domainInfo.selector,
          privateKey: fs.readFileSync(
            path.join(__dirname, `../keys/${domainInfo.domain}.pem`),
            "utf8"
          ),
          cacheDir: "/tmp",
          cacheTreshold: 100 * 1024,
        },
      });
      let count = 0;
      const campid = uuidv4();
      receiverList.map(async (el, index) => {
        let editedHtml = html.replace(
          "{tracking_pixel}",
          `<img src = "https://team.cashbite.in/images/file1636461555016rebookoffer.php?emailid=${el.email}"
              alt="image"
              width="1px" height="1px">`
        );
        editedHtml = editedHtml.replace(
          "{unsubscribe_link}",
          `<a href=${appConstant.default.baseURL}/unsubscribe?userid=${el._id}&campid=${campid}">Click here</a>`
        );
        if (html.includes("{receiver_name}")) {
          editedHtml = editedHtml.replace("{receiver_name}", el.firstname);
        }
        if (html.includes("{receiver_email}")) {
          editedHtml = editedHtml.replace("{receiver_email}", el.email);
        }
        if (html.includes("{sender_name}")) {
          editedHtml = editedHtml.replace("{sender_name}", senderName.sender);
        }
        if (html.includes("{sender_email}")) {
          editedHtml = editedHtml.replace(
            "{sender_email}",
            `${senderName.sender}@${domainSet.domain}`
          );
        }
        count++;
        let info = await transporter.sendMail({
          from: `The FlipShope Team <${senderName.sender}@${domainSet.domain}>`,
          to: `<${el.email}>`,
          subject: `${subject}`,
          html: `${editedHtml}`,
          date: new Date(),
        });
        console.log(info);
      });
      res.status(200).json({
        message: "Mail send successfully!",
      });
      let bounces = receiverList.length - count;
      let campaignData = {
        name: campaign,
        emailinglist: receiver,
        mailsent: count,
        campid: campid,
        requested: receiverList.length,
        bounces,
      };
      const campaignDataSave = await Campaign.create(campaignData);
      console.log(campaignDataSave);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Something went wrong!",
    });
  }
};

exports.sendTestMail = async (req, res, next) => {
  try {
    const { campaign, sender, subject, html, receiver, domain } = req.body;
    console.log(req.body);
    let transporter = nodemailer.createTransport({
      host: "mail.cashbite.in",
      port: 587,
      secure: false,
      auth: {
        user: "gourav",
        pass: 9414318317,
      },
      dkim: {
        domainName: `${domain}`,
        keySelector: "mail",
        privateKey: fs.readFileSync(
          path.join(__dirname, `../keys/${domain}.pem`),
          "utf8"
        ),
        cacheDir: "/tmp",
        cacheTreshold: 100 * 1024,
      },
    });
    let editedHtml = html;
    // editedHtml = editedHtml.replace(
    //   "{unsubscribe_link}",
    //   `${appConstant.default.baseURL}/unsubscribe`
    // );
    // if (html.includes("{receiver_email}")) {
    //   editedHtml = editedHtml.replace("{receiver_email}", receiver);
    // }
    // if (html.includes("{sender_name}")) {
    //   editedHtml = editedHtml.replace("{sender_name}", sender);
    // }
    // if (html.includes("{sender_email}")) {
    //   editedHtml = editedHtml.replace("{sender_email}", `${sender}${domain}`);
    // }
    let info = await transporter.sendMail({
      from: `The FlipShope Team <${sender}@${domain}>`,
      to: `<${receiver}>`,
      subject: `${subject}`,
      text: `${editedHtml}`,
      date: new Date(),
    });
    console.log(info);
    res.status(200).json({
      message: "Mail send successfully!",
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
exports.unsubscribe = async (req, res) => {
  try {
    console.log(req.query);
    const { campid, userid } = req.query;
    const unsubscribeList = await Unsubscribe.create({
      campid: campid,
      userid: userid,
    });
    if (unsubscribeList) {
      const emailinglistid = await Campaign.findOne({ campid: campid });
      if (emailinglistid) {
        const unsubscribeContact = await Contact.findOneAndUpdate(
          {
            _id: userid,
            emailinglistid: emailinglistid.emailinglist,
          },
          { unsubscribe: true }
        );
        if (unsubscribeContact) {
          res.status(200).json({
            message: "Unsubscribe Successful!",
          });
        } else {
          res.status(404).json({
            error: "Unsubscribe Failed!",
          });
        }
      }
    } else {
      res.status(404).json({
        error: "Unsubscribe Failed!",
      });
    }
  } catch (error) {
    res.status(500).json({
      error: "Something went wrong!",
    });
  }
};

exports.getGroup = async (req, res) => {
  try {
    const emailingListName = await EmailList.find({}).select("name");
    console.log(emailingListName);
    if (emailingListName) {
      res.status(200).json({
        body: emailingListName,
      });
    } else {
      res.status(404).json({
        error: "Error in fetching data!",
      });
    }
  } catch (error) {
    res.status(500).json({
      error: "Something went wrong",
    });
  }
};

exports.getCampaign = async (req, res) => {
  console.log(req.query);
  try {
    const page = parseInt(req.query.page) || 0;
    const PAGE_SIZE = 5;
    const getCampaign = await Campaign.find({})
      .skip(PAGE_SIZE * page)
      .limit(PAGE_SIZE);
    const total = await Campaign.countDocuments();
    console.log(total);
    console.log(getCampaign);
    if (getCampaign) {
      res.status(200).json({
        message: "Data fetched successfully!",
        body: {
          getCampaign: getCampaign,
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

// exports.getRecentCampaign = async (req, res) => {
//   try {
//     const getCampaign = await Campaign.findOne({})
//       .sort({ createdAt: -1 })
//       .select("-_id");
//     console.log(getCampaign);

//     if (!getCampaign) throw createHttpError.NotFound();

//     const graphData = [getCampaign.requested];

//     console.log(graphData);

//     res.status(200).json({
//       message: "Data fetched successfully!",
//       body: getCampaign,
//     });
//   } catch (error) {
//     res.status(500).json({
//       error: "Something went wrong!",
//     });
//   }
// };

exports.getRecentCampaign = async (req, res) => {
  try {
    const getCampaign = await Campaign.findOne({})
      .sort({ createdAt: -1 })
      .select("-_id");
    console.log(getCampaign);

    if (!getCampaign) throw createHttpError.NotFound();

    const graphData = [
      getCampaign.requested,
      getCampaign.mailsent,
      getCampaign.noopened,
      getCampaign.noclicked,
      getCampaign.bounces,
    ];

    console.log(graphData);

    res.status(200).json({
      message: "Data fetched successfully!",
      body: {
        getCampaign,
        graphData,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: "Something went wrong!",
    });
  }
};

exports.getSpecificCampaign = async (req, res) => {
  try {
    const { campid } = req.params;
    console.log(campid);
    const getCampaign = await Campaign.findOne({ campid }).select("-_id");
    console.log(getCampaign);

    if (!getCampaign) throw createHttpError.NotFound();

    const graphData = [
      getCampaign.requested,
      getCampaign.mailsent,
      getCampaign.noopened,
      getCampaign.noclicked,
      getCampaign.bounces,
    ];

    console.log(graphData);

    res.status(200).json({
      message: "Data fetched successfully!",
      body: {
        getCampaign,
        graphData,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Something went wrong!",
    });
  }
};
