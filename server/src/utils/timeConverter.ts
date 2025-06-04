import moment from "moment";

// Utility function to convert time formats like "15m" and "1h" into seconds
export function convertToSeconds(token: string): number {
  const duration = moment.duration(
    parseInt(token),
    token.replace(/\d+/g, "") as moment.unitOfTime.DurationConstructor
  );

  return duration.asSeconds();
}
