import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendNotificationEmail(
  documentTitle: string,
  documentContent?: string,
  fileName?: string,
  fileUrl?: string
) {
  // Support multiple emails (comma-separated) or single email
  const notificationEmails = process.env.NOTIFICATION_EMAIL || 'M7mdrf3t0@gmail.com'
  const emailList = notificationEmails.split(',').map(email => email.trim())

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: emailList, // Can be a single email string or array of emails
      subject: `New Documentation Uploaded: ${documentTitle}`,
      html: `
        <h2>New Documentation Uploaded</h2>
        <p><strong>Title:</strong> ${documentTitle}</p>
        ${documentContent ? `<p><strong>Content:</strong> ${documentContent.substring(0, 500)}...</p>` : ''}
        ${fileName ? `
          <p><strong>File:</strong> ${fileName}</p>
          ${fileUrl ? `<p><a href="${fileUrl}" target="_blank">Download File</a></p>` : ''}
        ` : ''}
        <p>Please check your Supabase database for the full details.</p>
      `,
    })
    return { success: true }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error }
  }
}

