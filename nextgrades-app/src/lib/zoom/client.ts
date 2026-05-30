import crypto from "crypto";

// Create a JWT token for Zoom API authentication
export const createZoomJWT = () => {
  const apiKey = process.env.ZOOM_API_KEY;
  const apiSecret = process.env.ZOOM_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error("Zoom API credentials are not set");
  }

  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  const payload = {
    iss: apiKey,
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
  };

  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(payload));
  const dataToSign = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto
    .createHmac("sha256", apiSecret)
    .update(dataToSign)
    .digest("base64url");

  return `${dataToSign}.${signature}`;
};

// Create a Zoom meeting
export const createZoomMeeting = async (
  topic: string,
  startTime: Date,
  duration: number = 60
) => {
  const jwt = createZoomJWT();
  const accountId = process.env.ZOOM_ACCOUNT_ID;

  const response = await fetch(
    `https://api.zoom.us/v2/users/${accountId}/meetings`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        topic,
        type: 2, // Scheduled meeting
        start_time: startTime.toISOString(),
        duration,
        timezone: "Europe/Berlin",
        settings: {
          join_before_host: true,
          auto_recording: "none",
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to create Zoom meeting");
  }

  const data = await response.json();
  return data;
};
