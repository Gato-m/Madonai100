import { useCallback, useEffect, useState } from "react";
import { Airtable } from "../../lib/airtable";
import type { AirtableRecord, EventFields } from "../../types/airtable";

type UseEventsResult = {
  events: AirtableRecord<EventFields>[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useEvents(): UseEventsResult {
  const [events, setEvents] = useState<AirtableRecord<EventFields>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const records =
        (await Airtable.listEvents()) as AirtableRecord<EventFields>[];

      records.sort((a, b) => {
        const aDate = a.fields.sākums ? Date.parse(a.fields.sākums) : Infinity;
        const bDate = b.fields.sākums ? Date.parse(b.fields.sākums) : Infinity;
        return aDate - bDate;
      });

      setEvents(records);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load events");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    isLoading,
    error,
    refetch: fetchEvents,
  };
}
