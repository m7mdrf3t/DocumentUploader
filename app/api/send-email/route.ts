import { NextRequest, NextResponse } from 'next/server'
import { sendNotificationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { title, content, fileName, fileUrl } = await request.json()

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    const result = await sendNotificationEmail(title, content, fileName, fileUrl)

    if (result.success) {
      return NextResponse.json({ message: 'Email sent successfully' })
    } else {
      return NextResponse.json(
        { error: 'Failed to send email', details: result.error },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Error in send-email API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

