const dateFormatter = new Intl.DateTimeFormat("zh-TW", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "UTC",
});

export function formatDate(date: Date | string) {
  return dateFormatter.format(typeof date === "string" ? new Date(date) : date);
}
