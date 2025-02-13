import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'exped.browser@gmail.com', // Create this email for the browser
    pass: process.env.EMAIL_PASSWORD, // Set up an app-specific password
  },
});

export async function POST(request: Request) {
  try {
    const { name, message } = await request.json();

    const mailOptions = {
      from: 'exped.browser@gmail.com',
      to: 'SaMiLMelhem23@gmail.com',
      subject: `Exped Browser Feedback from ${name}`,
      text: message,
      replyTo: 'noreply@exped.browser',
    };

    await transporter.sendMail(mailOptions);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error sending feedback:', error);
    return new Response(JSON.stringify({ error: 'Failed to send feedback' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}