import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { to, subject, message } = await request.json();

    if (!to || !subject || !message) {
      return NextResponse.json(
        { error: "Missing required fields: to, subject, message" },
        { status: 400 }
      );
    }

    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL;
    const senderName = process.env.BREVO_SENDER_NAME;

    if (!apiKey || !senderEmail || !senderName) {
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 }
      );
    }

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender: {
          name: senderName,
          email: senderEmail,
        },
        to: [
          {
            email: to,
          },
        ],
        subject: subject,
        htmlContent: `
          <!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>${subject}</title>
              <style>
                * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
                }
                
                body {
                  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Helvetica, Arial, sans-serif;
                  background: #fafafa;
                  min-height: 100vh;
                  color: #1d1d1f;
                  line-height: 1.47059;
                  font-weight: 400;
                  letter-spacing: -0.022em;
                }
                
                .header {
                  background: #ffffff;
                  border-bottom: 1px solid #e5e5e5;
                  padding: 16px 0;
                  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
                }
                
                .header-content {
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 0 24px;
                  text-align: center;
                }
                
                .logo {
                  font-size: 20px;
                  font-weight: 600;
                  color: #1d1d1f;
                }
                
                .container {
                  max-width: 600px;
                  margin: 40px auto;
                  padding: 0 24px;
                }
                
                h1 {
                  font-size: 32px;
                  font-weight: 600;
                  color: #1d1d1f;
                  margin-bottom: 12px;
                }
                
                .message-section {
                  background: #ffffff;
                  border: 1px solid #e5e5e5;
                  border-radius: 18px;
                  padding: 40px;
                  margin-bottom: 24px;
                }
                
                .message-content {
                  font-size: 15px;
                  color: #1d1d1f;
                  line-height: 1.6;
                  white-space: pre-wrap;
                  word-wrap: break-word;
                }
                
                .info-box {
                  background: #f5f5f7;
                  border: 1px solid #e5e5e5;
                  padding: 20px;
                  border-radius: 12px;
                  margin-top: 24px;
                  text-align: center;
                }
                
                .info-box p {
                  font-size: 13px;
                  color: #6e6e73;
                  margin: 4px 0;
                }
                
                .footer {
                  text-align: center;
                  margin-top: 40px;
                  padding-top: 24px;
                  border-top: 1px solid #e5e5e5;
                }
                
                .footer p {
                  font-size: 12px;
                  color: #6e6e73;
                  margin: 4px 0;
                }
              </style>
            </head>
            <body>
              <div class="header">
                <div class="header-content">
                  <div class="logo">Sync</div>
                </div>
              </div>
              
              <div class="container">
                <h1>${subject}</h1>
                
                <div class="message-section">
                  <div class="message-content">${message}</div>
                </div>
                
                <div class="info-box">
                  <p><strong>Powered by Sync</strong></p>
                  <p>Multi-Cloud Services Platform</p>
                  <p>Email Service via Brevo API</p>
                </div>
                
                <div class="footer">
                  <p>This email was sent from Sync - Your Multi-Cloud Platform</p>
                  <p>© 2025 Sync. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: "Failed to send email", details: error },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      messageId: data.messageId,
      message: "Email sent successfully",
    });
  } catch (error) {
    console.error("Email sending error:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
