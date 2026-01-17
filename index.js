import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());


const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_PASS = process.env.GMAIL_PASS;


function createHtmlEmail(name, email, subject, phone, message) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif;background-color:#f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 0;">
        <table width="600" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
          <tr>
            <td style="background:linear-gradient(135deg,#667eea,#764ba2);padding:40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;">New Contact Message</h1>
              <p style="margin-top:10px;color:#e0e7ff;font-size:14px;">You have received a new inquiry</p>
            </td>
          </tr>

          <tr>
            <td style="padding:40px;">
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
              <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
              <p><strong>Subject:</strong> ${subject || "No subject"}</p>

              <hr />

              <p><strong>Message:</strong></p>
              <p style="white-space:pre-wrap;">${message}</p>

              <p style="text-align:center;margin-top:30px;">
                <a href="mailto:${email}"
                   style="padding:12px 30px;background:#667eea;color:#ffffff;text-decoration:none;border-radius:6px;">
                  Reply to ${name}
                </a>
              </p>
            </td>
          </tr>

          <tr>
            <td style="background:#f8f9fa;padding:20px;text-align:center;font-size:12px;color:#6b7280;">
              This message was sent from your website contact form
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});


app.post("/send-email", async (req, res) => {
    console.log("req.body",req.body)
  const { name, email, subject, phone, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    console.log("testing 1")
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
    //   requireTLS: true,
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_PASS,
      },
    //   connectionTimeout: 10000,
    //   socketTimeout: 10000,
    });
    console.log("testing",GMAIL_USER,GMAIL_PASS)

    const mailOptions = {
      from: GMAIL_USER,
      to: GMAIL_USER,
      subject: `New Contact: ${subject || "Contact Form Submission"}`,
      priority: "high",
      text: `Name: ${name}
Email: ${email}
Phone: ${phone}
Subject: ${subject}

Message:
${message}`,
      html: createHtmlEmail(name, email, subject, phone, message),
    };

    await transporter.sendMail(mailOptions);
    console.log("testing")
    res.json({ success: true });
  } catch (error) {
    console.log("error",error)
    res.status(500).json({ error: error.message });
  }
});


const PORT = 5000;

// app.listen(PORT, "127.0.0.1", () => {
//   console.log("STARTING NODE SERVER");
// });
app.listen(PORT, () => {
  console.log("STARTING NODE SERVER");
});

