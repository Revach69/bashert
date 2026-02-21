import { Resend } from 'resend';
import { isRtl } from '@/i18n/config';

// ─── HTML Escape Helper ────────────────────────────────────────────────────

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ─── Translation Interpolation Helper ──────────────────────────────────────

/**
 * Replaces `{key}` placeholders in a translation string with provided values.
 * Values are HTML-escaped before insertion.
 * After interpolation, converts `<highlight>...</highlight>` tags to
 * `<span class="highlight">...</span>` for email HTML rendering.
 */
function interpolate(
  template: string,
  vars: Record<string, string>
): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), escapeHtml(value));
  }
  // Convert <highlight> tags to styled spans
  result = result
    .replace(/<highlight>/g, '<span class="highlight">')
    .replace(/<\/highlight>/g, '</span>');
  return result;
}

// ─── Translation Loader ───────────────────────────────────────────────────

interface EmailTranslations {
  email: Record<string, string>;
  status: Record<string, string>;
  common: Record<string, string>;
  landing: Record<string, string>;
}

/**
 * Loads translations for a given locale from the messages JSON files.
 * Falls back to Hebrew ('he') if the requested locale file is not found.
 */
async function getEmailTranslations(
  locale: string = 'he'
): Promise<EmailTranslations> {
  try {
    const messages = (
      await import(`../messages/${locale}.json`)
    ).default;
    return {
      email: messages.email as Record<string, string>,
      status: messages.status as Record<string, string>,
      common: messages.common as Record<string, string>,
      landing: messages.landing as Record<string, string>,
    };
  } catch {
    // Fallback to Hebrew if locale file not found
    const messages = (await import('../messages/he.json')).default;
    return {
      email: messages.email as Record<string, string>,
      status: messages.status as Record<string, string>,
      common: messages.common as Record<string, string>,
      landing: messages.landing as Record<string, string>,
    };
  }
}

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

// ─── Locale-Aware HTML Wrapper ──────────────────────────────────────────────

function wrapHtml(
  bodyContent: string,
  appName: string,
  footerText: string,
  locale: string = 'he'
): string {
  const rtl = isRtl(locale);
  const dir = rtl ? 'rtl' : 'ltr';
  const fontFamily = rtl
    ? "'Heebo', Arial, sans-serif"
    : "Arial, 'Helvetica Neue', sans-serif";

  return `<!DOCTYPE html>
<html lang="${locale}" dir="${dir}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body {
      font-family: ${fontFamily};
      direction: ${dir};
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
      <h1>${escapeHtml(appName)}</h1>
    </div>
    <div class="content">
      ${bodyContent}
    </div>
    <div class="footer">
      <p>${escapeHtml(footerText)}</p>
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
  eventName: string,
  locale?: string
): Promise<void> {
  const effectiveLocale = locale || 'he';
  const t = await getEmailTranslations(effectiveLocale);

  const greeting = t.email.greeting;
  const body = interpolate(t.email.interestConfirmationBody, {
    requester: requesterName,
    target: targetName,
    event: eventName,
  });
  const followUp = t.email.interestConfirmationFollowUp;
  const goodLuck = t.email.goodLuck;

  const html = wrapHtml(
    `
    <p>${escapeHtml(greeting)},</p>
    <p>${body}</p>
    <p>${escapeHtml(followUp)}</p>
    <p>${escapeHtml(goodLuck)}</p>
  `,
    t.common.appName,
    t.landing.emailSentFrom,
    effectiveLocale
  );

  const subject = interpolate(t.email.interestConfirmationSubject, {
    event: eventName,
  });

  await sendEmail({ to, subject, html });
}

// ─── New Request Notification (to shadchan) ─────────────────────────────────

export async function sendNewRequestToShadchan(
  to: string,
  shadchanName: string,
  requesterName: string,
  targetName: string,
  eventName: string,
  locale?: string
): Promise<void> {
  const effectiveLocale = locale || 'he';
  const t = await getEmailTranslations(effectiveLocale);

  const greeting = interpolate(t.email.greetingName, {
    name: shadchanName,
  });
  const body = interpolate(t.email.newRequestBody, {
    event: eventName,
  });
  const detail = interpolate(t.email.newRequestDetail, {
    requester: requesterName,
    target: targetName,
  });
  const action = t.email.newRequestAction;

  const html = wrapHtml(
    `
    <p>${greeting}</p>
    <p>${body}</p>
    <p>${detail}</p>
    <p>${escapeHtml(action)}</p>
  `,
    t.common.appName,
    t.landing.emailSentFrom,
    effectiveLocale
  );

  const subject = interpolate(t.email.newRequestSubject, {
    event: eventName,
  });

  await sendEmail({ to, subject, html });
}

// ─── Approval Notification to Target (to target profile's creator) ──────────

export async function sendApprovalToTarget(
  to: string,
  targetUserName: string,
  requesterName: string,
  eventName: string,
  locale?: string
): Promise<void> {
  const effectiveLocale = locale || 'he';
  const t = await getEmailTranslations(effectiveLocale);

  const greeting = interpolate(t.email.greetingName, {
    name: targetUserName,
  });
  const approvalBody = t.email.approvalBody;
  const detail = interpolate(t.email.approvalDetail, {
    requester: requesterName,
    event: eventName,
  });
  const loginForDetails = t.email.loginForDetails;
  const goodLuck = t.email.goodLuck;

  const html = wrapHtml(
    `
    <p>${greeting}</p>
    <p>${escapeHtml(approvalBody)}</p>
    <p>${detail}</p>
    <p>${escapeHtml(loginForDetails)}</p>
    <p>${escapeHtml(goodLuck)}</p>
  `,
    t.common.appName,
    t.landing.emailSentFrom,
    effectiveLocale
  );

  const subject = interpolate(t.email.approvalSubject, {
    event: eventName,
  });

  await sendEmail({ to, subject, html });
}

// ─── Status Change Notification (to request creator) ────────────────────────

export async function sendStatusChangeNotification(
  to: string,
  userName: string,
  targetName: string,
  eventName: string,
  newStatus: string,
  locale?: string
): Promise<void> {
  const effectiveLocale = locale || 'he';
  const t = await getEmailTranslations(effectiveLocale);

  // Map status key to localized email-specific status label
  const emailStatusLabels: Record<string, string> = {
    pending: t.email.statusPending,
    reviewed: t.email.statusReviewed,
    approved: t.email.statusApproved,
    rejected: t.email.statusRejected,
    archived: t.email.statusArchived,
  };
  const statusLabel = emailStatusLabels[newStatus] || newStatus;

  const greeting = interpolate(t.email.greetingName, {
    name: userName,
  });
  const body = interpolate(t.email.statusChangeBody, {
    target: targetName,
    event: eventName,
    status: statusLabel,
  });
  const loginForDetails = t.email.loginForDetails;

  const html = wrapHtml(
    `
    <p>${greeting}</p>
    <p>${body}</p>
    <p>${escapeHtml(loginForDetails)}</p>
  `,
    t.common.appName,
    t.landing.emailSentFrom,
    effectiveLocale
  );

  const subject = interpolate(t.email.statusChangeSubject, {
    event: eventName,
  });

  await sendEmail({ to, subject, html });
}
