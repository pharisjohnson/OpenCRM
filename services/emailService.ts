import { Resend } from 'resend';

// The API key is an environment variable (Server Side Only)
const RESEND_API_KEY = process.env.RESEND_API_KEY;

let resendInstance: Resend | null = null;

const getResend = () => {
    if (!resendInstance && RESEND_API_KEY) {
        resendInstance = new Resend(RESEND_API_KEY);
    }
    return resendInstance;
};

export interface SendEmailParams {
    to: string;
    subject: string;
    text?: string;
    html?: string;
    from?: string;
}

export const sendTransactionalEmail = async ({
    to,
    subject,
    text,
    html,
    from = 'OpenCRM <onboarding@resend.dev>'
}: SendEmailParams) => {
    const resend = getResend();
    if (!resend) {
        throw new Error('Resend API key is missing or invalid.');
    }

    try {
        const { data, error } = await resend.emails.send({
            from,
            to,
            subject,
            text: text || '',
            html: html || '',
        });

        if (error) {
            console.error('Resend Error:', error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Unexpected Email Error:', error);
        return { success: false, error };
    }
};

/**
 * Sends a workspace invitation email.
 */
export const sendInviteEmail = async (email: string, name: string, inviteLink: string) => {
    return sendTransactionalEmail({
        to: email,
        subject: `You've been invited to join OpenCRM`,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 8px;">
                <h1 style="color: #0ea5e9; font-size: 24px; margin-bottom: 16px;">Welcome to OpenCRM</h1>
                <p>Hello ${name},</p>
                <p>You have been invited to join the OpenCRM workspace as an active collaborator.</p>
                <div style="margin: 32px 0;">
                    <a href="${inviteLink}" style="background-color: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                        Accept Invitation
                    </a>
                </div>
                <p style="color: #64748b; font-size: 14px;">If the button above doesn't work, copy and paste this link into your browser:</p>
                <p style="color: #64748b; font-size: 12px; word-break: break-all;">${inviteLink}</p>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
                <p style="color: #94a3b8; font-size: 12px;">This is an automated system message. Please do not reply directly to this email.</p>
            </div>
        `
    });
};

/**
 * Sends a password reset email.
 */
export const sendPasswordResetEmail = async (email: string, resetLink: string) => {
    return sendTransactionalEmail({
        to: email,
        subject: 'Reset your OpenCRM Password',
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h1 style="color: #0ea5e9; font-size: 24px; margin-bottom: 16px;">Password Reset Request</h1>
                <p>We received a request to reset your password for OpenCRM.</p>
                <div style="margin: 32px 0;">
                    <a href="${resetLink}" style="background-color: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                        Reset Password
                    </a>
                </div>
                <p style="color: #64748b; font-size: 14px;">If you didn't request this, you can safely ignore this email. Your password will remain unchanged.</p>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
                <p style="color: #94a3b8; font-size: 12px;">Expires in 24 hours.</p>
            </div>
        `
    });
};
