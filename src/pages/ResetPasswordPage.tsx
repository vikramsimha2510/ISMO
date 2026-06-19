import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input, Button } from '../components/common';
import { Key } from 'lucide-react';
import toast from 'react-hot-toast';

const resetSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetForm = z.infer<typeof resetSchema>;

export const ResetPasswordPage = () => {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Supabase sets the access_token in the URL hash for recovery links
    // e.g. #access_token=...&expires_in=...&type=recovery
    const hashParams = new URLSearchParams(location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    
    if (accessToken) {
      setToken(accessToken);
    } else {
      toast.error('Invalid or missing password reset token');
      navigate('/login');
    }
  }, [location, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetForm) => {
    if (!token) return;
    
    try {
      setIsLoading(true);
      await resetPassword({ password: data.password }, token);
      toast.success('Password reset successfully');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 w-full flex bg-deepline font-body overflow-hidden z-[100]">
      <div className="w-full lg:w-1/2 flex items-center justify-center relative p-8 h-full overflow-y-auto">
        <div className="absolute inset-0 blueprint-bg pointer-events-none opacity-50"></div>
        
        <div className="w-full max-w-md relative z-10 my-auto">
          <div className="mb-10 flex flex-col items-center">
            <div className="w-14 h-14 mb-6 rounded-xl bg-gradient-to-br from-linework to-[#3DA9C1] p-[1px] shadow-[0_0_20px_rgba(94,200,224,0.2)]">
              <div className="w-full h-full bg-deepline rounded-xl flex items-center justify-center">
                <img 
                  src="https://www.image2url.com/r2/default/images/1781709817080-6b6a72ff-ea71-48d3-bbb7-365d84ba6148.png" 
                  alt="Linework Logo" 
                  className="w-8 h-8 object-contain"
                />
              </div>
            </div>
            
            <h1 className="font-display text-4xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-vellum to-vellum/70 tracking-tight">
              New Password
            </h1>
            <p className="font-mono text-sm text-linework tracking-widest uppercase opacity-80">
              Create a new security key
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-8 md:p-10 relative overflow-hidden group">
            <div className="absolute -inset-[100px] bg-gradient-to-br from-linework/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative z-10 [&_label]:!text-vellum/80 [&_input]:!text-vellum [&_input]:!bg-deepline/50 [&_input]:!border-vellum/10 focus:[&_input]:!border-linework placeholder:[&_input]:!text-vellum/30">
              <Input
                label="New Security Key"
                type="password"
                icon={<Key className="w-4 h-4 text-linework/70" />}
                registration={register('password')}
                error={errors.password?.message}
                placeholder="••••••••"
              />
              
              <Input
                label="Confirm Security Key"
                type="password"
                icon={<Key className="w-4 h-4 text-linework/70" />}
                registration={register('confirmPassword')}
                error={errors.confirmPassword?.message}
                placeholder="••••••••"
              />

              <Button 
                type="submit" 
                variant="gradient"
                size="lg"
                className="w-full mt-8 rounded-lg !py-3" 
                isLoading={isLoading}
              >
                Save New Password
              </Button>
            </form>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex w-1/2 h-full relative bg-deepline overflow-hidden border-l border-vellum/5 items-center justify-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-linework/10 blur-[120px] rounded-full pointer-events-none"></div>
        <img 
          src="/workflow_abstract_1781710107075.png" 
          alt="Abstract workflow illustration" 
          className="w-full h-full object-cover opacity-90 mix-blend-screen transition-transform duration-1000 hover:scale-105"
          onError={(e) => {
             e.currentTarget.src = "file:///C:/Users/vikra/.gemini/antigravity-ide/brain/425f4da4-4464-4ba5-97eb-aaf8ef1e7912/workflow_abstract_1781710107075.png";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-deepline via-transparent to-deepline/50 pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-deepline to-transparent pointer-events-none opacity-50"></div>
      </div>
    </div>
  );
};
