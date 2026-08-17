import { describe, expect, it } from "vitest";
import { lessonShouldConsumeUnit } from "./consume-units";

const base = {
  status: "scheduled",
  units_consumed: false,
  start_time: "2026-08-17T10:00:00.000Z",
  duration: 60,
  meeting_url: "https://zoom.us/j/123",
  zoom_link: null,
  zoom_meeting_id: null,
};

describe("lessonShouldConsumeUnit", () => {
  it("consumes after a linked meeting has ended", () => {
    expect(lessonShouldConsumeUnit(base, Date.parse("2026-08-17T11:00:00.000Z"))).toBe(true);
  });

  it("does not consume before the meeting ends", () => {
    expect(lessonShouldConsumeUnit(base, Date.parse("2026-08-17T10:30:00.000Z"))).toBe(false);
  });

  it("does not consume lessons without a meeting link", () => {
    expect(
      lessonShouldConsumeUnit(
        { ...base, meeting_url: null, zoom_link: null, zoom_meeting_id: null },
        Date.parse("2026-08-17T12:00:00.000Z")
      )
    ).toBe(false);
  });

  it("does not consume cancelled or already billed lessons", () => {
    expect(lessonShouldConsumeUnit({ ...base, status: "cancelled" }, Date.parse("2026-08-17T12:00:00.000Z"))).toBe(
      false
    );
    expect(lessonShouldConsumeUnit({ ...base, units_consumed: true }, Date.parse("2026-08-17T12:00:00.000Z"))).toBe(
      false
    );
  });
});
