import {describe, expect, it} from 'vitest';
import {ContractStatus} from '@prisma/client';
import {computeNightlyStatus, transitionStatus} from '@/lib/status';
import {computeReminderSchedule, shouldSendReminder} from '@/lib/reminders';

describe('status transitions', () => {
  it('allows valid transitions', () => {
    expect(transitionStatus(ContractStatus.DRAFT, ContractStatus.REVIEW)).toBe(ContractStatus.REVIEW);
  });

  it('blocks invalid transitions', () => {
    expect(() => transitionStatus(ContractStatus.REVIEW, ContractStatus.DRAFT)).toThrow();
  });

  it('expires automatically when end date passed', () => {
    const expired = computeNightlyStatus(ContractStatus.REVIEW, new Date(Date.now() - 1000));
    expect(expired).toBe(ContractStatus.EXPIRED);
  });
});

describe('reminder scheduling', () => {
  it('orders reminders chronologically', () => {
    const end = new Date('2024-12-31');
    const schedule = computeReminderSchedule(end, [30, 7, 1]);
    expect(schedule[0] < schedule[1]).toBe(true);
  });

  it('detects when to send reminders', () => {
    expect(shouldSendReminder(new Date(Date.now() + 23 * 60 * 60 * 1000))).toBe(true);
    expect(shouldSendReminder(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000))).toBe(false);
  });
});
