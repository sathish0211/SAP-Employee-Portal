const express = require("express");
const axios = require("axios");
const xml2js = require("xml2js");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// SAP ODATA Login URL (Base URL)
const SAP_ODATA_BASE =
  "http://172.17.19.24:8000/sap/opu/odata/sap/ZSG_EMP_ODATA_890_SRV";

// SAP Basic Authentication
const SAP_USERNAME = "k901890";
const SAP_PASSWORD = "Sathish@gp0212";

// -------------------------------
// LOGIN API
// -------------------------------
app.post("/login", async (req, res) => {
  const { employeeId, password } = req.body;

  // Example:
  // /ZSG_EMP_LOGINSet(Employeeid='00000001',Password='SATHISH@GP0212')
  const loginURL = `${SAP_ODATA_BASE}/ZSG_EMP_LOGINSet(Employeeid='${employeeId}',Password='${encodeURIComponent(
    password
  )}')`;

  try {
    const response = await axios.get(loginURL, {
      headers: {
        Accept: "application/xml",
      },
      auth: {
        username: SAP_USERNAME,
        password: SAP_PASSWORD,
      },
    });

    // Convert XML to JSON
    xml2js.parseString(
      response.data,
      { explicitArray: false },
      (err, result) => {
        if (err) {
          return res.status(500).json({ message: "XML Parsing Failed" });
        }

        const entry = result.entry?.content?.["m:properties"];

        if (!entry) {
          return res.status(400).json({
            success: false,
            message: "Invalid SAP Response",
          });
        }

        const empId = entry["d:Employeeid"];
        const msg = entry["d:Password"]; // SAP returns "Login Successful"

        return res.json({
          success: msg === "Login Successful",
          employeeId: empId,
          message: msg,
        });
      }
    );
  } catch (error) {
    console.log("SAP Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "SAP Connection Failed",
      error: error.message,
    });
  }
});


// --------------------------------------
// GET EMPLOYEE PROFILE API
// --------------------------------------
app.get("/profile/:employeeId", async (req, res) => {
  const employeeId = req.params.employeeId.padStart(8, "0");

  const url = `${SAP_ODATA_BASE}/ZSG_EMP_PROFILESet?$filter=Pernr eq '${employeeId}'`;

  try {
    const response = await axios.get(url, {
      headers: {
        Accept: "application/xml"
      },
      auth: {
        username: SAP_USERNAME,
        password: SAP_PASSWORD
      }
    });

    xml2js.parseString(
      response.data,
      { explicitArray: false },
      (err, result) => {

        if (err) {
          return res.status(500).json({ success: false, message: "XML Parsing Failed" });
        }

        const entry = result?.feed?.entry;

        if (!entry) {
          return res.json({
            success: false,
            message: "Employee Profile Not Found"
          });
        }

        const p = entry.content["m:properties"];

        return res.json({
          success: true,
          data: {
            Pernr: p["d:Pernr"],
            Fname: p["d:Fname"],
            Lname: p["d:Lname"],
            Gender: p["d:Gender"] === "1" ? "Male" : "Female",
            Address: p["d:Address"],
            City: p["d:City"],
            State: p["d:State"],
            Country: p["d:Country"],
            Nationality: p["d:Nationality"],
            CompanyCode: p["d:CompanyCode"],
            CostCenter: p["d:CostCenter"],
            JobPosition: p["d:JobPosition"],
            Job: p["d:Job"]
          }
        });

      }
    );

  } catch (error) {
    console.log("SAP Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "SAP Connection Failed",
      error: error.message
    });
  }
});

// -------------------------------
// GET LEAVE REQUESTS API
// -------------------------------
app.get("/leave/:employeeId", async (req, res) => {
  const employeeId = req.params.employeeId.padStart(8, "0");

  const lrURL = `${SAP_ODATA_BASE}/ZSG_EMP_LRSet?$filter=Empid eq '${employeeId}'`;

  try {
    const response = await axios.get(lrURL, {
      headers: { Accept: "application/xml" },
      auth: {
        username: SAP_USERNAME,
        password: SAP_PASSWORD
      }
    });

    xml2js.parseString(
      response.data,
      { explicitArray: false },
      (err, result) => {
        if (err) {
          return res.status(500).json({ message: "XML Parsing Error" });
        }

        const entries = result.feed?.entry;

        if (!entries) {
          return res.json({
            success: true,
            data: []
          });
        }

        // Ensure entries is an array
        const list = Array.isArray(entries) ? entries : [entries];

        const leaveRequests = list.map(entry => {
          const p = entry.content["m:properties"];
          return {
            Empid: p["d:Empid"],
            Sdate: p["d:Sdate"],
            Edate: p["d:Edate"],
            Category: p["d:Category"],
            Descrip: p["d:Descrip"],
            Qtype: p["d:Qtype"],
            Qtime: p["d:Qtime"],
            Qstart: p["d:Qstart"],
            Qend: p["d:Qend"]
          };
        });

        return res.json({
          success: true,
          count: leaveRequests.length,
          data: leaveRequests
        });
      }
    );
  } catch (error) {
    console.log("SAP Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "SAP Connection Failed",
      error: error.message
    });
  }
});


// -------------------------------
// GET PAY SLIP API
// -------------------------------
app.get("/payslip/:employeeId", async (req, res) => {
  const employeeId = req.params.employeeId.padStart(8, "0");

  const psURL = `${SAP_ODATA_BASE}/ZSG_EMP_PSSet?$filter=EmpId eq '${employeeId}'`;

  try {
    const response = await axios.get(psURL, {
      headers: { Accept: "application/xml" },
      auth: {
        username: SAP_USERNAME,
        password: SAP_PASSWORD
      }
    });

    xml2js.parseString(
      response.data,
      { explicitArray: false },
      (err, result) => {
        if (err) {
          return res.status(500).json({ message: "XML Parsing Error" });
        }

        const entries = result.feed?.entry;

        if (!entries) {
          return res.json({
            success: true,
            data: []
          });
        }

        // Always convert to array
        const list = Array.isArray(entries) ? entries : [entries];

        const paySlips = list.map(entry => {
          const p = entry.content["m:properties"];
          return {
            EmpId: p["d:EmpId"],
            CompanyCode: p["d:CompanyCode"],
            CostCenter: p["d:CostCenter"],
            Stell: p["d:Stell"],
            Name: p["d:Name"],
            Gender: p["d:Gender"] === "1" ? "Male" : "Female",
            Nationality: p["d:Nationality"],
            PscaleGroup: p["d:PscaleGroup"],
            PsLevel: p["d:PsLevel"],
            Amount: p["d:Amount"],
            WageType: p["d:WageType"],
            CurrencyKey: p["d:CurrencyKey"],
            WorkingHours: p["d:WorkingHours"]
          };
        });

        return res.json({
          success: true,
          count: paySlips.length,
          data: paySlips
        });
      }
    );
  } catch (error) {
    console.log("SAP Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "SAP Connection Failed",
      error: error.message
    });
  }
});

// --------------------------------------
// PAYSLIP PDF (PREVIEW + DOWNLOAD)
// --------------------------------------
app.get("/payslip-pdf/:employeeId", async (req, res) => {
  const employeeId = req.params.employeeId.padStart(8, "0");
  const mode = req.query.mode || "preview"; // preview OR download

  const pdfURL = `${SAP_ODATA_BASE}/ZSG_EMP_PS_PDFSet(EMPID='${employeeId}')/$value`;

  try {
    const response = await axios.get(pdfURL, {
      responseType: "arraybuffer",
      headers: { Accept: "application/pdf" },
      auth: {
        username: SAP_USERNAME,
        password: SAP_PASSWORD
      }
    });

    // Always send PDF
    res.setHeader("Content-Type", "application/pdf");

    // Select inline (view) or attachment (download)
    if (mode === "download") {
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=payslip_${employeeId}.pdf`
      );
    } else {
      res.setHeader("Content-Disposition", "inline"); // VIEW only
    }

    return res.send(response.data);

  } catch (error) {
    console.log("SAP PDF Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to get PaySlip PDF",
      error: error.message
    });
  }
});


// --------------------------------------
// SEND PAYSLIP PDF TO EMAIL
// --------------------------------------
app.post("/send-payslip-email", async (req, res) => {
  const { employeeId, email } = req.body;

  if (!employeeId || !email) {
    return res.status(400).json({
      success: false,
      message: "Employee ID and email are required."
    });
  }

  const paddedId = employeeId.padStart(8, "0");
  const pdfURL = `${SAP_ODATA_BASE}/ZSG_EMP_PS_PDFSet(EMPID='${paddedId}')/$value`;

  try {
    // 1️⃣ Fetch PDF from SAP
    const response = await axios.get(pdfURL, {
      responseType: "arraybuffer",
      headers: { Accept: "application/pdf" },
      auth: {
        username: SAP_USERNAME,
        password: SAP_PASSWORD
      }
    });

    const pdfBuffer = response.data;

    // 2️⃣ Configure email
    const nodemailer = require("nodemailer");

    const transporter = nodemailer.createTransport({
      service: "gmail", // or SMTP config
      auth: {
        user: "sathishgp0212@gmail.com",
        pass: "tzqmmnolnmpkpbcx" // Use App Password for Gmail
      }
    });

    // 3️⃣ Email Options
    const mailOptions = {
      from: "sathishgp0212@gmail.com",
      to: email,
      subject: `PaySlip - Employee ${paddedId}`,
      text: "Please find your Pay Slip attached.",
      attachments: [
        {
          filename: `Payslip_${paddedId}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf"
        }
      ]
    };

    // 4️⃣ Send Email
    await transporter.sendMail(mailOptions);

    return res.json({
      success: true,
      message: `PaySlip sent to ${email}`
    });

  } catch (error) {
    console.error("Email Send Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to send PaySlip email",
      error: error.message
    });
  }
});


// -------------------------------
// START SERVER
// -------------------------------
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
