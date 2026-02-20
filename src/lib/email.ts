import { Resend } from 'resend';

// ─── Resend Client ──────────────────────────────────────────────────────────

const resendApiKey = process.env.RESEND_API_KEY;

const resend = resendApiKey ? new Resend(resendApiKey) : null;

const FROM_EMAIL = process.env.EMAIL_FROM || 'Bashert <noreply@bashert.app>';

// ─── Generic Send Helper ────────────────────────────────────────────────────

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail({ to, subject, html }: SendEmailParams): Promise<void> {
  if (!resend) {
    console.log(`[Email] RESEND_API_KEY not set. Would send to: ${to}`);
    console.log(`[Email] Subject: ${subject}`);
    console.log(`[Email] Body preview: ${html.slice(0, 200)}...`);
    return;
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

    if (error) {
      console.error(`[Email] Failed to send to ${to}:`, error);
    }
  } catch (err) {
    console.error(`[Email] Unexpected error sending to ${to}:`, err);
  }
}

// ─── RTL HTML Wrapper ───────────────────────────────────────────────────────

function wrapHtml(bodyContent: string): string {
  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body {
      font-family: 'Heebo', Arial, sans-serif;
      direction: rtl;
      text-align: start;
      background-color: #f9fafb;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      padding: 32px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      margin-block-end: 24px;
      padding-block-end: 16px;
      border-block-end: 2px solid #e5e7eb;
    }
    .header h1 {
      color: #7c3aed;
      font-size: 24px;
      margin: 0;
    }
    .content {
      color: #374151;
      font-size: 16px;
      line-height: 1.6;
    }
    .highlight {
      color: #7c3aed;
      font-weight: bold;
    }
    .footer {
      margin-block-start: 24px;
      padding-block-start: 16px;
      border-block-start: 1px solid #e5e7eb;
      text-align: center;
      color: #9ca3af;
      font-size: 13px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>בשערט</h1>
    </div>
    <div class="content">
      ${bodyContent}
    </div>
    <div class="footer">
      <p>הודעה זו נשלחה ממערכת בשערט</p>
    </div>
  </div>
</body>
</html>`;
}

// ─── Interest Confirmation (to requester's creator) ─────────────────────────

export async function sendInterestConfirmation(
  to: string,
  requesterName: string,
  targetName: string,
  eventName: string
): Promise<void> {
  const html = wrapHtml(`
    <p>שלום,</p>
    <p>
      בקשת העניין של <span class="highlight">${requesterName}</span>
      כלפי <span class="highlight">${targetName}</span>
      באירוע <span class="highlight">${eventName}</span>
      התקבלה בהצלחה.
    </p>
    <p>השדכן/ית המוקצה לאירוע יבדוק/תבדוק את הבקשה ויעדכן אותך בהמשך.</p>
    <p>בהצלחה!</p>
  `);

  await sendEmail({
    to,
    subject: `בשערט - בקשת עניין נשלחה בהצלחה (${eventName})`,
    html,
  });
}

// ─── New Request Notification (to shadchan) ─────────────────────────────────

export async function sendNewRequestToShadchan(
  to: string,
  shadchanName: string,
  requesterName: string,
  targetName: string,
  eventName: string
): Promise<void> {
  const html = wrapHtml(`
    <p>שלום ${shadchanName},</p>
    <p>
      התקבלה בקשת עניין חדשה באירוע <span class="highlight">${eventName}</span>:
    </p>
    <p>
      <span class="highlight">${requesterName}</span>
      מעוניין/ת ב-<span class="highlight">${targetName}</span>
    </p>
    <p>היכנס/י ללוח הבקרה של השדכן כדי לבדוק ולעדכן את הבקשה.</p>
  `);

  await sendEmail({
    to,
    subject: `בשערט - בקשת עניין חדשה באירוע ${eventName}`,
    html,
  });
}

// ─── Status Change Notification (to request creator) ────────────────────────

const statusLabels: Record<string, string> = {
  pending: 'ממתינה',
  reviewed: 'נבדקה',
  approved: 'אושרה',
  rejected: 'נדחתה',
  archived: 'הועברה לארכיון',
};

export async function sendStatusChangeNotification(
  to: string,
  userName: string,
  targetName: string,
  eventName: string,
  newStatus: string
): Promise<void> {
  const statusLabel = statusLabels[newStatus] || newStatus;

  const html = wrapHtml(`
    <p>שלום ${userName},</p>
    <p>
      סטטוס בקשת העניין שלך כלפי <span class="highlight">${targetName}</span>
      באירוע <span class="highlight">${eventName}</span>
      עודכן ל: <span class="highlight">${statusLabel}</span>
    </p>
    <p>היכנס/י למערכת לפרטים נוספים.</p>
  `);

  await sendEmail({
    to,
    subject: `בשערט - עדכון סטטוס בקשת עניין (${eventName})`,
    html,
  });
}
