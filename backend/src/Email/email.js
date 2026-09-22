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