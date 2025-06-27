// src/app/register/page.tsx
'use client'

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useRegisterAsEmployer } from '@/hooks/use-opera-contract';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle2, Building } from 'lucide-react';
import ProtectedRoute from '@/components/protected-route';

export default function RegisterPage() {
    return (
        <ProtectedRoute requireNotEmployer redirectTo="/employer">
            <RegisterEmployerForm />
        </ProtectedRoute>
    );
}

function RegisterEmployerForm() {
    const { address, isConnected } = useAccount();
    const router = useRouter();
    const [companyName, setCompanyName] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);

    // Use our centralized registration hook
    const {
        register,
        isPending,
        isConfirming,
        isConfirmed,
        error
    } = useRegisterAsEmployer();

    // Handle registration confirmation
    useEffect(() => {
        if (isConfirmed) {
            toast.success('Registration successful!');
            setTimeout(() => {
                router.push('/employer');
            }, 2000);
        }
    }, [isConfirmed, router]);

    // Handle registration error
    useEffect(() => {
        if (error) {
            console.error('Registration error:', error);
            toast.error('Registration failed. Please try again.');
            setIsRegistering(false);
        }
    }, [error]);

    const handleRegister = async () => {
        if (!companyName.trim()) {
            toast.error('Please enter a company name');
            return;
        }

        try {
            setIsRegistering(true);
            await register(companyName);
        } catch (err) {
            console.error('Registration error:', err);
            toast.error('Registration failed. Please try again.');
            setIsRegistering(false);
        }
    };

    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <h1 className="text-2xl font-bold mb-4">Please connect your wallet</h1>
                <p className="text-muted-foreground">Connect your wallet to register as an employer</p>
            </div>
        );
    }

    if (isConfirmed) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <CheckCircle2 className="h-16 w-16 text-green-500 mb-6" />
                <h1 className="text-2xl font-bold mb-2">Registration Successful!</h1>
                <p className="text-muted-foreground mb-8">You are now registered as an employer</p>
                <Button onClick={() => router.push('/employer')}>
                    Go to Employer Dashboard
                </Button>
            </div>
        );
    }

    return (
        <div className="container max-w-md mx-auto min-h-screen flex items-center justify-center">
            <Card className="w-full">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-primary-foreground p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                        <Building className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Register as Employer</CardTitle>
                    <CardDescription>
                        Register your company to start managing employees and payroll
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Company Name</Label>
                            <Input
                                id="name"
                                placeholder="Enter your company name"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                disabled={isPending || isConfirming}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Registration Fee</Label>
                            <div className="p-2 border rounded-md bg-muted/50">
                                <p className="text-sm text-muted-foreground">A one-time registration fee of 0.01 ETH is required</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Wallet Address</Label>
                            <div className="p-2 border rounded-md">
                                <p className="text-sm font-mono break-all">{address}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button
                        className="w-full"
                        onClick={handleRegister}
                        disabled={isPending || isConfirming || !companyName.trim()}
                    >
                        {isPending || isConfirming ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {isPending ? 'Confirming Transaction...' : 'Registering...'}
                            </>
                        ) : (
                            'Register & Pay Fee'
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
