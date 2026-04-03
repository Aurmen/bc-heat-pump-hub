import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Heat Pump ROI Calculator - BC | Canadian Heat Pump Hub',
  description: 'Calculate your heat pump payback period, annual savings, and 15-year ROI. Free interactive calculator for BC homeowners considering heat pump installation.',
};

export default function CalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
