import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { VellumCard, Input, Button } from '../components/common';
import toast from 'react-hot-toast';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export const RegisterPage = () => {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      setIsLoading(true);
      await registerAuth(data);
      toast.success('Registration successful');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to register');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <VellumCard className="w-full max-w-md p-8 md:p-10">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-bold mb-2 text-deepline">Sign Up</h1>
          <p className="font-mono text-sm text-graphite/60 tracking-wider uppercase">Create an account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Full Name"
            registration={register('fullName')}
            error={errors.fullName?.message}
            placeholder="John Doe"
          />
          <Input
            label="Email Address"
            type="email"
            registration={register('email')}
            error={errors.email?.message}
            placeholder="engineer@linework.app"
          />
          <Input
            label="Security Key"
            type="password"
            registration={register('password')}
            error={errors.password?.message}
            placeholder="••••••••"
          />
          <Input
            label="Confirm Key"
            type="password"
            registration={register('confirmPassword')}
            error={errors.confirmPassword?.message}
            placeholder="••••••••"
          />

          <div className="pt-4">
            <Button type="submit" className="w-full" isLoading={isLoading}>
              Sign Up
            </Button>
          </div>
        </form>

        <div className="mt-8 text-center border-t border-graphite/10 pt-6">
          <p className="font-body text-sm text-graphite/70">
            Already cleared?{' '}
            <Link to="/login" className="font-mono text-linework hover:text-linework-text underline decoration-linework/30 underline-offset-4 tracking-wider">
              AUTHENTICATE
            </Link>
          </p>
        </div>
      </VellumCard>
    </div>
  );
};
