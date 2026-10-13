package com.campusfix.service;

import com.campusfix.dto.ComplaintDetailResponse;
import com.campusfix.dto.ComplaintFilter;
import com.campusfix.dto.ComplaintForm;
import com.campusfix.dto.ComplaintSummaryResponse;
import com.campusfix.dto.ComplaintUpdateRequest;
import com.campusfix.dto.EscalationLogResponse;
import com.campusfix.dto.PageResponse;
import com.campusfix.dto.ResolutionResponse;
import com.campusfix.dto.StatusHistoryResponse;
import com.campusfix.entity.Category;
import com.campusfix.entity.Complaint;
import com.campusfix.entity.ComplaintStatus;
import com.campusfix.entity.ComplaintStatusHistory;
import com.campusfix.entity.Location;
import com.campusfix.entity.RoleName;
import com.campusfix.entity.User;
import com.campusfix.exception.BadRequestException;
import com.campusfix.exception.ResourceNotFoundException;
import com.campusfix.repository.CategoryRepository;
import com.campusfix.repository.ComplaintRepository;
import com.campusfix.repository.ComplaintSpecification;
import com.campusfix.repository.ComplaintStatusHistoryRepository;
import com.campusfix.repository.EscalationLogRepository;
import com.campusfix.repository.LocationRepository;
import com.campusfix.repository.ResolutionRepository;
import com.campusfix.repository.UserRepository;
import com.campusfix.security.UserPrincipal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Everything about complaints that students/staff do, plus the shared read operations
 * (search and details) that admin and maintenance staff also use.
 */
@Service
@Transactional
public class ComplaintService {

    private static final Set<String> SORTABLE_FIELDS = Set.of("createdAt", "updatedAt", "id");

    private final ComplaintRepository complaintRepository;
    private final CategoryRepository categoryRepository;
    private final LocationRepository locationRepository;
    private final UserRepository userRepository;
    private final ComplaintStatusHistoryRepository historyRepository;
    private final ResolutionRepository resolutionRepository;
    private final EscalationLogRepository escalationLogRepository;
    private final FileStorageService fileStorageService;

    public ComplaintService(ComplaintRepository complaintRepository,
                            CategoryRepository categoryRepository,
                            LocationRepository locationRepository,
                            UserRepository userRepository,
                            ComplaintStatusHistoryRepository historyRepository,
                            ResolutionRepository resolutionRepository,
                            EscalationLogRepository escalationLogRepository,
                            FileStorageService fileStorageService) {
        this.complaintRepository = complaintRepository;
        this.categoryRepository = categoryRepository;
        this.locationRepository = locationRepository;
        this.userRepository = userRepository;
        this.historyRepository = historyRepository;
        this.resolutionRepository = resolutionRepository;
        this.escalationLogRepository = escalationLogRepository;
        this.fileStorageService = fileStorageService;
    }

    // ------------------------------------------------------------------
    // Create / edit (student or staff)
    // ------------------------------------------------------------------

    public ComplaintDetailResponse create(ComplaintForm form, UserPrincipal principal) {
        Category category = findActiveCategory(form.getCategoryId());
        Location location = findActiveLocation(form.getLocationId());
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", principal.getId()));

        // Save the image first so an invalid file is rejected before anything is written to the database.
        String imagePath = null;
        if (form.getImage() != null && !form.getImage().isEmpty()) {
            imagePath = fileStorageService.storeImage(form.getImage(), FileStorageService.COMPLAINT_FOLDER);
        }

        try {
            Complaint complaint = new Complaint();
            complaint.setTitle(form.getTitle().trim());
            complaint.setDescription(form.getDescription().trim());
            complaint.setCategory(category);
            complaint.setLocation(location);
            complaint.setPriority(form.getPriority());
            complaint.setStatus(ComplaintStatus.PENDING);
            complaint.setSubmittedBy(user);
            complaint.setImagePath(imagePath);
            complaint = complaintRepository.save(complaint);

            addHistory(complaint, null, ComplaintStatus.PENDING, user, "Complaint submitted");
            return buildDetails(complaint);
        } catch (RuntimeException ex) {
            fileStorageService.deleteQuietly(imagePath); // do not leave an orphan file behind
            throw ex;
        }
    }

    /** The owner may correct a complaint as long as nobody has started working on it. */
    public ComplaintDetailResponse update(Long id, ComplaintUpdateRequest request, UserPrincipal principal) {
        Complaint complaint = findComplaint(id);

        if (!complaint.getSubmittedBy().getId().equals(principal.getId())) {
            throw new AccessDeniedException("Only the owner can edit this complaint");
        }
        if (complaint.getStatus() != ComplaintStatus.PENDING) {
            throw new BadRequestException("Only complaints with status PENDING can be edited");
        }
        if (complaint.isEscalated() && request.priority() != complaint.getPriority()) {
            throw new BadRequestException("The priority of an escalated complaint can no longer be changed");
        }

        if (request.priority() != complaint.getPriority()) {
            complaint.setPriority(request.priority());
            complaint.setPriorityUpdatedAt(LocalDateTime.now()); // the new priority starts counting from now
        }
        complaint.setTitle(request.title().trim());
        complaint.setDescription(request.description().trim());
        complaint.setCategory(findActiveCategory(request.categoryId()));
        complaint.setLocation(findActiveLocation(request.locationId()));
        return buildDetails(complaintRepository.save(complaint));
    }

    // ------------------------------------------------------------------
    // Read operations
    // ------------------------------------------------------------------

    @Transactional(readOnly = true)
    public ComplaintDetailResponse getDetails(Long id, UserPrincipal principal) {
        Complaint complaint = findComplaint(id);
        assertCanView(complaint, principal);
        return buildDetails(complaint);
    }

    /**
     * Searches complaints with filters and paging.
     *
     * @param forcedUserId restricts the result to one user's complaints (use null for "all")
     */
    @Transactional(readOnly = true)
    public PageResponse<ComplaintSummaryResponse> search(ComplaintFilter filter, Long forcedUserId) {
        String sortBy = SORTABLE_FIELDS.contains(filter.getSortBy()) ? filter.getSortBy() : "createdAt";
        Sort.Direction direction = "asc".equalsIgnoreCase(filter.getSortDir())
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        // "id" is added as a second sort key so the order is stable when dates are equal
        PageRequest pageable = PageRequest.of(
                Math.max(filter.getPage(), 0),
                Math.min(Math.max(filter.getSize(), 1), 100),
                Sort.by(direction, sortBy).and(Sort.by(direction, "id")));

        Page<Complaint> page = complaintRepository.findAll(ComplaintSpecification.from(filter, forcedUserId), pageable);
        return PageResponse.from(page.map(ComplaintSummaryResponse::from));
    }

    /** "Complaint history" page of a student: all status changes of their own complaints. */
    @Transactional(readOnly = true)
    public PageResponse<StatusHistoryResponse> myHistory(Long userId, int page, int size) {
        PageRequest pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100));
        return PageResponse.from(historyRepository
                .findByComplaintSubmittedByIdOrderByChangedAtDescIdDesc(userId, pageable)
                .map(StatusHistoryResponse::from));
    }

    // ------------------------------------------------------------------
    // Helpers shared with other services
    // ------------------------------------------------------------------

    public Complaint findComplaint(Long id) {
        return complaintRepository.findWithDetailsById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint", id));
    }

    /** Students/staff may only see their own complaints. Admin and maintenance see all. */
    public void assertCanView(Complaint complaint, UserPrincipal principal) {
        boolean isStudentOrStaff = RoleName.STUDENT_STAFF.name().equals(principal.getRoleName());
        if (isStudentOrStaff && !complaint.getSubmittedBy().getId().equals(principal.getId())) {
            throw new AccessDeniedException("You can only view your own complaints");
        }
    }

    /** Adds one row to the status timeline. */
    public void addHistory(Complaint complaint, ComplaintStatus oldStatus, ComplaintStatus newStatus,
                           User changedBy, String remarks) {
        ComplaintStatusHistory history = new ComplaintStatusHistory();
        history.setComplaint(complaint);
        history.setOldStatus(oldStatus);
        history.setNewStatus(newStatus);
        history.setChangedBy(changedBy);
        history.setRemarks(remarks);
        historyRepository.save(history);
    }

    /** Collects complaint + timeline + escalation log + resolution into one response. */
    public ComplaintDetailResponse buildDetails(Complaint complaint) {
        List<StatusHistoryResponse> history = historyRepository
                .findByComplaintIdOrderByChangedAtAscIdAsc(complaint.getId())
                .stream().map(StatusHistoryResponse::from).toList();
        List<EscalationLogResponse> escalations = escalationLogRepository
                .findByComplaintIdOrderByEscalatedAtAscIdAsc(complaint.getId())
                .stream().map(EscalationLogResponse::from).toList();
        ResolutionResponse resolution = resolutionRepository.findByComplaintId(complaint.getId())
                .map(ResolutionResponse::from).orElse(null);
        return ComplaintDetailResponse.from(complaint, resolution, history, escalations);
    }

    private Category findActiveCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Invalid category"));
        if (!category.isActive()) {
            throw new BadRequestException("This category is no longer available");
        }
        return category;
    }

    private Location findActiveLocation(Long id) {
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Invalid location"));
        if (!location.isActive()) {
            throw new BadRequestException("This location is no longer available");
        }
        return location;
    }
}
