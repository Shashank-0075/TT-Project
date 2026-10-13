package com.campusfix.dto;

import java.util.List;

/**
 * Dashboard data. The same structure is used for all three roles:
 * the student sees numbers for their own complaints, admin and maintenance see all complaints.
 *
 * highPriority = unresolved complaints with HIGH priority
 * escalated    = unresolved complaints that have been escalated at least once
 */
public record DashboardResponse(
        long total,
        long pending,
        long inProgress,
        long resolved,
        long highPriority,
        long escalated,
        List<ChartPoint> byCategory,
        List<ChartPoint> byStatus,
        List<ChartPoint> byPriority,
        List<ChartPoint> byLocation,
        List<ChartPoint> monthlyTrend) {
}
