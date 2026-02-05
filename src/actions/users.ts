"use server";

import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function getUsers() {
    try {
        const [rows]: any = await pool.execute('SELECT id, email, full_name, role, created_at FROM users');
        return rows;
    } catch (error: any) {
        console.error("Get Users Error:", error);
        return [];
    }
}

export async function createUser(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;
    const role = formData.get('role') as string;

    try {
        const passwordHash = await bcrypt.hash(password, 10);
        await pool.execute(
            'INSERT INTO users (email, password_hash, full_name, role) VALUES (?, ?, ?, ?)',
            [email, passwordHash, fullName, role]
        );
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

export async function deleteUser(id: number) {
    try {
        // Prevent deleting the last admin if possible, but for now simple delete
        await pool.execute('DELETE FROM users WHERE id = ?', [id]);
        revalidatePath('/admin/users');
        return { success: true };
    } catch (error: any) {
        console.error("Delete User Error:", error);
        return { error: "Failed to delete user" };
    }
}
