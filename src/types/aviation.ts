/**
 * Aviation types for the Prepavol application.
 */

export interface ArmSet {
  auxfuel: number;
  baggage: number;
  baggage2: number;
  bew: number;
  front: number;
  mainfuel: number;
  wingfuel: number;
  rear: number;
}

export interface PerformancePoint {
  alt: number;
  temp: number;
  distances: { [weight: number]: number };
}

export interface PlaneDefinition {
  arms: ArmSet;
  bagmax: number;
  bagmax2: number;
  sumbagmax: number;
  bew: number;
  envelope: [number, number][];
  fuelrate: number;
  maxauxfuel: number;
  maxmainfuel: number;
  maxwingfuel: number;
  mtow: number;
  planetype: string;
  unusable_mainfuel: number;
  unusable_wingfuel: number;
  unusable_auxfuel: number;
  numSeats: number;
  takeoff50ftGrid: PerformancePoint[];
  landing50ftGrid: PerformancePoint[];
}

export interface Fleet {
  [callsign: string]: PlaneDefinition;
}

export interface FlightPrepData {
  callsign: string;
  pax0: number;
  pax1: number;
  pax2: number;
  pax3: number;
  baggage: number;
  baggage2: number;
  mainfuel: number;
  leftwingfuel: number;
  rightwingfuel: number;
  auxfuel: number;
  tkalt: number;
  tktemp: number;
  tkqnh: number;
  ldalt: number;
  ldtemp: number;
  ldqnh: number;
}

export interface PerformanceResult {
  zp: number;
  zd: number;
  obstacle50ft: {
    asphalt: number[];
    grass: number[];
  };
}
