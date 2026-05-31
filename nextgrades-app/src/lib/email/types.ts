export type EmailTemplateId =
  | "welcome"
  | "email-verification"
  | "verification-code"
  | "password-reset"
  | "password-changed"
  | "teacher-approved"
  | "teacher-rejected"
  | "enrollment-confirmation"
  | "course-purchase"
  | "subscription-confirmation"
  | "subscription-renewal-reminder"
  | "subscription-expiry"
  | "payment-receipt"
  | "contact-confirmation"
  | "contact-admin"
  | "admin-notification"
  | "security-alert";

export interface SendEmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

export interface PaymentLineItem {
  label: string;
  value: string;
}

export interface SubscriptionDetails {
  planName: string;
  amount: string;
  billingCycle: string;
  renewalDate?: string;
  expiryDate?: string;
}

export interface SecurityAlertDetails {
  action: string;
  ipAddress?: string;
  device?: string;
  location?: string;
  timestamp?: string;
}
