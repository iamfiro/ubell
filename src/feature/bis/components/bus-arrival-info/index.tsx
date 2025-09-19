import { Bus as BusIcon } from "lucide-react";

import { FlexAlign, HStack } from "@/shared/components";
import { Bus } from "@/shared/types";
import { getBusArriveSoon } from "@/shared/utils/bus";

import s from "./style.module.scss";

export default function BusArrivalCard(props: Bus) {
  const { id, name, arrivalTime, remainingStops, isCalled, routeType } = props;

  const isArriveSoon = getBusArriveSoon({ arrivalTime, remainingStops });

  return (
    <HStack fullWidth className={s.bus_arrival_card}>
      <div className={s.bus_information} data-bus-type={routeType}>
        <BusIcon />
        <p>{name}</p>
      </div>
      <HStack align={FlexAlign.Center} gap={24}>
        <p className={s.bus_arrival_time} data-arrive-soon={isArriveSoon}>
          {isArriveSoon ? "곧 도착" : `${arrivalTime}분`}
        </p>
        <p className={s.bus_remaining_stops}>{remainingStops} 정거장 남음</p>
      </HStack>
      <button
        className={`${s.bus_call_button} ${isCalled ? s.bus_call_button_called : ""}`}
      >
        호출
      </button>
    </HStack>
  );
}
