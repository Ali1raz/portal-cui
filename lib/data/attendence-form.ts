/// Generates available dates up to today, keeping recent weekdays for attendance.
function generateAvailableDates(): Date[] {
  const dates: Date[] = [];
  const today = new Date();
  const endOfToday = new Date(today);
  endOfToday.setHours(23, 59, 59, 999);
  const daysBack = 60;

  for (let i = daysBack; i >= 0; i -= 1) {
    const date = new Date(endOfToday);
    date.setDate(endOfToday.getDate() - i);
    date.setHours(0, 0, 0, 0);
    const day = date.getDay();
    const isWeekday = day !== 0 && day !== 6;
    if (isWeekday || i === 0) {
      dates.push(date);
    }
  }

  return dates;
}

export const demoDateTimePickerData = {
  title: "Select a Date & Time",
  availableDates: generateAvailableDates(),
  availableTimeSlots: [
    "9:00am",
    "10:00am",
    "11:30am",
    "1:00pm",
    "2:30pm",
    "4:00pm",
  ],
  timezone: "Eastern Time - US & Canada",
};
