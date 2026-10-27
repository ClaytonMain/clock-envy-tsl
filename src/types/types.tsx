import type { ReactNode } from "react";

export type StatsPosition = "tl" | "tr" | "bl" | "br";

export type ClockName = "Archduke Von Orben";

export type BasicClockConfig = {
  name: ClockName;
  displayOnSite: boolean;
  displayOnDebug?: boolean;
  info?: ReactNode;
  acknowledgements?: ReactNode;
};
