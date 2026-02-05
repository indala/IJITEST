"use server";

import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export async function getSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_session')?.value;

    if (!token) return null;

    try {
        const decoded: any = verify(token, JWT_SECRET);
        return {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
            fullName: decoded.fullName || 'Journal Staff'
        };
    } catch (error) {
        return null;
    }
}
