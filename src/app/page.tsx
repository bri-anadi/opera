// src/app/page.tsx
'use client'

import { useAccount } from 'wagmi';
import { useIsEmployer } from '@/hooks/use-opera-contract';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import ConnectButton from '@/components/connect-button';
import { ArrowRight, Coins, Building, Users, Clock, Award } from 'lucide-react';

export default function HomePage() {
  const { isConnected } = useAccount();
  const { isEmployer } = useIsEmployer();

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="min-h-screen justify-center text-center flex flex-col items-center gap-8">
        <Image
          src="/opera-logogram.svg"
          alt="Opera"
          width={240}
          height={60}
          className="invert"
          priority
        />
        <h1 className="text-4xl md:text-6xl tracking-tighter">
          Open Payroll Raising Automatically
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          A decentralized payroll system that automatically pays your employees on time, every time. Built on blockchain for transparency and reliability.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          {isConnected ? (
            <>
              {isEmployer ? (
                <Button asChild size="lg">
                  <Link href="/employer">
                    Go to Employer Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button asChild size="lg">
                  <Link href="/register">
                    Register as Employer <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
              <Button asChild variant="outline" size="lg">
                <Link href="/employee">
                  Go to Employee Dashboard
                </Link>
              </Button>
            </>
          ) : (
            <ConnectButton />
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <h2 className="text-3xl text-center mb-12">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Building className="h-10 w-10" />}
            title="Employer Management"
            description="Register as an employer and manage your company's payroll system with ease."
          />
          <FeatureCard
            icon={<Users className="h-10 w-10" />}
            title="Employee Administration"
            description="Add, remove, and update employee details and salaries directly from the dashboard."
          />
          <FeatureCard
            icon={<Coins className="h-10 w-10" />}
            title="Automatic Payments"
            description="Salary payments are processed automatically on schedule with Chainlink Automation."
          />
          <FeatureCard
            icon={<Clock className="h-10 w-10" />}
            title="Payment Schedule"
            description="Set payment intervals that work for your business and employees."
          />
          <FeatureCard
            icon={<Award className="h-10 w-10" />}
            title="Bonus Lottery"
            description="Randomly select employees for bonuses to boost morale and reward performance."
          />
          <FeatureCard
            icon={<Coins className="h-10 w-10" />}
            title="Fund Management"
            description="Deposit and manage funds for payroll in a transparent and secure way."
          />
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-muted rounded-xl p-16">
        <h2 className="text-3xl text-center mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-24">
          <div className="flex flex-col items-center text-center">
            <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center mb-4">1</div>
            <h3 className="text-xl mb-2">Register</h3>
            <p className="text-muted-foreground">Connect your wallet and register as an employer with a small fee.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center mb-4">2</div>
            <h3 className="text-xl mb-2">Configure</h3>
            <p className="text-muted-foreground">Add employees, set salaries, and deposit funds to cover payroll.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center mb-4">3</div>
            <h3 className="text-xl mb-2">Automate</h3>
            <p className="text-muted-foreground">Let the system handle payments automatically based on schedules.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center">
        <h2 className="text-3xl mb-4">Ready to modernize your payroll?</h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Join Opera today and experience the future of payroll management.
        </p>
        {!isConnected ? (
          <div className="flex justify-center">
            <ConnectButton />
          </div>
        ) : !isEmployer ? (
          <Button asChild size="lg">
            <Link href="/register">
              Register as Employer <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <Button asChild size="lg">
            <Link href="/employer">
              Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
      </section>

      {/* Footer */}
      <footer className="py-8 text-center">
        <p className="text-muted-foreground">
          &copy; {new Date().getFullYear()} Opera. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-card border rounded-lg p-6">
      <div className="text-primary mb-4">{icon}</div>
      <h3 className="text-xl mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
