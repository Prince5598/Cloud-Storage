"use client"

import {useForm} from 'react-hook-form'
import {z} from 'zod'
import {useSignUp} from'@clerk/nextjs';
import { useState } from 'react';
import { SignupSchema } from '@/schemas/SignUpSchema';
import {zodResolver} from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  Lock,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
} from "lucide-react";

const CardBody = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

const CardHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 pb-2 ${className}`}>{children}</div>
);

const CardFooter = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 pt-4 ${className}`}>{children}</div>
);

export default function SignUpForm(){
    const Router = useRouter();
    const {signUp,isLoaded,setActive} = useSignUp();
    const [verifying,setVerifying] = useState(false);
    const [isSubmitting,setIsSubmitting] = useState(false);
    const [authError, setauthError] = useState<string | null>(null);
    const [verificationOtp,setVerificationOtp] = useState("");
    const [verificationError,setVerificationError] = useState<string | null>(null);
    
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);


    const {
        register,
        handleSubmit,
        formState: {errors},
    } = useForm<z.infer<typeof SignupSchema>>({
        resolver: zodResolver(SignupSchema),
        defaultValues:{
            email:'',
            password:'',
            passwordConfim:'',
        }
    })

    const onSubmit = async(data : z.infer<typeof SignupSchema>) => {
        if(!isLoaded) return;
        setIsSubmitting(true);
        setauthError(null);
        try {
            await signUp.create({
                emailAddress : data.email,
                password:data.password,
            })
            await signUp.prepareEmailAddressVerification({
                strategy: "email_code"
            })
            setVerifying(true);
        } catch (error : any) {
            setauthError(error.errors?.[0]?.message || "An error occured during signup.please try again.")
        }finally{
            setIsSubmitting(false);
        }
    }
    
    const handleVerificationSubmit = async(e : React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if(!isLoaded || !signUp) return;
        
        setauthError(null);
        setIsSubmitting(true);
        try{
            const result = await signUp.attemptEmailAddressVerification({
                           code:verificationOtp
                        })    
                              
            console.log(result);
            if(result.status === 'complete'){
                await setActive({session : result.createdSessionId});
                Router.push("/dashboard");
            }else{
                setVerificationError("Error occured in OTP verification");
            }
        }catch(error : any){
            setVerificationError(error.errors?.[0].message || "Error occured in OTP verification.please try again");
        }finally{
            setIsSubmitting(false);
        }
        
    }

    if(verifying){
        return (
      <Card className="w-full max-w-md border border-border bg-card shadow-xl">
        <CardHeader className="flex flex-col gap-1 items-center pb-2">
          <h1 className="text-2xl font-bold text-foreground">
            Verify Your Email
          </h1>
          <p className="text-muted-foreground text-center">
            We've sent a verification code to your email
          </p>
        </CardHeader>

        <Separator />

        <CardBody className="py-6">
          {verificationError && (
            <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-6 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p>{verificationError}</p>
            </div>
          )}

          <form onSubmit={handleVerificationSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="verificationCode"
                className="text-sm font-medium text-foreground"
              >
                Verification Code
              </label>
              <Input
                id="verificationCode"
                type="text"
                placeholder="Enter the 6-digit code"
                value={verificationOtp}
                onChange={(e) => setVerificationOtp(e.target.value)}
                className="w-full"
                autoFocus
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Verifying..." : "Verify Email"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Didn't receive a code?{" "}
              <button
                onClick={async () => {
                  if (signUp) {
                    await signUp.prepareEmailAddressVerification({
                      strategy: "email_code",
                    });
                  }
                }}
                className="text-primary hover:underline font-medium"
              >
                Resend code
              </button>
            </p>
          </div>
        </CardBody>
      </Card>
    );
    }
     return (
    <Card className="w-full max-w-md border border-border bg-card shadow-xl">
      <CardHeader className="flex flex-col gap-1 items-center pb-2">
        <h1 className="text-2xl font-bold text-foreground">
          Create Your Account
        </h1>
        <p className="text-muted-foreground text-center">
          Sign up to start managing your images securely
        </p>
      </CardHeader>

      <Separator />

      <CardBody className="py-6">
        {authError && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p>{authError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-foreground"
            >
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-foreground"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className={`pl-10 pr-10 ${errors.password ? 'border-destructive' : ''}`}
                {...register("password")}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="passwordConfirmation"
              className="text-sm font-medium text-foreground"
            >
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="passwordConfirmation"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                className={`pl-10 pr-10 ${errors.passwordConfim ? 'border-destructive' : ''}`}
                {...register("passwordConfim")}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {errors.passwordConfim && (
              <p className="text-sm text-destructive">{errors.passwordConfim.message}</p>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
              <p className="text-sm text-muted-foreground">
                By signing up, you agree to our Terms of Service and Privacy
                Policy
              </p>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating account..." : "Create Account"}
          </Button>
        </form>
      </CardBody>

      <Separator />

      <CardFooter className="flex justify-center py-4">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="text-primary hover:underline font-medium"
          >
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );

}