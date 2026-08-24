// Shared static data used across the app.

export const COLORS = ['#8C9B65', '#EDA426', '#E8703A', '#F6C89F', '#E15B3E', '#C9B896'];
export const RATINGS = ['😐', '🙂', '😄', '🤩', '🏆'];
export const PIN_COLORS = ['pin-red', 'pin-gold', 'pin-silver', 'pin-green', 'pin-blue'];

export const TRACKS = {
  week: { label: 'WEEK', badgeClass: 'week', ms: 7 * 86400000, dueLabel: 'this week', color: 'var(--gold)' },
  month: { label: 'MONTH', badgeClass: 'month', ms: 30 * 86400000, dueLabel: 'this month', color: 'var(--violet)' }
};
