import { welcomeEmail } from "../templates";

export function signupConfirmationEmail(userName?: string, role: "student" | "teacher" = "student"): string {
  return welcomeEmail(userName, role);
}

export default signupConfirmationEmail;
