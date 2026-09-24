import type { Option, Requirements, Kind, Plan } from '../domain/plan';
export type DataMetadata={source:string;updatedAt:string;quality:'demo'|'estimate'|'live';originalCurrency:string;displayCurrency:string};
export interface EventProvider { events(r: Required<Requirements>): Option[] }
export interface TicketProvider { tickets(r: Required<Requirements>): Option[] }
export interface TravelProvider { routes(r: Required<Requirements>): Option[] }
export interface HotelProvider { hotels(r: Required<Requirements>): Option[] }
export type MapPlace={id:string;name:string;kind:'arrival'|'hotel'|'venue';lat:number;lng:number};
export type RouteMode='walk'|'transit'|'drive';
export type MockRoute={id:string;from:MapPlace;to:MapPlace;mode:RouteMode;distance:number;minutes:number;steps:string[];polyline:{lat:number;lng:number}[];quality:'demo'|'live';label:string};
export interface MapProvider { loadCities(): Promise<{name:string;lat:number;lng:number}[]>;places(plan:Plan):Promise<MapPlace[]>;focus?(place:MapPlace):Promise<void> }
export interface RouteProvider {query(places:MapPlace[],mode:RouteMode,fail?:boolean):Promise<MockRoute[]>}
export interface PlanningProvider extends EventProvider, TicketProvider, TravelProvider, HotelProvider { metadata: DataMetadata }
export type Catalog = Record<Kind,Option[]>;
