import { EMAIL_BRAND, getAppUrl, getLogoUrl } from "./config";
import { escapeHtml } from "./utils";

const C = EMAIL_BRAND.colors;

export function emailButton(href: string, label: string, variant: "primary" | "secondary" = "primary"): string {
  const bg = variant === "primary" ? C.gold : C.navy;
  const color = variant === "primary" ? C.navy : C.white;
  const border = variant === "primary" ? C.gold : C.navy;
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:28px auto;">
      <tr>
        <td align="center" style="border-radius:8px;background:${bg};">
          <a href="${href}" target="_blank" style="display:inline-block;padding:14px 32px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;color:${color};text-decoration:none;border-radius:8px;border:2px solid ${border};mso-padding-alt:0;">
            <!--[if mso]><i style="letter-spacing:25px;mso-font-width:-100%;mso-text-raise:30pt">&nbsp;</i><![endif]-->
            <span style="mso-text-raise:15pt;">${escapeHtml(label)}</span>
            <!--[if mso]><i style="letter-spacing:25px;mso-font-width:-100%">&nbsp;</i><![endif]-->
          </a>
        </td>
      </tr>
    </table>`;
}

export function emailHeading(text: string): string {
  return `<h1 style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:28px;line-height:1.3;font-weight:700;color:${C.navy};" class="text-heading">${escapeHtml(text)}</h1>`;
}

export function emailSubheading(text: string): string {
  return `<h2 style="margin:24px 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:18px;line-height:1.4;font-weight:600;color:${C.navy};" class="text-heading">${escapeHtml(text)}</h2>`;
}

export function emailParagraph(html: string): string {
  return `<p style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:${C.text};" class="text-body">${html}</p>`;
}

export function emailDivider(): string {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:24px 0;"><tr><td style="height:1px;background:linear-gradient(90deg,transparent,${C.gold}33,transparent);font-size:0;line-height:0;">&nbsp;</td></tr></table>`;
}

export function emailCodeBlock(code: string): string {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:20px 0;">
      <tr>
        <td align="center" style="padding:20px;background:${C.navy};border-radius:12px;border:2px solid ${C.gold};">
          <span style="font-family:'Courier New',Courier,monospace;font-size:32px;font-weight:700;letter-spacing:8px;color:${C.gold};">${escapeHtml(code)}</span>
        </td>
      </tr>
    </table>`;
}

export function emailLinkBlock(url: string): string {
  return `<p style="margin:12px 0;font-family:'Courier New',Courier,monospace;font-size:12px;line-height:1.6;color:${C.textMuted};word-break:break-all;background:#F7FAFC;padding:12px;border-radius:6px;border-left:3px solid ${C.gold};" class="link-block">${escapeHtml(url)}</p>`;
}

export function emailNotice(type: "security" | "info" | "warning" | "success", html: string): string {
  const styles = {
    security: { bg: "#ECFDF5", border: C.success, color: "#166534" },
    info: { bg: "#EFF6FF", border: C.info, color: "#1E40AF" },
    warning: { bg: "#FFFBEB", border: C.warning, color: "#92400E" },
    success: { bg: "#F0FDF4", border: C.success, color: "#166534" },
  }[type];
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:20px 0;">
      <tr>
        <td style="padding:16px;background:${styles.bg};border-left:4px solid ${styles.border};border-radius:8px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:${styles.color};" class="notice-box">
          ${html}
        </td>
      </tr>
    </table>`;
}

export function emailDetailTable(rows: { label: string; value: string }[]): string {
  const rowsHtml = rows
    .map(
      (row, i) => `
      <tr>
        <td style="padding:12px 16px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${C.textMuted};border-bottom:1px solid #E2E8F0;width:40%;vertical-align:top;" class="detail-label">${escapeHtml(row.label)}</td>
        <td style="padding:12px 16px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:600;color:${C.navy};border-bottom:1px solid #E2E8F0;vertical-align:top;" class="detail-value">${row.value}</td>
      </tr>`
    )
    .join("");
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:20px 0;border:1px solid #E2E8F0;border-radius:8px;overflow:hidden;" class="detail-table">
      ${rowsHtml}
    </table>`;
}

export function emailNumberedSteps(steps: string[]): string {
  const rows = steps
    .map(
      (step, i) => `
      <tr>
        <td style="vertical-align:top;padding:10px 14px 10px 0;width:32px;">
          <span style="display:inline-block;width:28px;height:28px;line-height:28px;text-align:center;border-radius:50%;background:${C.gold};color:${C.navy};font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;">${i + 1}</span>
        </td>
        <td style="vertical-align:top;padding:10px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;color:${C.text};" class="text-body">${step}</td>
      </tr>`
    )
    .join("");
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:20px 0 24px;background:#FAFAFA;border-radius:10px;border:1px solid #E8ECF0;">
      ${rows}
    </table>`;
}

export function emailFeatureList(items: string[]): string {
  const lis = items
    .map(
      (item) =>
        `<tr><td style="padding:6px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:${C.text};" class="text-body"><span style="color:${C.gold};font-weight:700;margin-right:8px;">✓</span>${item}</td></tr>`
    )
    .join("");
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:16px 0;">${lis}</table>`;
}

export function emailSignature(): string {
  return emailParagraph(
    `Best regards,<br><strong style="color:${C.navy};">The NextGrades Team</strong><br><em style="color:${C.textMuted};">${EMAIL_BRAND.tagline}</em>`
  );
}

export function emailHeader(): string {
  const appUrl = getAppUrl();
  const logoUrl = getLogoUrl();
  const logoHtml = logoUrl
    ? `<img src="${escapeHtml(logoUrl)}" alt="NextGrades" width="160" style="display:block;margin:0 auto;max-width:160px;height:auto;border:0;" />`
    : `<div style="font-family:Arial,Helvetica,sans-serif;font-size:26px;font-weight:700;color:#FFFFFF;letter-spacing:-0.5px;">Next<span style="color:${C.gold};">Grades</span></div>
       <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:500;color:#A0AEC0;letter-spacing:2px;text-transform:uppercase;margin-top:8px;">${EMAIL_BRAND.tagline}</div>`;

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td align="center" style="padding:36px 32px;background:linear-gradient(135deg,${C.navy} 0%,#1a2e4a 100%);border-bottom:3px solid ${C.gold};">
          <a href="${appUrl}" target="_blank" style="text-decoration:none;">${logoHtml}</a>
        </td>
      </tr>
    </table>`;
}

export function emailFooter(): string {
  const appUrl = getAppUrl();
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td style="padding:32px 24px;background:linear-gradient(135deg,${C.navy} 0%,#1a2e4a 100%);text-align:center;">
          <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:600;color:#FFFFFF;">${EMAIL_BRAND.name} — The Future of Learning</p>
          <p style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:#A0AEC0;">Premium education platform for students and teachers worldwide</p>
          <p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:13px;">
            <a href="${appUrl}/help" style="color:${C.gold};text-decoration:none;margin:0 8px;">Help Center</a>
            <a href="${appUrl}/contact" style="color:${C.gold};text-decoration:none;margin:0 8px;">Contact</a>
            <a href="${appUrl}/privacy" style="color:${C.gold};text-decoration:none;margin:0 8px;">Privacy</a>
            <a href="${appUrl}/terms" style="color:${C.gold};text-decoration:none;margin:0 8px;">Terms</a>
          </p>
          <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:13px;">
            <a href="mailto:${EMAIL_BRAND.supportEmail}" style="color:${C.gold};text-decoration:none;">${EMAIL_BRAND.supportEmail}</a>
          </p>
          <p style="margin:16px 0 0;padding-top:16px;border-top:1px solid rgba(212,175,55,0.15);font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#7a8fa3;">
            © ${new Date().getFullYear()} ${EMAIL_BRAND.name}. All rights reserved.<br>${escapeHtml(EMAIL_BRAND.companyAddress)}
          </p>
        </td>
      </tr>
    </table>`;
}

export function wrapEmail(content: string, previewText: string): string {
  const preview = escapeHtml(previewText);
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
  <title>${EMAIL_BRAND.name}</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
  <style>
    :root { color-scheme: light dark; supported-color-schemes: light dark; }
    body, table, td { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; }
      .content-cell { padding: 28px 20px !important; }
    }
    @media (prefers-color-scheme: dark) {
      .email-body { background-color: #1a202c !important; }
      .email-card { background-color: ${C.navyLight} !important; border-color: rgba(255,255,255,0.08) !important; }
      .text-heading { color: #FFFFFF !important; }
      .text-body { color: #CBD5E0 !important; }
      .detail-label { color: #A0AEC0 !important; border-color: rgba(255,255,255,0.1) !important; }
      .detail-value { color: #FFFFFF !important; border-color: rgba(255,255,255,0.1) !important; }
      .detail-table { border-color: rgba(255,255,255,0.1) !important; }
      .link-block { background-color: ${C.navy} !important; color: #A0AEC0 !important; }
      .notice-box { opacity: 0.95; }
    }
  </style>
</head>
<body class="email-body" style="margin:0;padding:0;background-color:#F0F2F5;width:100%;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preview}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="email-body" style="background-color:#F0F2F5;">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" class="email-container email-card" style="max-width:600px;width:100%;background-color:#FFFFFF;border-radius:12px;overflow:hidden;border:1px solid rgba(212,175,55,0.12);box-shadow:0 4px 24px rgba(13,27,42,0.08);">
          <tr><td>${emailHeader()}</td></tr>
          <tr>
            <td class="content-cell" style="padding:40px 36px;font-family:Arial,Helvetica,sans-serif;">
              ${content}
            </td>
          </tr>
          <tr><td>${emailFooter()}</td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
