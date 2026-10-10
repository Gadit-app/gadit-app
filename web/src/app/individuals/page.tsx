import type { Metadata } from "next";
import { individualsMetadata } from "./individuals-metadata";
import { IndividualsLandingSwitch } from "./IndividualsLandingSwitch";

export function generateMetadata(): Promise<Metadata> {
  return individualsMetadata();
}

export default function Page() {
  return <IndividualsLandingSwitch />;
}
