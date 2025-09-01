// src/app/page.tsx
'use client'

import { useAccount } from 'wagmi';
import { useIsEmployer } from '@/hooks/use-opera-contract';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import ConnectButton from '@/components/connect-button';
import {
  ArrowRight,
  Coins,
  Building,
  Users,
  Clock,
  Award,
  ShieldCheck,
  Globe,
  Briefcase,
  Rocket,
  DollarSign,
  PiggyBank,
  LucideIcon
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { BackgroundBeams } from '@/components/ui/background-beams';
import { Card, CardContent } from '@/components/ui/card';
import { Footer } from '@/components/layout/footer';
import { MiniKitDetector } from '@/components/minikit-detector';

type UseCaseProps = {
  icon: LucideIcon;
  title: string;
  description: string;
}

function UseCase({ icon: Icon, title, description }: UseCaseProps) {
  return (
    <Card className="overflow-hidden border">
      <div className="h-2 bg-primary"></div>
      <CardContent className="p-6">
        <div className="mb-4">
          <div className={`w-12 h-12 rounded-full bg-primary flex items-center justify-center`}>
            <Icon className="h-6 w-6 text-primary-foreground" />
          </div>
        </div>
        <h3 className="text-xl mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export default function HomePage() {
  const { isConnected } = useAccount();
  const { isEmployer } = useIsEmployer();
  const { theme } = useTheme();

  return (
    <MiniKitDetector>
      <div className="space-y-24 py-8">
      {/* Hero Section */}
      <section className="min-h-screen justify-center text-center flex flex-col items-center gap-8">
        <BackgroundBeams />
        <Image
          src="/opera-logogram.svg"
          alt="Opera"
          width={240}
          height={60}
          className={theme === "light" ? "invert" : ""}
          priority
        />
        <h1 className="p-2 text-4xl md:text-7xl tracking-tighter bg-clip-text text-transparent dark:bg-gradient-to-b dark:from-neutral-200 dark:to-neutral-600 bg-gradient-to-b from-neutral-600 to-neutral-900">
          Open Payroll Raising Automatically
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          A decentralized payroll system that automatically pays your employees on time, every time. Built on blockchain for transparency and reliability.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mt-4 z-10">
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

      {/* About Section */}
      <section className="min-h-screen" id="about">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl mb-6">About Opera</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Opera is revolutionizing payroll management through blockchain technology,
              providing a transparent, secure, and automated solution for businesses of all sizes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card border rounded-4xl p-8 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl mb-4">Secure & Trustless</h3>
              <p className="text-muted-foreground">
                Opera leverages blockchain technology to create a trustless payroll system,
                eliminating the need for intermediaries and ensuring funds are securely allocated.
              </p>
            </div>

            <div className="bg-card border rounded-4xl p-8 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl mb-4">Global & Borderless</h3>
              <p className="text-muted-foreground">
                Pay employees anywhere in the world without currency conversion fees or
                banking restrictions. Opera makes global hiring and payments seamless.
              </p>
            </div>

            <div className="bg-card border rounded-4xl p-8 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl mb-4">Fully Automated</h3>
              <p className="text-muted-foreground">
                Opera&apos;s smart contracts automate the entire payroll process,
                from salary calculations to payments, ensuring employees are paid on time, every time.
              </p>
            </div>
          </div>

          <div className="mt-24 lg:p-24 rounded-4xl">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/2 flex justify-center">
                <div className="relative w-full max-w-md aspect-video bg-gradient-to-br from-primary/20 to-primary/5 rounded-4xl flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Image
                      src="/opera-logo.svg"
                      alt="Opera Flow Diagram"
                      width={120}
                      height={120}
                      className={theme === "light" ? "invert" : ""}
                    />
                  </div>
                </div>
              </div>
              <div className="lg:w-1/2">
                <h3 className="text-2xl mb-4">Built for the Future of Work</h3>
                <p className="text-muted-foreground mb-6">
                  As remote work and global teams become the norm, traditional payroll systems struggle
                  to keep up. Opera was designed from the ground up to address the unique challenges of
                  modern, distributed workforces.
                </p>
                <p className="text-muted-foreground">
                  Our platform leverages Chainlink Automation and VRF to ensure reliable,
                  verifiable operations with built-in incentives like bonus lotteries to boost team morale.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="min-h-screen" id="features">
        <h2 className="text-3xl text-center mb-12">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Building className="h-10 w-10" />}
            title="Employer Management"
            description="Register as an employer and manage your company&apos;s payroll system with ease."
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

      {/* Use Cases Section */}
      <section className="min-h-screen" id="use-cases">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl mb-6">Use Cases</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Opera is designed to serve a wide range of organizations and business models.
              Here&apos;s how different entities can leverage our platform:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <UseCase
              icon={Briefcase}
              title="Startups & SMEs"
              description="Streamline payroll operations without the need for dedicated HR staff, saving time and resources."
            />

            <UseCase
              icon={Globe}
              title="Distributed Teams"
              description="Pay remote workers across borders without the complexity of international banking and exchange rates."
            />

            <UseCase
              icon={Rocket}
              title="Web3 Organizations"
              description="Native integration with blockchain technology for DAOs and web3-native companies."
            />

            <UseCase
              icon={DollarSign}
              title="Freelancer Collectives"
              description="Manage regular payments to a network of freelancers with transparent fund allocation."
            />

            <UseCase
              icon={Users}
              title="Project-Based Teams"
              description="Configure payment schedules based on project milestones and deliverables."
            />

            <UseCase
              icon={PiggyBank}
              title="Profit-Sharing Models"
              description="Implement automatic profit distribution among team members based on predefined rules."
            />
          </div>

          <div className="mt-16 text-center">
            <Button asChild size="lg">
              <a href="#" target="_blank" rel="noopener noreferrer">
                Explore More Use Cases <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-muted rounded-4xl p-16">
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
      <section className="min-h-[70vh] flex flex-col items-center justify-center text-center">
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
        <Footer />
      </div>
    </MiniKitDetector>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-card border rounded-4xl px-8 py-10">
      <div className="text-primary mb-4">{icon}</div>
      <h3 className="text-xl mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
