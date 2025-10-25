// src/app/page.tsx
'use client'

import { useAccount } from 'wagmi';
import { useIsEmployer } from '@/hooks/use-multi-token-contract';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import ConnectButton from '@/components/connect-button';
import {
  ArrowRight,
  Coins,
  Building,
  Users,
  Globe,
  Briefcase,
  Rocket,
  DollarSign,
  PiggyBank,
  LucideIcon,
  TrendingUp,
  Zap
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { BackgroundBeams } from '@/components/ui/background-beams';
import { Card, CardContent } from '@/components/ui/card';
import { Footer } from '@/components/layout/footer';

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
          Gasless payroll powered by yield generation. Pay your employees in USDC or EURC without transaction fees. Built on Base for transparency and reliability.
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
              Opera is revolutionizing payroll with gasless transactions powered by DeFi yield generation.
              Pay your team in USDC or EURC without worrying about gas fees—our smart yield strategy covers all transaction costs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card border rounded-4xl p-8 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <PiggyBank className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl mb-4">Gasless Withdrawals</h3>
              <p className="text-muted-foreground">
                Employees withdraw salaries without paying gas fees. Our yield generation strategy from employer deposits automatically covers all transaction costs.
              </p>
            </div>

            <div className="bg-card border rounded-4xl p-8 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Coins className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl mb-4">Multi-Token Support</h3>
              <p className="text-muted-foreground">
                Pay salaries in USDC or EURC. Flexible stablecoin options for global teams with transparent on-chain tracking on Base network.
              </p>
            </div>

            <div className="bg-card border rounded-4xl p-8 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl mb-4">Yield-Powered Revenue</h3>
              <p className="text-muted-foreground">
                10% of deposits generate yield through DeFi protocols. Yield covers gas fees and creates sustainable protocol revenue—a win-win model.
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
                <h3 className="text-2xl mb-4">How Dynamic Yield Works</h3>
                <p className="text-muted-foreground mb-6">
                  When employers deposit funds, 10% automatically goes into DeFi yield generation (Aave, Compound).
                  This yield covers gas fees for employee withdrawals and generates protocol revenue—making
                  payroll completely gasless for your team.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <TrendingUp className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <span>Earn ~3-5% APY on deposited funds through Aave V3</span>
                  </li>
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <Zap className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <span>Yield automatically covers all employee withdrawal gas fees</span>
                  </li>
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <DollarSign className="h-5 w-5  flex-shrink-0 mt-0.5" />
                    <span>Excess yield becomes sustainable protocol revenue</span>
                  </li>
                </ul>
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
            icon={<Coins className="h-10 w-10" />}
            title="Multi-Token Payroll"
            description="Pay employees in USDC or EURC. Flexible stablecoin options for global teams with full on-chain transparency."
          />
          <FeatureCard
            icon={<Zap className="h-10 w-10" />}
            title="Gasless Withdrawals"
            description="Employees withdraw salaries with zero gas fees. Our yield strategy covers all transaction costs automatically."
          />
          <FeatureCard
            icon={<TrendingUp className="h-10 w-10" />}
            title="Yield Generation"
            description="10% of deposits earn yield through Aave V3. Passive income covers gas fees and creates protocol revenue."
          />
          <FeatureCard
            icon={<Building className="h-10 w-10" />}
            title="Employer Dashboard"
            description="Manage employees, track balances, monitor yield generation, and process payroll all in one place."
          />
          <FeatureCard
            icon={<Users className="h-10 w-10" />}
            title="Employee Management"
            description="Add, remove, and update employee details and salaries with different tokens per employee."
          />
          <FeatureCard
            icon={<DollarSign className="h-10 w-10" />}
            title="Transparent Revenue"
            description="Dynamic fee model (50-90%) based on pool size. Fair, transparent, and sustainable for protocol growth."
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="flex flex-col items-center text-center">
            <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center mb-4">1</div>
            <h3 className="text-xl mb-2">Register</h3>
            <p className="text-muted-foreground">Connect wallet and register as employer. Pay small fee in USDC or EURC.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center mb-4">2</div>
            <h3 className="text-xl mb-2">Deposit 110%</h3>
            <p className="text-muted-foreground">Deposit 100% for salaries + 10% for yield pool. Choose USDC or EURC per employee.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center mb-4">3</div>
            <h3 className="text-xl mb-2">Earn Yield</h3>
            <p className="text-muted-foreground">10% generates yield on Aave. Covers gas fees for all employee withdrawals.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center mb-4">4</div>
            <h3 className="text-xl mb-2">Gasless Payroll</h3>
            <p className="text-muted-foreground">Employees withdraw salary without gas fees. Completely gasless experience.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="min-h-[70vh] flex flex-col items-center justify-center text-center">
        <h2 className="text-3xl mb-4">Ready for Gasless Payroll?</h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Join Opera today and pay your team without gas fees. Our yield-powered model makes payroll sustainable for everyone.
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
