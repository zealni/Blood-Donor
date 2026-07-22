import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface BloodRequest {
  id: string;
  hospital_name: string;
  blood_type: string;
  rhesus: string;
  bags_needed: number;
  urgency: string;
  created_at: string;
  status: string;
  hospital_coord: any;
}

export function useBloodRequests() {
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    async function fetchRequests() {
      try {
        const { data, error } = await supabase
          .from("blood_requests")
          .select("id, hospital_name, blood_type, rhesus, bags_needed, urgency, created_at, status, hospital_coord")
          .eq("status", "open");

        if (data && !error) {
          setRequests(data as BloodRequest[]);
        }
      } catch (e) {
        console.error("Error fetching blood requests:", e);
      } finally {
        setLoading(false);
      }
    }

    fetchRequests();

    const channel = supabase
      .channel("blood-requests-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "blood_requests" }, () => {
        fetchRequests();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { requests, loading };
}
