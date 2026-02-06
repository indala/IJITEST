"use server";

import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function getUsers(role?: string) {
    try {
        let query = 'SELECT id, email, full_name, role, created_at FROM users';
        const params = [];
        if (role) {
            query += ' WHERE role = ?';
            params.push(role);
        }
        const [rows]: any = await pool.execute(query, params);
        return rows;
    } catch (error: any) {
        console.error("Get Users Error:", error);
        return [];
    }
}

import crypto from 'crypto';
import { sendEmail } from '@/lib/mail';

export async function createUser(formData: FormData) {
    const email = formData.get('email') as string;
    const fullName = formData.get('fullName') as string;
    const role = formData.get('role') as string;

    try {
        const invitationToken = crypto.randomBytes(32).toString('hex');
        const expires = new Date();
        expires.setHours(expires.getHours() + 24); // 24 hours invitation

        await pool.execute(
            'INSERT INTO users (email, full_name, role, invitation_token, invitation_expires) VALUES (?, ?, ?, ?, ?)',
            [email, fullName, role, invitationToken, expires]
        );

        // Send invitation email
        const setupUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/setup-password?token=${invitationToken}`;

        await sendEmail({
            to: email,
            subject: 'Invitation to join IJITEST Editorial Team',
            html: `
                <div style="font-family: serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 20px;">
                    <h1 style="color: #6d0202;">Welcome to IJITEST</h1>
                    <p>Dear ${fullName},</p>
                    <p>You have been invited to join the <strong>IJITEST</strong> editorial team as a <strong>${role}</strong>.</p>
                    <p>Please click the button below to set up your account password and access the editorial hub:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${setupUrl}" style="background: #6d0202; color: white; padding: 15px 30px; border-radius: 10px; text-decoration: none; font-weight: bold; display: inline-block;">Set Up My Account</a>
                    </div>
                    <p>This invitation link will expire in 24 hours.</p>
                    <p>Best regards,<br>IJITEST Administration</p>
                </div>
            `
        });

        revalidatePath('/admin/users');
        return { success: true };
    } catch (error: any) {
        console.error("Create User Error:", error);
        if (error.code === 'ER_DUP_ENTRY') {
            return { error: "Email already exists" };
        }
        return { error: "Failed to create user: " + error.message };
    }
}

export async function getPasswordSetupInfo(token: string) {
    try {
        const [rows]: any = await pool.execute(
            'SELECT email, full_name, role FROM users WHERE invitation_token = ? AND invitation_expires > NOW()',
            [token]
        );
        return rows[0] || null;
    } catch (error) {
        console.error("Get Setup Info Error:", error);
        return null;
    }
}

export async function setupPassword(formData: FormData) {
    const token = formData.get('token') as string;
    const password = formData.get('password') as string;

    try {
        const passwordHash = await bcrypt.hash(password, 10);

        // Update user and clear token
        const [result]: any = await pool.execute(
            'UPDATE users SET password_hash = ?, invitation_token = NULL, invitation_expires = NULL WHERE invitation_token = ? AND invitation_expires > NOW()',
            [passwordHash, token]
        );

        if (result.affectedRows === 0) {
            return { error: "Link expired or invalid" };
        }

        return { success: true };
    } catch (error: any) {
        console.error("Setup Password Error:", error);
        return { error: "Failed to setup password: " + error.message };
    }
}

import { getSession } from "@/actions/session";

export async function deleteUser(id: number) {
    try {
        const session = await getSession();

        if (!session) {
            return { error: "Unauthorized" };
        }

        // Prevent self-deletion
        if (Number(session.id) === Number(id)) {
            return { error: "You cannot delete your own administrative account while logged in." };
        }

        // Optional: Check if the current user is an admin
        if (session.role !== 'admin') {
            return { error: "Only administrators can revoke staff access." };
        }

        await pool.execute('DELETE FROM users WHERE id = ?', [id]);
        revalidatePath('/admin/users');
        return { success: true };
    } catch (error: any) {
        console.error("Delete User Error:", error);
        return { error: "Failed to delete user" };
    }
}
