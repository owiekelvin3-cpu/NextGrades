export function resolveZoomOAuthErrorMessage(
  reason: string | null,
  t: (key: string, options?: { defaultValue?: string }) => string
): string {
  if (!reason) {
    return t("zoom.connectedError", { defaultValue: "Zoom connection failed. Please try again." });
  }

  const decoded = decodeURIComponent(reason).toLowerCase();

  if (decoded === "access_denied") {
    return t("zoom.errorAccessDenied", {
      defaultValue:
        "Zoom authorization was cancelled. Try again and approve access for your own Zoom account.",
    });
  }
  if (decoded === "invalid_state") {
    return t("zoom.errorInvalidState", {
      defaultValue: "Your sign-in session expired. Please try connecting Zoom again.",
    });
  }
  if (decoded.includes("invalid_client") || decoded.includes("application not found")) {
    return t("zoom.errorAppNotFound", {
      defaultValue:
        "Zoom could not find this app for your account. The server may be using Development credentials - only the app owner's Zoom account can connect until Production OAuth is enabled.",
    });
  }
  if (decoded.includes("token exchange") || decoded === "token_exchange_failed") {
    return t("zoom.errorTokenExchange", {
      defaultValue:
        "Zoom rejected the authorization. Verify Production Client ID, Client Secret, and redirect URL in Zoom Marketplace match your server environment.",
    });
  }

  return t("zoom.connectedError", { defaultValue: "Zoom connection failed. Please try again." });
}
