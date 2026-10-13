package com.campusfix.service;

import com.campusfix.dto.ChartPoint;
import com.campusfix.dto.DashboardResponse;
import com.campusfix.entity.ComplaintStatus;
import com.campusfix.entity.Priority;
import com.campusfix.repository.ComplaintRepository;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Calculates the statistics and chart data shown on the dashboards. All numbers come from MySQL. */
@Service
@Transactional(readOnly = true)
public class DashboardService {

    private static final int TREND_MONTHS = 6;

    private final ComplaintRepository complaintRepository;

    public DashboardService(ComplaintRepository complaintRepository) {
        this.complaintRepository = complaintRepository;
    }

    /** userId = null -> statistics of ALL complaints, otherwise only that user's complaints. */
    public DashboardResponse build(Long userId) {
        // --- status counts ---
        Map<ComplaintStatus, Long> statusCounts = new EnumMap<>(ComplaintStatus.class);
        for (ComplaintStatus status : ComplaintStatus.values()) {
            statusCounts.put(status, 0L);
        }
        for (Object[] row : complaintRepository.countGroupedByStatus(userId)) {
            statusCounts.put((ComplaintStatus) row[0], (Long) row[1]);
        }
        long pending = statusCounts.get(ComplaintStatus.PENDING);
        long inProgress = statusCounts.get(ComplaintStatus.IN_PROGRESS);
        long resolved = statusCounts.get(ComplaintStatus.RESOLVED);

        List<ChartPoint> byStatus = List.of(
                new ChartPoint("Pending", pending),
                new ChartPoint("In Progress", inProgress),
                new ChartPoint("Resolved", resolved));

        // --- priority counts ---
        Map<Priority, Long> priorityCounts = new EnumMap<>(Priority.class);
        for (Priority priority : Priority.values()) {
            priorityCounts.put(priority, 0L);
        }
        for (Object[] row : complaintRepository.countGroupedByPriority(userId)) {
            priorityCounts.put((Priority) row[0], (Long) row[1]);
        }
        List<ChartPoint> byPriority = List.of(
                new ChartPoint("Low", priorityCounts.get(Priority.LOW)),
                new ChartPoint("Medium", priorityCounts.get(Priority.MEDIUM)),
                new ChartPoint("High", priorityCounts.get(Priority.HIGH)));

        long highPriority = complaintRepository
                .countByPriorityExcludingStatus(Priority.HIGH, ComplaintStatus.RESOLVED, userId);
        long escalated = complaintRepository
                .countEscalatedExcludingStatus(ComplaintStatus.RESOLVED, userId);

        return new DashboardResponse(
                pending + inProgress + resolved,
                pending,
                inProgress,
                resolved,
                highPriority,
                escalated,
                toChartPoints(complaintRepository.countGroupedByCategory(userId)),
                byStatus,
                byPriority,
                toChartPoints(complaintRepository.countGroupedByLocation(userId)),
                buildMonthlyTrend(userId));
    }

    private List<ChartPoint> toChartPoints(List<Object[]> rows) {
        List<ChartPoint> points = new ArrayList<>();
        for (Object[] row : rows) {
            points.add(new ChartPoint((String) row[0], (Long) row[1]));
        }
        return points;
    }

    /** Complaints per month for the last 6 months (months without complaints show 0). */
    private List<ChartPoint> buildMonthlyTrend(Long userId) {
        YearMonth currentMonth = YearMonth.now();
        YearMonth firstMonth = currentMonth.minusMonths(TREND_MONTHS - 1L);
        LocalDate from = firstMonth.atDay(1);

        Map<YearMonth, Long> counts = new HashMap<>();
        for (Object[] row : complaintRepository.countGroupedByMonth(from.atStartOfDay(), userId)) {
            int year = ((Number) row[0]).intValue();
            int month = ((Number) row[1]).intValue();
            counts.put(YearMonth.of(year, month), (Long) row[2]);
        }

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM yyyy", Locale.ENGLISH);
        List<ChartPoint> trend = new ArrayList<>();
        for (int i = 0; i < TREND_MONTHS; i++) {
            YearMonth month = firstMonth.plusMonths(i);
            trend.add(new ChartPoint(month.format(formatter), counts.getOrDefault(month, 0L)));
        }
        return trend;
    }
}
