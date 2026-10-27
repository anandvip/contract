import { createFileRoute } from "@tanstack/react-router";
import { FarmContractCalculator } from "@/components/farm-contract";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return <FarmContractCalculator />;
}
