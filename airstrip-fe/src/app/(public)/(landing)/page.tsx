'use client';

import Cta from '@/components/landing/Cta';
import Features from '@/components/landing/Features';
import Footer from '@/components/landing/Footer';
import Hero from '@/components/landing/Hero';
import Navbar from '@/components/landing/Navbar';
import UseCases from '@/components/landing/UseCases';

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <UseCases />
      <Cta />
      <Footer />
    </>
  );
}
