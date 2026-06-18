import { Suspense } from "react";
import { QuestionsContent } from "./QuestionsContent";

export default function QuestionsPage() {
  return (
    <Suspense fallback={null}>
      <QuestionsContent />
    </Suspense>
  );
}
