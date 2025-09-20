export async function sendInviteEmail(email: string, link: string, role: string) {
  console.info(`Invite sent to ${email} for role ${role}: ${link}`);
}

export async function sendReminderEmail(email: string, subject: string, body: string) {
  console.info(`Reminder email to ${email}: ${subject} - ${body}`);
}
