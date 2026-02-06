'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import pool from '@/lib/db'
import bcrypt from 'bcryptjs'
import { sign } from 'jsonwebtoken' // I'll need to install jsonwebtoken or use a simple cookie

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret'

export async function login(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
        const [rows]: any = await pool.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        )

        const user = rows[0]

        if (!user) {
            return { error: 'Invalid email or password' }
        }

        const isPasswordValid = await bcrypt.compare(password, user.password_hash)

        if (!isPasswordValid) {
            return { error: 'Invalid email or password' }
        }

        // Create session
        const token = sign(
            { id: user.id, email: user.email, role: user.role, fullName: user.full_name },
            JWT_SECRET,
            { expiresIn: '1d' }
        )

        const cookieStore = await cookies()
        cookieStore.set('session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 // 1 day
        })

        revalidatePath('/', 'layout')
    } catch (error: any) {
        if (error.digest?.startsWith('NEXT_REDIRECT')) {
            throw error;
        }
        console.error('Login error:', error)
        return { error: 'An unexpected error occurred' }
    }

    redirect('/admin') // Redirect to admin for now, the root page will handle specifics if needed
}

export async function logout() {
    const cookieStore = await cookies()
    cookieStore.delete('session')

    revalidatePath('/', 'layout')
    redirect('/login')
}
