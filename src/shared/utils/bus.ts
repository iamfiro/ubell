import { Bus } from "@/shared/types";

export function getBusArriveSoon({
  arrivalTime,
  remainingStops,
}: Pick<Bus, "arrivalTime" | "remainingStops">) {
  return arrivalTime <= 60 && remainingStops >= 1;
}
