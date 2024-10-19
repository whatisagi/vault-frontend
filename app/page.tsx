import { OnboardingForm } from "@/components/onboarding-form";
import { Toaster } from "../components/ui/toast";

export default function Home() {
  return (
    <div className="mt-40">
      <OnboardingForm />
      <Toaster />
    </div>
  );
}
