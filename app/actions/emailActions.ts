'use server';

import { sendInviteEmail, sendPasswordResetEmail } from '../../services/emailService';

export async function sendInvite(email: string, name: string, inviteLink: string) {
    try {
        return await sendInviteEmail(email, name, inviteLink);
    } catch (error: any) {
        console.error('Server Action Error (sendInvite):', error);
        return { success: false, error: error.message };
    }
}

export async function sendPasswordReset(email: string, resetLink: string) {
    try {
        return await sendPasswordResetEmail(email, resetLink);
    } catch (error: any) {
        console.error('Server Action Error (sendPasswordReset):', error);
        return { success: false, error: error.message };
    }
}
