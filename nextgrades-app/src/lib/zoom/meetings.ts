import { ZOOM_API_BASE, type ZoomMeetingType } from "./config";
import { getZoomAccessToken } from "./tokens";

export type CreateZoomMeetingInput = {
  teacherId: string;
  topic: string;
  description?: string;
  startTime: Date;
  duration: number;
  timezone: string;
  meetingType: ZoomMeetingType;
};

export type ZoomMeetingResult = {
  id: string;
  join_url: string;
  password?: string;
  start_url?: string;
  topic: string;
};

function zoomMeetingSettings(meetingType: ZoomMeetingType) {
  const base = {
    join_before_host: true,
    waiting_room: meetingType === "private_session",
    auto_recording: "none" as const,
  };

  if (meetingType === "webinar") {
    return { ...base, approval_type: 0, registrants_email_notification: true };
  }

  return base;
}

export async function createZoomMeetingOAuth(
  input: CreateZoomMeetingInput
): Promise<ZoomMeetingResult> {
  const accessToken = await getZoomAccessToken(input.teacherId);
  if (!accessToken) {
    throw new Error("Zoom account not connected. Please connect Zoom in Settings.");
  }

  const res = await fetch(`${ZOOM_API_BASE}/users/me/meetings`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      topic: input.topic,
      type: 2,
      start_time: input.startTime.toISOString(),
      duration: input.duration,
      timezone: input.timezone,
      agenda: input.description ?? "",
      settings: {
        ...zoomMeetingSettings(input.meetingType),
        meeting_authentication: false,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to create Zoom meeting: ${err}`);
  }

  const data = (await res.json()) as {
    id: number;
    join_url: string;
    password?: string;
    start_url?: string;
    topic: string;
  };

  return {
    id: String(data.id),
    join_url: data.join_url,
    password: data.password,
    start_url: data.start_url,
    topic: data.topic,
  };
}

export async function deleteZoomMeetingOAuth(
  teacherId: string,
  meetingId: string
): Promise<void> {
  const accessToken = await getZoomAccessToken(teacherId);
  if (!accessToken) throw new Error("Zoom account not connected");

  const res = await fetch(`${ZOOM_API_BASE}/meetings/${meetingId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok && res.status !== 404) {
    const err = await res.text();
    throw new Error(`Failed to delete Zoom meeting: ${err}`);
  }
}
