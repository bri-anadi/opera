// src/app/admin/page.tsx
import { useState } from 'react';
import { useAccount } from 'wagmi';
import { formatEther } from 'viem';
import {
    useContractStats,
    useSetBonusAmount,
    useToggleBonusLottery,
    useSetEmployerRegistrationFee,
    useRunBonusLottery,
    usePayAllEmployees,
    useEmergencyWithdraw
} from '@/hooks/use-opera-contract';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export default function AdminDashboard() {
    const { address, isConnected } = useAccount();
    const { stats, isLoading } = useContractStats();

    const [newBonusAmount, setNewBonusAmount] = useState('');
    const [newRegistrationFee, setNewRegistrationFee] = useState('');
    const [bonusEnabled, setBonusEnabled] = useState(true);

    const { setBonusAmount, isPending: isSettingBonus } = useSetBonusAmount();
    const { toggleLottery, isPending: isTogglingLottery } = useToggleBonusLottery();
    const { setFee, isPending: isSettingFee } = useSetEmployerRegistrationFee();
    const { runLottery, isPending: isRunningLottery } = useRunBonusLottery();
    const { payAllEmployees, isPending: isPayingAll } = usePayAllEmployees();
    const { withdraw, isPending: isWithdrawing } = useEmergencyWithdraw();

    const ownerAddress = '0x6b175474e89094c44da98b954eedeac495271d0f'; // This should be dynamically fetched
    const isOwner = address === ownerAddress;

    if (!isConnected) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Admin Dashboard</CardTitle>
                    <CardDescription>Please connect your wallet to access the admin dashboard.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    if (!isOwner) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Admin Dashboard</CardTitle>
                    <CardDescription>You do not have admin access to this contract.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Admin Dashboard</CardTitle>
                    <CardDescription>Loading contract stats...</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    const handleSetBonusAmount = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newBonusAmount) return;

        try {
            await setBonusAmount(newBonusAmount);
            setNewBonusAmount('');
        } catch (error) {
            console.error('Failed to set bonus amount:', error);
        }
    };

    const handleSetRegistrationFee = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newRegistrationFee) return;

        try {
            await setFee(newRegistrationFee);
            setNewRegistrationFee('');
        } catch (error) {
            console.error('Failed to set registration fee:', error);
        }
    };

    const handleToggleLottery = async (enabled: boolean) => {
        try {
            await toggleLottery(enabled);
            setBonusEnabled(enabled);
        } catch (error) {
            console.error('Failed to toggle bonus lottery:', error);
        }
    };

    const handleRunLottery = async () => {
        try {
            await runLottery();
        } catch (error) {
            console.error('Failed to run bonus lottery:', error);
        }
    };

    const handlePayAllEmployees = async () => {
        try {
            await payAllEmployees();
        } catch (error) {
            console.error('Failed to pay all employees:', error);
        }
    };

    const handleEmergencyWithdraw = async () => {
        if (!confirm('Are you sure you want to withdraw all contract funds? This is for emergencies only.')) {
            return;
        }

        try {
            await withdraw();
        } catch (error) {
            console.error('Failed to withdraw funds:', error);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Admin Dashboard</CardTitle>
                    <CardDescription>Manage Opera payroll system</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h3 className="text-sm font-medium">Total Employers</h3>
                            <p className="text-2xl font-bold">{stats.employerCount}</p>
                            <p className="text-sm text-muted-foreground">{stats.activeEmployerCount} active</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium">Total Employees</h3>
                            <p className="text-2xl font-bold">{stats.employeeCount}</p>
                            <p className="text-sm text-muted-foreground">{stats.activeEmployeeCount} active</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium">Monthly Payroll</h3>
                            <p className="text-2xl font-bold">{formatEther(stats.totalMonthlySalary)} ETH</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium">Contract Balance</h3>
                            <p className="text-2xl font-bold">{formatEther(stats.contractBalance)} ETH</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium">Bonus Amount</h3>
                            <p className="text-2xl font-bold">{formatEther(stats.bonusAmount)} ETH</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium">Last Bonus Winner</h3>
                            <p className="text-sm break-all">{stats.lastBonusWinner || 'None'}</p>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="justify-between">
                    <Button
                        variant="outline"
                        onClick={handlePayAllEmployees}
                        disabled={isPayingAll}
                    >
                        {isPayingAll ? 'Processing...' : 'Pay All Employees'}
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleEmergencyWithdraw}
                        disabled={isWithdrawing}
                    >
                        {isWithdrawing ? 'Processing...' : 'Emergency Withdraw'}
                    </Button>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Bonus Settings</CardTitle>
                    <CardDescription>Configure the employee bonus lottery</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <form onSubmit={handleSetBonusAmount} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="bonusAmount">Bonus Amount (ETH)</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="bonusAmount"
                                    type="text"
                                    placeholder="0.1"
                                    value={newBonusAmount}
                                    onChange={(e) => setNewBonusAmount(e.target.value)}
                                />
                                <Button
                                    type="submit"
                                    disabled={isSettingBonus || !newBonusAmount}
                                >
                                    {isSettingBonus ? 'Setting...' : 'Set Amount'}
                                </Button>
                            </div>
                        </div>
                    </form>

                    <div className="flex items-center justify-between">
                        <Label htmlFor="bonusEnabled">Enable Bonus Lottery</Label>
                        <Switch
                            id="bonusEnabled"
                            checked={bonusEnabled}
                            onCheckedChange={handleToggleLottery}
                            disabled={isTogglingLottery}
                        />
                    </div>

                    <Button
                        variant="outline"
                        onClick={handleRunLottery}
                        disabled={isRunningLottery || !bonusEnabled}
                        className="w-full"
                    >
                        {isRunningLottery ? 'Running...' : 'Run Bonus Lottery Now'}
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Registration Fee</CardTitle>
                    <CardDescription>Set the employer registration fee</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSetRegistrationFee} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="registrationFee">Registration Fee (ETH)</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="registrationFee"
                                    type="text"
                                    placeholder="0.01"
                                    value={newRegistrationFee}
                                    onChange={(e) => setNewRegistrationFee(e.target.value)}
                                />
                                <Button
                                    type="submit"
                                    disabled={isSettingFee || !newRegistrationFee}
                                >
                                    {isSettingFee ? 'Setting...' : 'Set Fee'}
                                </Button>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
