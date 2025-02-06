import { TransactionalEmailsApi, SendSmtpEmail, Configuration } from '@getbrevo/brevo';

if (!process.env.BREVO_API_KEY) {
  console.error('BREVO_API_KEY is not set in environment variables');
  throw new Error('BREVO_API_KEY is required');
}

// Create configuration with API key
const configuration = new Configuration({
  apiKey: process.env.BREVO_API_KEY
});

// Initialize API instance with configuration
const apiInstance = new TransactionalEmailsApi(configuration);

interface EmailParams {
  to: { email: string; name: string };
  subject: string;
  htmlContent: string;
}

interface SMSParams {
  phoneNumber: string;
  message: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    console.log('Attempting to send email to:', params.to.email);
    const sendSmtpEmail = new SendSmtpEmail();
    sendSmtpEmail.subject = params.subject;
    sendSmtpEmail.htmlContent = params.htmlContent;
    sendSmtpEmail.sender = { name: "Points System", email: "points@yourdomain.com" };
    sendSmtpEmail.to = [params.to];

    console.log('Sending email with Brevo...');
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('Email sent successfully, response:', result);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    return false;
  }
}

export async function sendSMS(params: SMSParams): Promise<boolean> {
  try {
    console.log('Attempting to send SMS to:', params.phoneNumber);
    const response = await fetch('https://api.brevo.com/v3/transactionalSMS/sms', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY!,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        type: 'transactional',
        sender: 'Points',
        recipient: params.phoneNumber,
        content: params.message,
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('SMS sent successfully, response:', result);
    return true;
  } catch (error) {
    console.error('Error sending SMS:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    return false;
  }
}

export function generatePointsUpdateEmail(params: {
  customerName: string;
  points: number;
  newTotal: number;
  tier: string;
  description: string;
}): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Points Update Notification</h2>
      <p>Hello ${params.customerName},</p>
      <p>Your points have been updated!</p>

      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Points Added:</strong> ${params.points.toLocaleString()}</p>
        <p style="margin: 5px 0;"><strong>New Total:</strong> ${params.newTotal.toLocaleString()}</p>
        <p style="margin: 5px 0;"><strong>Current Tier:</strong> ${params.tier}</p>
        <p style="margin: 5px 0;"><strong>Reason:</strong> ${params.description}</p>
      </div>

      <p>Thank you for being a valued member!</p>
    </div>
  `;
}

export function generatePointsUpdateSMS(params: {
  points: number;
  newTotal: number;
  tier: string;
}): string {
  return `Points Update: ${params.points > 0 ? '+' : ''}${params.points.toLocaleString()} points. New total: ${params.newTotal.toLocaleString()}. Current tier: ${params.tier}.`;
}
