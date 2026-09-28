import "dotenv/config";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_SERVER,
  port: Number(process.env.MAIL_PORT || 465),
  secure: Number(process.env.MAIL_PORT || 465) === 465,
  auth: {
    user: process.env.OTP_EMAIL,
    pass: process.env.OTP_EMAIL_PASS,
  },
});
const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
// 
export const sendContactEmails = async ({
  name,
  email,
  phone,
  subject,
  message,
}) => {
  const receiver =
    process.env.CONTACT_RECEIVER || "arbazirfan14@gmail.com";

  // Email to admin
  await transporter.sendMail({
    from: `"AI Course Website" <${process.env.OTP_EMAIL}>`,
    to: receiver,
    replyTo: email,
    subject: `New Course Inquiry - ${subject}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:650px;margin:auto;color:#222;">
        
        <div style="
          background:#7c3aed;
          color:white;
          padding:24px;
          border-radius:16px 16px 0 0;
        ">
          <h2 style="margin:0;">New Website Inquiry</h2>
          <p style="margin:8px 0 0;">AI Course Website</p>
        </div>

        <div style="
          padding:25px;
          border:1px solid #eee;
          border-top:none;
          border-radius:0 0 16px 16px;
        ">

          <p><strong>Name:</strong> ${name}</p>

          <p>
            <strong>Email:</strong>
            <a href="mailto:${email}">
              ${email}
            </a>
          </p>

          <p>
            <strong>Phone:</strong>
            ${phone || "Not provided"}
          </p>

          <p>
            <strong>Subject:</strong>
            ${subject}
          </p>

          <hr style="border:none;border-top:1px solid #eee;margin:25px 0;" />

          <p><strong>Message:</strong></p>

          <p style="
            line-height:1.7;
            background:#f7f3ff;
            padding:18px;
            border-radius:12px;
          ">
            ${message}
          </p>

        </div>
      </div>
    `,
  });

  // Confirmation email to user
  await transporter.sendMail({
    from: `"AI Course Team" <${process.env.OTP_EMAIL}>`,
    to: email,
    subject: "We received your inquiry",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:650px;margin:auto;color:#222;">

        <div style="
          background:#7c3aed;
          color:white;
          padding:28px;
          border-radius:16px 16px 0 0;
        ">
          <h2 style="margin:0;">Thanks, ${name}! 👋</h2>
        </div>

        <div style="
          padding:28px;
          border:1px solid #eee;
          border-top:none;
          border-radius:0 0 16px 16px;
        ">

          <p style="font-size:16px;line-height:1.7;">
            We have received your inquiry successfully.
          </p>

          <p style="font-size:16px;line-height:1.7;">
            Our team will review your message and get back to you as soon
            as possible.
          </p>

          <div style="
            background:#efffd8;
            padding:18px;
            border-radius:12px;
            margin:24px 0;
          ">
            <strong>Your inquiry:</strong>

            <p style="margin-bottom:0;line-height:1.6;">
              ${message}
            </p>
          </div>

          <p style="color:#777;font-size:14px;">
            You do not need to reply to this automated confirmation email.
          </p>

          <p style="margin-top:28px;">
            Regards,<br />
            <strong>AI Course Team</strong>
          </p>

        </div>
      </div>
    `,
  });
};


export const sendVerificationOtp = async ({
  firstName,
  email,
  otp,
}) => {
  const safeFirstName =
    escapeHtml(firstName || "there");

  const safeOtp =
    escapeHtml(String(otp));

  await transporter.sendMail({
    from: `"AI Course Team" <${process.env.OTP_EMAIL}>`,
    to: email,

    subject: "Verify your email - AI Course",

    text: `
Hi ${firstName || "there"},

Your AI Course verification code is:

${otp}

This code will expire in 10 minutes.

If you did not create this account, you can ignore this email.

AI Course Team
        `.trim(),

    html: `
            <div
                style="
                    font-family: Arial, sans-serif;
                    max-width: 620px;
                    margin: 0 auto;
                    color: #21172f;
                "
            >
                <div
                    style="
                        background: linear-gradient(
                            135deg,
                            #8B5CF6,
                            #7c3aed
                        );
                        color: white;
                        padding: 30px;
                        border-radius: 18px 18px 0 0;
                        text-align: center;
                    "
                >
                    <h1
                        style="
                            margin: 0;
                            font-size: 26px;
                        "
                    >
                        Verify Your Email
                    </h1>

                    <p
                        style="
                            margin: 10px 0 0;
                            opacity: 0.9;
                        "
                    >
                        AI Course
                    </p>
                </div>

                <div
                    style="
                        border: 1px solid #ede9fe;
                        border-top: none;
                        padding: 30px;
                        border-radius: 0 0 18px 18px;
                    "
                >
                    <p style="font-size: 16px;">
                        Hi
                        <strong>
                            ${safeFirstName}
                        </strong>,
                    </p>

                    <p
                        style="
                            font-size: 16px;
                            line-height: 1.7;
                        "
                    >
                        Use the verification code below
                        to verify your AI Course account.
                    </p>

                    <div
                        style="
                            background: #EDE9FE;
                            border-radius: 16px;
                            padding: 24px;
                            margin: 26px 0;
                            text-align: center;
                        "
                    >
                        <div
                            style="
                                font-size: 13px;
                                color: #6b5b7d;
                                margin-bottom: 8px;
                            "
                        >
                            YOUR VERIFICATION CODE
                        </div>

                        <div
                            style="
                                font-size: 36px;
                                font-weight: 700;
                                letter-spacing: 8px;
                                color: #7c3aed;
                            "
                        >
                            ${safeOtp}
                        </div>
                    </div>

                    <p
                        style="
                            font-size: 14px;
                            color: #6b7280;
                            line-height: 1.6;
                        "
                    >
                        This code expires in
                        <strong>10 minutes</strong>.
                    </p>

                    <p
                        style="
                            font-size: 14px;
                            color: #6b7280;
                            line-height: 1.6;
                        "
                    >
                        If you did not create this account,
                        simply ignore this email.
                    </p>

                    <div
                        style="
                            margin-top: 28px;
                            background: #efffd8;
                            border-radius: 12px;
                            padding: 16px;
                            font-size: 13px;
                            color: #4b5563;
                        "
                    >
                        Never share your verification code
                        with anyone.
                    </div>

                    <p style="margin-top: 28px;">
                        Regards,<br />
                        <strong>AI Course Team</strong>
                    </p>
                </div>
            </div>
        `,
  });
};