"use client";

import "./ui/welcome.css";
import { WelcomeCard } from "./ui";
import {
  BackgroundLayer,
  CardHeader,
  HeroSection,
  CtaButtons,
  CardFooter,
} from "./sections";

export default function WelcomePage() {
  return (
    <div className="welcome-page">
      <BackgroundLayer />
      <WelcomeCard footer={<CardFooter />}>
        <CardHeader />
        <HeroSection />
        <CtaButtons />
      </WelcomeCard>
    </div>
  );
}