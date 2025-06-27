// src/app/register/page.tsx
'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useIsEmployer, useRegisterAsEmployer } from '@/hooks/use-opera-contract';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle } from 'lucide-react';

export default function Registration() {
    const { isConnected } = useAccount();
    const { isEmployer, isLoading: isLoadingEmployerStatus } = useIsEmployer();

    const [companyName, setCompanyName] = useState('');

    const {
        register,
        isPending,
        hash,
        isConfirming,
        isConfirmed,
        error
    } = useRegisterAsEmployer();

    if (!isConnected) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Employer Registration</CardTitle>
                    <CardDescription>Please connect your wallet to register as an employer.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    if (isLoadingEmployerStatus) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Employer Registration</CardTitle>
                    <CardDescription>Checking your registration status...</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    if (isEmployer) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Already Registered</CardTitle>
                    <CardDescription>You are already registered as an employer in the Opera system.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Alert className="bg-green-50 dark:bg-green-900/20">
                        <CheckCircle className="h-4 w-4" />
                        <AlertTitle>Registration Confirmed</AlertTitle>
                        <AlertDescription>
                            Your employer account is active. You can now add employees and manage your payroll.
                        </AlertDescription>
                    </Alert>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" variant="outline" onClick={() => window.location.href = "/employer"}>
                        Go to Employer Dashboard
                    </Button>
                </CardFooter>
            </Card>
        );
    }

    const handleRegistration = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!companyName) return;

        try {
            await register(companyName);
        } catch (err) {
            console.error('Registration failed:', err);
        }
    };

    return (
        <Card className="max-w-md mx-auto">
            <CardHeader>
                <CardTitle>Employer Registration</CardTitle>
                <CardDescription>
                    Register your company as an employer on the Opera payroll system
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                            {error.message || 'Failed to register. Please try again.'}
                        </AlertDescription>
                    </Alert>
                )}

                {isConfirmed && (
                    <Alert className="bg-green-50 dark:bg-green-900/20">
                        <CheckCircle className="h-4 w-4" />
                        <AlertTitle>Registration Successful</AlertTitle>
                        <AlertDescription>
                            Your company has been registered as an employer! You can now manage your employees.
                        </AlertDescription>
                    </Alert>
                )}

                {!isConfirmed && (
                    <form onSubmit={handleRegistration} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="companyName">Company Name</Label>
                            <Input
                                id="companyName"
                                type="text"
                                placeholder="Acme Inc."
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                disabled={isPending || isConfirming}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="registrationFee">Registration Fee</Label>
                            <Input
                                id="registrationFee"
                                type="text"
                                value="0.01 ETH"
                                disabled
                            />
                            <p className="text-sm text-muted-foreground">
                                This fee is required to register as an employer. It helps prevent spam registrations.
                            </p>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isPending || isConfirming || !companyName}
                        >
                            {isPending ? 'Registering...' : isConfirming ? 'Confirming...' : 'Register as Employer'}
                        </Button>
                    </form>
                )}

                {hash && (
                    <div className="mt-4 p-3 bg-muted rounded-md">
                        <Label className="text-xs">Transaction Hash</Label>
                        <p className="text-xs break-all font-mono">{hash}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
