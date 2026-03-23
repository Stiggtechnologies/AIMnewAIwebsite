import { Resend } from 'resend';

// Lazy init — avoids build-time crash when RESEND_API_KEY env var is absent
function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendIntakeNotification(intakeData: {
  id: string;
  patient_data?: any;
  injury_data?: any;
  insurance_data?: any;
  created_at: string;
}) {
  const patientName = intakeData.patient_data?.name || 'Unknown';
  const patientPhone = intakeData.patient_data?.phone || 'Not provided';
  const patientEmail = intakeData.patient_data?.email || 'Not provided';
  const injuryType = intakeData.injury_data?.type || 'Not specified';
  const insuranceType = intakeData.insurance_data?.type || 'Not specified';

  const emailContent = `
New Intake Form Submission

Patient Information:
- Name: ${patientName}
- Phone: ${patientPhone}
- Email: ${patientEmail}

Injury Details:
- Type: ${injuryType}
- Description: ${intakeData.injury_data?.description || 'Not provided'}

Insurance:
- Type: ${insuranceType}
- Details: ${intakeData.insurance_data?.details || 'Not provided'}

Submission ID: ${intakeData.id}
Submitted At: ${new Date(intakeData.created_at).toLocaleString('en-CA', { timeZone: 'America/Edmonton' })}

View in Supabase: https://supabase.com/dashboard/project/optlghedswctsklcxlkn/editor/intake_submissions?filter=id%3Deq%3D${intakeData.id}
  `.trim();

  try {
    await getResend().emails.send({
      from: 'AIM Intake <intake@aimphysiotherapy.ca>',
      to: 'aim2recover@albertainjurymanagement.ca',
      subject: `New Intake Form: ${patientName}`,
      text: emailContent,
    });
  } catch (error) {
    console.error('Failed to send intake notification:', error);
    // Don't throw - we don't want to fail the intake submission if email fails
  }
}
