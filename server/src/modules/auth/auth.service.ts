import { supabaseAdmin } from '../../config/supabaseAdmin.js';
import { prisma } from '../../config/prisma.js';
import { AppError } from '../../utils/AppError.js';
import { logger } from '../../config/logger.js';
import type { RegisterInput, LoginInput, ForgotPasswordInput, ResetPasswordInput } from './auth.schema.js';

/**
 * Auth service — wraps Supabase Auth admin calls and the profiles table.
 * This replaces bcrypt + jsonwebtoken entirely.
 */
export const authService = {
  /**
   * Register a new user:
   * 1. Create in Supabase Auth (handles password hashing, UUID generation)
   * 2. Create a matching Profile row via Prisma
   * 3. Sign them in immediately to get an access token
   */
  async register({ fullName, email, password }: RegisterInput) {
    // Step 1: Create the auth user in Supabase
    const { data: createData, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Skip email confirmation for dev
        user_metadata: { fullName },
      });

    if (createError) {
      logger.warn('Supabase createUser failed', { error: createError.message });

      // Map known Supabase errors to appropriate HTTP status codes
      if (
        createError.message.toLowerCase().includes('already been registered') ||
        createError.message.toLowerCase().includes('already exists')
      ) {
        throw new AppError('A user with this email already exists', 409);
      }

      throw new AppError('Registration failed — please try again', 500);
    }

    const supabaseUser = createData.user;

    // Step 2: Create the app-level profile
    const profile = await prisma.profile.create({
      data: {
        id: supabaseUser.id,
        fullName,
      },
    });

    // Step 3: Sign in immediately to get a session with access token
    const { data: signInData, error: signInError } =
      await supabaseAdmin.auth.signInWithPassword({ email, password });

    if (signInError || !signInData.session) {
      logger.error('Auto sign-in after registration failed', {
        error: signInError?.message,
      });
      throw new AppError('Account created but sign-in failed — please log in manually', 500);
    }

    return {
      user: {
        id: profile.id,
        fullName: profile.fullName,
        email,
        createdAt: profile.createdAt.toISOString(),
      },
      token: signInData.session.access_token,
    };
  },

  /**
   * Log in an existing user:
   * 1. Authenticate via Supabase (password check, session creation)
   * 2. Fetch the profile for fullName
   */
  async login({ email, password }: LoginInput) {
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      throw new AppError('Invalid email or password', 401);
    }

    // Fetch the profile for the user's fullName
    const profile = await prisma.profile.findUnique({
      where: { id: data.user.id },
    });

    if (!profile) {
      // Edge case: auth user exists but profile doesn't (e.g. manual Supabase creation)
      // Auto-create a profile from the auth metadata
      const fullName =
        (data.user.user_metadata?.fullName as string) || email.split('@')[0];

      const newProfile = await prisma.profile.create({
        data: {
          id: data.user.id,
          fullName,
        },
      });

      return {
        user: {
          id: newProfile.id,
          fullName: newProfile.fullName,
          email,
          createdAt: newProfile.createdAt.toISOString(),
        },
        token: data.session.access_token,
      };
    }

    return {
      user: {
        id: profile.id,
        fullName: profile.fullName,
        email,
        createdAt: profile.createdAt.toISOString(),
      },
      token: data.session.access_token,
    };
  },

  /**
   * Logout — server-side session invalidation.
   * Best-effort: if it fails, the client discards the token anyway.
   */
  async logout(userId: string) {
    try {
      await supabaseAdmin.auth.admin.signOut(userId);
    } catch (err) {
      logger.warn('Server-side sign-out failed (non-critical)', { userId });
    }
  },

  /**
   * Send a password reset email via Supabase Auth
   */
  async forgotPassword({ email }: ForgotPasswordInput) {
    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:5173/reset-password',
    });

    if (error) {
      logger.error('Supabase resetPasswordForEmail failed', { error: error.message });
      throw new AppError('Failed to send reset password email', 500);
    }
    
    return { message: 'Password reset email sent' };
  },

  /**
   * Reset the user's password using the token/session
   * Note: With Supabase, the client usually calls `updateUser` with the new password
   * if they are logged in via the magic link. If we route it through the backend,
   * we can use the admin API or just assume the frontend will handle the Supabase session
   * natively. For this implementation, we will assume the request contains the access token
   * and we will call updateUser on behalf of the user, or use the admin API.
   * Actually, if the frontend captures the #access_token from the URL, the best way is for the frontend
   * to call Supabase directly. But if we want to do it in the backend, the backend needs the access token.
   * Let's just use the Supabase admin API to update the user's password if they are authenticated.
   */
  async resetPassword(userId: string, { password }: ResetPasswordInput) {
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password,
    });

    if (error) {
      logger.error('Supabase updateUserById failed', { error: error.message });
      throw new AppError('Failed to reset password', 500);
    }

    return { message: 'Password reset successfully' };
  },
};
