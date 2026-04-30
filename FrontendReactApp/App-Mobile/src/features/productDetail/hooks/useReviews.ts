import { useState, useEffect, useCallback } from 'react';
import { odooClient } from '../../../core/api/odooClient'; // 👈 ajusta el path a tu proyecto

const LOG = '[useReviews]';

export interface Review {
  review_id: number;
  author:    string;
  rating:    number;
  comment:   string;
  date:      string;
}

export interface ReviewStats {
  avg:          number;
  total:        number;
  distribution: Record<string, number>;
}

interface ReviewsResponse {
  ok:            boolean;
  product_id:    number;
  total_reviews: number;
  stats:         ReviewStats;
  reviews:       Review[];
}

interface SubmitResponse {
  ok:     boolean;
  review: Review;
  stats:  ReviewStats;
  error?: string | Record<string, string>;
}

interface UseReviewsReturn {
  reviews:       Review[];
  stats:         ReviewStats;
  loading:       boolean;
  submitting:    boolean;
  error:         string | null;
  submitError:   string | null;
  submitSuccess: boolean;
  submitReview:  (rating: number, comment: string) => Promise<boolean>;
  refresh:       () => void;
}

const DEFAULT_STATS: ReviewStats = { avg: 0, total: 0, distribution: {} };

export function useReviews(productId: number | null): UseReviewsReturn {
  const resolvedProductId = productId == null ? null : Math.abs(productId);
  const [reviews,       setReviews]       = useState<Review[]>([]);
  const [stats,         setStats]         = useState<ReviewStats>(DEFAULT_STATS);
  const [loading,       setLoading]       = useState(false);
  const [submitting,    setSubmitting]    = useState(false);
  const [error,         setError]         = useState<string | null>(null);
  const [submitError,   setSubmitError]   = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [refreshKey,    setRefreshKey]    = useState(0);

  // ── fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!resolvedProductId) {
      console.log(`${LOG} productId is null/undefined — skipping fetch`);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const endpoint = `/api/products/${resolvedProductId}/reviews?limit=50`;
    console.log(`${LOG} GET ${endpoint}`);

    odooClient.get<ReviewsResponse>(endpoint)
      .then(({ data, error: httpError, status }) => {
        console.log(`${LOG} GET response | status=${status} | error=${httpError}`);
        console.log(`${LOG} GET data=`, JSON.stringify(data, null, 2));

        if (cancelled) return;

        if (httpError || !data) {
          console.warn(`${LOG} fetch failed: ${httpError}`);
          setError(httpError ?? 'Failed to load reviews');
          return;
        }

        if (!data.ok) {
          console.warn(`${LOG} server returned ok=false`);
          setError('Server error loading reviews');
          return;
        }

        setReviews(data.reviews ?? []);
        setStats(data.stats ?? DEFAULT_STATS);
        console.log(`${LOG} loaded ${data.reviews?.length ?? 0} reviews, avg=${data.stats?.avg}`);
      })
      .catch((err) => {
        // odooClient ya captura errores de red, pero por si acaso
        console.error(`${LOG} unexpected error in fetch:`, err);
        if (!cancelled) setError('Unexpected error');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [resolvedProductId, refreshKey]);

  // ── submit ─────────────────────────────────────────────────────────────────
  const submitReview = useCallback(async (rating: number, comment: string): Promise<boolean> => {
    if (!resolvedProductId) {
      console.warn(`${LOG} submitReview called without productId`);
      return false;
    }

    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    const endpoint = `/api/products/${resolvedProductId}/reviews`;
    const url = odooClient.buildUrl(endpoint);

    // Odoo **kwargs lee form-urlencoded, NO json
    const body = new URLSearchParams({ rating: String(rating), comment }).toString();

    console.log(`${LOG} POST ${url}`);
    console.log(`${LOG} POST body: ${body}`);

    try {
      const { data, error, status } = await odooClient.request<SubmitResponse>(endpoint, {
        method: 'POST',
        rawBody: body,
        accept: 'application/json',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeoutMs: 30000,
      });

      console.log(`${LOG} POST status=${status}`);
      console.log(`${LOG} POST data=`, JSON.stringify(data, null, 2));

      if (error || !data?.ok) {
        const msg =
          typeof data?.error === 'object'
            ? Object.values(data.error).join(' ')
            : data?.error ?? error ?? `HTTP ${status}`;
        console.warn(`${LOG} POST failed: ${msg}`);
        setSubmitError(msg);
        return false;
      }

      console.log(`${LOG} POST success, review_id=${data.review?.review_id}`);

      // optimistic update
      setReviews((prev) => [data.review, ...prev]);
      setStats(data.stats ?? DEFAULT_STATS);
      setSubmitSuccess(true);
      return true;

    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`${LOG} POST network error: ${msg}`);
      console.error(`${LOG} Full error object:`, err);
      console.error(`${LOG} Full URL: ${url}`);
      console.error(
        `${LOG} Tip: verifica que el dispositivo/emulador alcanza ${odooClient.buildUrl('')} ` +
        `y que el servidor Odoo está corriendo y acepta conexiones externas.`
      );
      setSubmitError(`Network error: ${msg}`);
      return false;

    } finally {
      setSubmitting(false);
    }
  }, [resolvedProductId]);

  const refresh = useCallback(() => {
    console.log(`${LOG} manual refresh triggered`);
    setRefreshKey((k) => k + 1);
  }, []);

  return {
    reviews,
    stats,
    loading,
    submitting,
    error,
    submitError,
    submitSuccess,
    submitReview,
    refresh,
  };
}
