"use client"

import { SignInSchema } from "@/schemas/SignInSchema"
import { useSignIn } from "@clerk/nextjs"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardBody, CardHeader, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Mail, Lock, AlertCircle, Eye, EyeOff } from "lucide-react";

const CardBody = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

const CardHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 pb-2 ${className}`}>{children}</div>
);

const CardFooter = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 pt-4 ${className}`}>{children}</div>
);

export default function SignInForm(){
    const router = useRouter();
    const {signIn,isLoaded,setActive} = useSignIn();
    const [isSubmitting,setIsSubmitting] = useState(false);
    const [authError, setauthError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: {errors},
    } = useForm({
        resolver:zodResolver(SignInSchema),
        defaultValues:{
            email:'',
            password:'',
        }
    })
    const onSubmit = async (data: z.infer<typeof SignInSchema>) => {
        if(!isLoaded) return;
        setIsSubmitting(true);
        setauthError(null);
        try {
            const result = await signIn.create({
                identifier: data.email,
                password:data.password
            })
            console.log(result);
            if(result.status === 'complete'){
                await setActive({session: result.createdSessionId});
                router.push('/dashboard')
            }
            else{
                setauthError("Sign In error!");
            }
        } catch (error : any) {
            setauthError(error.errors?.[0]?.message || "SIGN IN ERROR. PLEASE TRY AGAIN" );
        }finally{
            setIsSubmitting(false);
        }
    }
    return (
    <Card className="w-full max-w-md border border-border bg-card shadow-xl">
      <CardHeader className="flex flex-col gap-1 items-center pb-2">
        <h1 className="text-2xl font-bold text-foreground">Welcome Back</h1>
        <p className="text-muted-foreground text-center">
          Sign in to access your secure cloud storage
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
              htmlFor="identifier"
              className="text-sm font-medium text-foreground"
            >
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="identifier"
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
            <div className="flex justify-between items-center">
              <label
                htmlFor="password"
                className="text-sm font-medium text-foreground"
              >
                Password
              </label>
            </div>
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

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </CardBody>

      <Separator />

      <CardFooter className="flex justify-center py-4">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link
            href="/sign-up"
            className="text-primary hover:underline font-medium"
          >
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}