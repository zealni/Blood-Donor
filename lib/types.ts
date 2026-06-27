// ============================================================================
// Shared Type Definitions
// Used across radar, profile, and auth pages
// ============================================================================

/** Blood type options */
export type BloodType = "A" | "B" | "AB" | "O" | "";

/** Rhesus factor options */
export type Rhesus = "+" | "-" | "";

/** Active user session (from Supabase Auth — stored in httpOnly cookies) */
export interface UserSession {
  id?: string;
  email: string;
  fullName: string;
  isLoggedIn: boolean;
  bloodType?: string;
  rhesus?: string;
  lastDonation?: string;
  location?: string;
  isAvailable?: boolean;
}

/** Full user profile (from Supabase `profiles` table + local enrichment) */
export interface UserProfile {
  id?: string;
  email: string;
  fullName: string;
  bloodType: BloodType;
  rhesus: Rhesus;
  lastDonation: string;
  isAvailable?: boolean;
  location?: string;
  isLoggedIn?: boolean;
}

/** A blood request signal displayed on the donor radar */
export interface RequestSignal {
  id: number;
  hospital: string;
  distance: string;
  distanceNum?: number;
  bloodType: string;
  urgency: string;
  time: string;
  rawTime?: string;
  requesterId: string;
  requesterName: string;
  phone: string;
  bagsNeeded: number;
}

/** Blood stock entry for the PMI widget */
export interface BloodStock {
  type: string;
  count: number;
  status: string;
  statusEn: string;
  color: string;
}
