package com.campusfix.repository;

import com.campusfix.dto.ComplaintFilter;
import com.campusfix.entity.Complaint;
import com.campusfix.entity.ComplaintStatus;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.jpa.domain.Specification;

/**
 * Builds the dynamic WHERE clause for complaint searching.
 * Only the filters that the user actually filled in are added to the query.
 */
public final class ComplaintSpecification {

    private ComplaintSpecification() {
    }

    /**
     * @param filter       the filters from the query string
     * @param forcedUserId if not null, only this user's complaints are returned
     *                     (used for "My complaints" so a user can never see other people's data)
     */
    public static Specification<Complaint> from(ComplaintFilter filter, Long forcedUserId) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (forcedUserId != null) {
                predicates.add(cb.equal(root.get("submittedBy").get("id"), forcedUserId));
            } else if (filter.getUserId() != null) {
                predicates.add(cb.equal(root.get("submittedBy").get("id"), filter.getUserId()));
            }
            if (filter.getStatus() != null) {
                predicates.add(cb.equal(root.get("status"), filter.getStatus()));
            }
            if (filter.getPriority() != null) {
                predicates.add(cb.equal(root.get("priority"), filter.getPriority()));
            }
            if (filter.getCategoryId() != null) {
                predicates.add(cb.equal(root.get("category").get("id"), filter.getCategoryId()));
            }
            if (filter.getLocationId() != null) {
                predicates.add(cb.equal(root.get("location").get("id"), filter.getLocationId()));
            }
            if (filter.getDateFrom() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), filter.getDateFrom().atStartOfDay()));
            }
            if (filter.getDateTo() != null) {
                // "less than the start of the next day" includes the whole selected day
                predicates.add(cb.lessThan(root.get("createdAt"), filter.getDateTo().plusDays(1).atStartOfDay()));
            }
            if (Boolean.TRUE.equals(filter.getEscalatedOnly())) {
                predicates.add(cb.greaterThan(root.get("escalationCount"), 0));
            }
            if (Boolean.TRUE.equals(filter.getUnresolvedOnly())) {
                predicates.add(cb.notEqual(root.get("status"), ComplaintStatus.RESOLVED));
            }

            String search = filter.getSearch() == null ? "" : filter.getSearch().trim();
            if (!search.isEmpty()) {
                String pattern = "%" + escapeLike(search.toLowerCase()) + "%";
                List<Predicate> searchPredicates = new ArrayList<>();
                searchPredicates.add(cb.like(cb.lower(root.get("title")), pattern, '\\'));
                searchPredicates.add(cb.like(cb.lower(root.get("description")), pattern, '\\'));
                // Searching "42" or "#42" also finds the complaint with id 42
                String idText = search.startsWith("#") ? search.substring(1) : search;
                if (idText.matches("\\d{1,18}")) {
                    searchPredicates.add(cb.equal(root.get("id"), Long.parseLong(idText)));
                }
                predicates.add(cb.or(searchPredicates.toArray(new Predicate[0])));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    /** Makes %, _ and \ typed by the user behave like normal characters in a LIKE search. */
    private static String escapeLike(String text) {
        return text.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
    }
}
