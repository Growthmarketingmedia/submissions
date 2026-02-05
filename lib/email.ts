import { Resend } from 'resend';

// Lazy initialization to avoid build-time errors
function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY environment variable is not set');
  }
  return new Resend(apiKey);
}

export interface EmailData {
  websiteName: string;
  websiteUrl: string;
  formData: Record<string, any>;
  submissionId: string;
  timestamp: string;
}

export async function sendSubmissionEmail(data: EmailData): Promise<boolean> {
  try {
    const resend = getResendClient();
    const notificationEmail = process.env.NOTIFICATION_EMAIL || 'your@email.com';

    // Format form data as HTML
    const formDataHtml = Object.entries(data.formData)
      .map(([key, value]) => `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${key}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${value}</td>
        </tr>
      `)
      .join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; background: white; }
            .meta { font-size: 12px; color: #666; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>🎯 New Form Submission</h2>
              <p style="margin: 0;">From: ${data.websiteName}</p>
            </div>
            <div class="content">
              <p><strong>Website:</strong> <a href="${data.websiteUrl}">${data.websiteUrl}</a></p>
              
              <h3>Form Data:</h3>
              <table>
                <tbody>
                  ${formDataHtml}
                </tbody>
              </table>
              
              <div class="meta">
                <p><strong>Submission ID:</strong> ${data.submissionId}</p>
                <p><strong>Timestamp:</strong> ${new Date(data.timestamp).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    await resend.emails.send({
      from: 'Form Submissions <onboarding@resend.dev>',
      to: notificationEmail,
      subject: `New Submission from ${data.websiteName}`,
      html: htmlContent,
    });

    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}
