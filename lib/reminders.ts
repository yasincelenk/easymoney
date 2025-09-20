import {addDays, isBefore, subDays} from 'date-fns';

export function computeReminderSchedule(endDate: Date, offsets: number[]) {
  return offsets.map((days) => subDays(endDate, days)).sort((a, b) => a.getTime() - b.getTime());
}

export function shouldSendReminder(dueAt: Date, now = new Date()) {
  return isBefore(dueAt, addDays(now, 1));
}
