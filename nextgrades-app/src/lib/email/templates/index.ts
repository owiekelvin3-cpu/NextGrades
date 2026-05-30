/** @deprecated Use `@/lib/email/templates` — re-exports for backward compatibility */
export { wrapEmail as baseEmailTemplate } from "../layout";
export {
  welcomeEmail,
  passwordResetEmail,
  emailVerificationEmail as verificationEmail,
  notificationEmail,
} from "../templates";
