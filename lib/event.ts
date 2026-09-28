export const event = {
  name: "Терези",
  date: "25 жовтня 2026",
  start: "2026-10-25T14:00:00-05:00", // America/Chicago: CDT on this date.
  churchAddress: "1475 W Algonquin Rd, Palatine, IL 60067",
  restaurant: "Pasage",
  restaurantAddress: "577 Waukegan Rd, Northbrook, IL 60062",
  photo: "/tereza-newborn-ribbon.png",
};
export function countdown(now: number) {
  const total = Math.max(0, Math.floor((Date.parse(event.start) - now) / 1000));
  return [
    Math.floor(total / 86400),
    Math.floor(total / 3600) % 24,
    Math.floor(total / 60) % 60,
    total % 60,
  ];
}
export function calendarFile() {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Tereza//Baptism//UK",
    "BEGIN:VEVENT",
    "UID:tereza-baptism-20261025",
    "DTSTAMP:20260928T120000Z",
    "DTSTART:20261025T190000Z",
    "SUMMARY:Хрестини Терези — хрещення",
    `LOCATION:${event.churchAddress.replaceAll(",", "\\,")}`,
    "END:VEVENT",
    "BEGIN:VEVENT",
    "UID:tereza-celebration-20261025",
    "DTSTAMP:20260928T120000Z",
    "DTSTART:20261025T210000Z",
    "SUMMARY:Хрестини Терези — святкування в Pasage",
    `LOCATION:${event.restaurantAddress.replaceAll(",", "\\,")}`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}
