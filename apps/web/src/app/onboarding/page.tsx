import { Suspense } from "react";
import { OnboardingContent } from "./OnboardingContent";

export default function OnboardingPage() {
  return (
    <Suspense fallback={null}>
      <OnboardingContent />
    </Suspense>
  );
}
