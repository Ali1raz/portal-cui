function generateAvailableDates(): Date[] {
  const dates: Date[] = [];
  const now = new Date();
  // Walk through current and next month, only keeping weekdays (Mon-Fri)
  for (let m = 0; m <= 1; m++) {
    for (let d = 1; d <= 28; d++) {
      const date = new Date(now.getFullYear(), now.getMonth() + m, d);
      const day = date.getDay();
      if (day !== 0 && day !== 6) {
        dates.push(date);
      }
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
