// Script pour corriger les erreurs de stats dans AdminStatsEnhanced
// Ce fichier définit la structure par défaut des stats

export const defaultStats = {
  revenue: {
    today: 0,
    yesterday: 0,
    thisWeek: 0,
    lastWeek: 0,
    thisMonth: 0,
    lastMonth: 0,
    thisYear: 0,
    lastYear: 0,
    byService: [],
    byMonth: []
  },
  clients: {
    total: 0,
    new: 0,
    active: 0,
    inactive: 0
  },
  appointments: {
    today: 0,
    thisWeek: 0,
    nextWeek: 0,
    occupancyRate: 0,
    averageDuration: 60,
    noShow: 0,
    lastMinuteBookings: 0,
    peakHours: []
  },
  satisfaction: {
    average: 4.8,
    total: 0,
    distribution: {
      '5': 0,
      '4': 0,
      '3': 0,
      '2': 0,
      '1': 0
    },
    recentFeedback: []
  },
  topServices: []
};