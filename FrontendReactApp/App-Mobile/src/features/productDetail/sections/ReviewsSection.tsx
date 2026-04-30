import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';

import { productDetailTheme as t } from '../theme/productDetail.theme';
import { IconStar, IconStarEmpty } from '../../../shared/ui/Icons';
import { useReviews, Review } from '../hooks/useReviews';

// This API is ignored under the New Architecture and only needed on old Android setups.
if (
  Platform.OS === 'android' &&
  !global.nativeFabricUIManager &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Star row ────────────────────────────────────────────────────────────────
function StarRow({
  rating,
  size = 11,
  interactive = false,
  onRate,
}: {
  rating: number;
  size?: number;
  interactive?: boolean;
  onRate?: (r: number) => void;
}) {
  return (
    <View style={{ flexDirection: 'row', gap: 3 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <TouchableOpacity
          key={i}
          activeOpacity={interactive ? 0.7 : 1}
          disabled={!interactive}
          onPress={() => onRate?.(i)}
          hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
        >
          {i <= rating ? (
            <IconStar size={size} />
          ) : (
            <IconStarEmpty size={size} />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ─── Rating distribution bar ──────────────────────────────────────────────────
function RatingBar({ label, count, total }: { label: string; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <View style={b.row}>
      <Text style={b.label}>{label}</Text>
      <View style={b.track}>
        <View style={[b.fill, { width: `${pct}%` as any }]} />
      </View>
      <Text style={b.count}>{count}</Text>
    </View>
  );
}

// ─── Single review card ───────────────────────────────────────────────────────
function ReviewCard({ review }: { review: Review }) {
  return (
    <View style={s.card}>
      <View style={s.cardTop}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{(review.author ?? '?')[0].toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.author}>{review.author}</Text>
          <StarRow rating={review.rating} size={11} />
        </View>
        <Text style={s.date}>{review.date}</Text>
      </View>
      <Text style={s.comment}>{review.comment}</Text>
    </View>
  );
}

// ─── Write-review form ────────────────────────────────────────────────────────
function WriteReviewForm({
  onSubmit,
  submitting,
  submitError,
  submitSuccess,
}: {
  onSubmit: (rating: number, comment: string) => void;
  submitting: boolean;
  submitError: string | null;
  submitSuccess: boolean;
}) {
  const [rating, setRating]   = useState(0);
  const [comment, setComment] = useState('');
  const [touched, setTouched] = useState(false);

  const ratingError  = touched && rating === 0 ? 'Please select a star rating.' : null;
  const commentError = touched && comment.trim().length < 5 ? 'Comment is too short.' : null;

  const handleSubmit = useCallback(() => {
    setTouched(true);
    if (rating === 0 || comment.trim().length < 5) return;
    onSubmit(rating, comment.trim());
  }, [rating, comment, onSubmit]);

  // reset after success
  React.useEffect(() => {
    if (submitSuccess) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setRating(0);
      setComment('');
      setTouched(false);
    }
  }, [submitSuccess]);

  return (
    <View style={f.root}>
      <Text style={f.heading}>Write a Review</Text>

      {/* Star picker */}
      <Text style={f.fieldLabel}>Your Rating</Text>
      <StarRow rating={rating} size={28} interactive onRate={setRating} />
      {ratingError ? <Text style={f.fieldError}>{ratingError}</Text> : null}

      {/* Comment */}
      <Text style={[f.fieldLabel, { marginTop: t.spacing.md }]}>Your Comment</Text>
      <TextInput
        style={[f.input, commentError ? f.inputError : null]}
        placeholder="Share your experience…"
        placeholderTextColor={t.colors.textDisabled}
        multiline
        numberOfLines={4}
        value={comment}
        onChangeText={setComment}
        textAlignVertical="top"
        maxLength={1000}
      />
      {commentError ? <Text style={f.fieldError}>{commentError}</Text> : null}

      {/* API error */}
      {submitError ? (
        <View style={f.errorBanner}>
          <Text style={f.errorBannerText}>{submitError}</Text>
        </View>
      ) : null}

      {/* Success */}
      {submitSuccess ? (
        <View style={f.successBanner}>
          <Text style={f.successBannerText}>✓ Review submitted. Thank you!</Text>
        </View>
      ) : null}

      <TouchableOpacity
        style={[f.btn, submitting && f.btnDisabled]}
        activeOpacity={0.8}
        onPress={handleSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={f.btnText}>Submit Review</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

// ─── Main section ─────────────────────────────────────────────────────────────
type Props = {
  productId: number | null;
};

export function ReviewsSection({ productId }: Props) {
  const {
    reviews,
    stats,
    loading,
    submitting,
    error,
    submitError,
    submitSuccess,
    submitReview,
  } = useReviews(productId);

  const [showForm, setShowForm] = useState(false);

  const toggleForm = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowForm((v) => !v);
  }, []);

  // Build distribution from reviews array
  const distribution: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
  reviews.forEach((r) => { distribution[String(r.rating)] = (distribution[String(r.rating)] ?? 0) + 1; });

  return (
    <View style={s.root}>
      {/* ── Header ── */}
      <View style={s.header}>
        <Text style={s.title}>Reviews</Text>
        <View style={s.ratingPill}>
          <IconStar size={12} />
          <Text style={s.ratingVal}>{stats.avg.toFixed(1)}</Text>
          <Text style={s.ratingCount}>· {stats.total.toLocaleString()}</Text>
        </View>
      </View>

      {/* ── Overall rating + distribution ── */}
      {stats.total > 0 && (
        <View style={s.statsBox}>
          <View style={s.statsLeft}>
            <Text style={s.bigRating}>{stats.avg.toFixed(1)}</Text>
            <StarRow rating={Math.round(stats.avg)} size={16} />
            <Text style={s.totalLabel}>{stats.total} reviews</Text>
          </View>
          <View style={s.statsRight}>
            {['5', '4', '3', '2', '1'].map((star) => (
              <RatingBar
                key={star}
                label={star}
                count={distribution[star] ?? 0}
                total={stats.total}
              />
            ))}
          </View>
        </View>
      )}

      {/* ── Write review toggle ── */}
      <TouchableOpacity
        style={s.writeBtn}
        activeOpacity={0.8}
        onPress={toggleForm}
      >
        <Text style={s.writeBtnText}>
          {showForm ? '✕ Cancel' : '✏️  Write a Review'}
        </Text>
      </TouchableOpacity>

      {/* ── Form ── */}
      {showForm && (
        <WriteReviewForm
          onSubmit={submitReview}
          submitting={submitting}
          submitError={submitError}
          submitSuccess={submitSuccess}
        />
      )}

      {/* ── Loading ── */}
      {loading && (
        <ActivityIndicator
          size="small"
          color={t.colors.primary}
          style={{ marginVertical: t.spacing.lg }}
        />
      )}

      {/* ── Error ── */}
      {error && !loading && (
        <Text style={s.errorText}>Could not load reviews: {error}</Text>
      )}

      {/* ── Reviews list ── */}
      {!loading && reviews.map((r) => (
        <ReviewCard key={r.review_id} review={r} />
      ))}

      {!loading && !error && reviews.length === 0 && (
        <Text style={s.emptyText}>No reviews yet. Be the first!</Text>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: {
    paddingHorizontal: t.spacing.xl,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: t.spacing.md,
  },
  title: {
    fontSize: t.font.lg,
    fontWeight: '700',
    color: t.colors.textPrimary,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: t.colors.bgAlt,
    paddingHorizontal: t.spacing.md,
    paddingVertical: 5,
    borderRadius: t.radius.full,
  },
  ratingVal: {
    fontSize: t.font.sm,
    fontWeight: '700',
    color: t.colors.textPrimary,
  },
  ratingCount: {
    fontSize: t.font.sm,
    color: t.colors.textDisabled,
  },

  // stats box
  statsBox: {
    flexDirection: 'row',
    backgroundColor: t.colors.bgCard,
    borderRadius: t.radius.lg,
    borderWidth: 1,
    borderColor: t.colors.borderLight,
    padding: t.spacing.lg,
    marginBottom: t.spacing.md,
    gap: t.spacing.lg,
    ...t.shadow?.card,
  },
  statsLeft: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minWidth: 64,
  },
  bigRating: {
    fontSize: 36,
    fontWeight: '800',
    color: t.colors.textPrimary,
    lineHeight: 40,
  },
  totalLabel: {
    fontSize: t.font.xs,
    color: t.colors.textDisabled,
    marginTop: 2,
  },
  statsRight: {
    flex: 1,
    justifyContent: 'center',
    gap: 5,
  },

  // write review button
  writeBtn: {
    borderWidth: 1.5,
    borderColor: t.colors.primary,
    borderRadius: t.radius.lg,
    paddingVertical: t.spacing.md,
    alignItems: 'center',
    marginBottom: t.spacing.md,
  },
  writeBtnText: {
    fontSize: t.font.sm,
    fontWeight: '600',
    color: t.colors.primary,
  },

  // card
  card: {
    backgroundColor: t.colors.bgCard,
    borderRadius: t.radius.lg,
    padding: t.spacing.lg,
    marginBottom: t.spacing.md,
    borderWidth: 1,
    borderColor: t.colors.borderLight,
    ...t.shadow?.card,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.md,
    marginBottom: t.spacing.sm,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: t.radius.full,
    backgroundColor: t.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: t.font.md,
    fontWeight: '700',
    color: t.colors.primary,
  },
  author: {
    fontSize: t.font.sm,
    fontWeight: '600',
    color: t.colors.textPrimary,
    marginBottom: 2,
  },
  date: {
    fontSize: t.font.xs,
    color: t.colors.textDisabled,
  },
  comment: {
    fontSize: t.font.sm,
    color: t.colors.textSecondary,
    lineHeight: 20,
  },

  // misc
  errorText: {
    fontSize: t.font.sm,
    color: t.colors.error,
    textAlign: 'center',
    marginVertical: t.spacing.md,
  },
  emptyText: {
    fontSize: t.font.sm,
    color: t.colors.textDisabled,
    textAlign: 'center',
    marginVertical: t.spacing.xl,
  },
});

// ─── Form styles ──────────────────────────────────────────────────────────────
const f = StyleSheet.create({
  root: {
    backgroundColor: t.colors.bgCard,
    borderRadius: t.radius.lg,
    borderWidth: 1,
    borderColor: t.colors.borderLight,
    padding: t.spacing.lg,
    marginBottom: t.spacing.md,
    ...t.shadow?.card,
  },
  heading: {
    fontSize: t.font.md,
    fontWeight: '700',
    color: t.colors.textPrimary,
    marginBottom: t.spacing.md,
  },
  fieldLabel: {
    fontSize: t.font.xs,
    fontWeight: '600',
    color: t.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: t.spacing.sm,
  },
  fieldError: {
    fontSize: t.font.xs,
    color: t.colors.error,
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: t.colors.borderLight,
    borderRadius: t.radius.md,
    paddingHorizontal: t.spacing.md,
    paddingVertical: t.spacing.sm,
    fontSize: t.font.sm,
    color: t.colors.textPrimary,
    backgroundColor: t.colors.bgMain,
    minHeight: 90,
  },
  inputError: {
    borderColor: t.colors.error,
  },
  errorBanner: {
    backgroundColor: t.colors.errorSoft,
    borderRadius: t.radius.sm,
    padding: t.spacing.sm,
    marginTop: t.spacing.sm,
  },
  errorBannerText: {
    fontSize: t.font.xs,
    color: t.colors.error,
    fontWeight: '600',
  },
  successBanner: {
    backgroundColor: '#E8F5E9',
    borderRadius: t.radius.sm,
    padding: t.spacing.sm,
    marginTop: t.spacing.sm,
  },
  successBannerText: {
    fontSize: t.font.xs,
    color: '#2E7D32',
    fontWeight: '600',
  },
  btn: {
    backgroundColor: t.colors.primary,
    borderRadius: t.radius.lg,
    paddingVertical: t.spacing.md,
    alignItems: 'center',
    marginTop: t.spacing.md,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    fontSize: t.font.sm,
    fontWeight: '700',
    color: '#fff',
  },
});

// ─── Distribution bar styles ──────────────────────────────────────────────────
const b = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontSize: t.font.xs,
    color: t.colors.textSecondary,
    width: 10,
    textAlign: 'right',
  },
  track: {
    flex: 1,
    height: 6,
    backgroundColor: t.colors.bgAlt,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: t.colors.primary,
    borderRadius: 3,
  },
  count: {
    fontSize: t.font.xs,
    color: t.colors.textDisabled,
    width: 20,
    textAlign: 'right',
  },
});
