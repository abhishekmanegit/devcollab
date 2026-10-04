package com.abhishek.devcollab.user;

import com.abhishek.devcollab.collaboration.CollaborationService;
import com.abhishek.devcollab.dto.ProjectSummaryDTO;
import com.abhishek.devcollab.dto.PublicProfileDTO;
import com.abhishek.devcollab.dto.PublicUserDTO;
import com.abhishek.devcollab.exception.ApiException;
import com.abhishek.devcollab.project.Project;
import com.abhishek.devcollab.project.ProjectMemberRepository;
import com.abhishek.devcollab.project.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Read-only lookups used by developer search and public profiles.
 */
@Service
@RequiredArgsConstructor
public class UserDirectoryService {

    private static final int MIN_QUERY_LENGTH = 2;
    private static final int MAX_RESULTS = 25;

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final CollaborationService collaborationService;

    @Transactional(readOnly = true)
    public List<PublicUserDTO> search(String email, String query) {
        User viewer = requireViewer(email);

        String term = query == null ? "" : query.trim();
        String pattern = likePattern(term);
        if (pattern == null || term.length() < MIN_QUERY_LENGTH) {
            return List.of();
        }

        return userRepository
                .search(viewer.getId(), pattern, PageRequest.of(0, MAX_RESULTS))
                .stream()
                .map(collaborationService::toPublicUser)
                .toList();
    }

    @Transactional(readOnly = true)
    public PublicProfileDTO profile(String email, Long userId) {
        User viewer = requireViewer(email);

        User target = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("That developer no longer exists"));

        return PublicProfileDTO.builder()
                .relation(collaborationService.relationBetween(viewer, userId))
                .profile(collaborationService.toPublicUser(target))
                .projects(projectSummaries(target))
                .build();
    }

    private List<ProjectSummaryDTO> projectSummaries(User owner) {
        List<Project> projects = projectRepository.findByCreatedBy(owner);
        if (projects.isEmpty()) {
            return List.of();
        }

        Map<Long, Long> counts = new HashMap<>();
        for (Object[] row : projectMemberRepository.countByProjectIds(
                projects.stream().map(Project::getId).toList())) {
            counts.put((Long) row[0], (Long) row[1]);
        }

        return projects.stream()
                .map(project -> ProjectSummaryDTO.builder()
                        .id(project.getId())
                        .title(project.getTitle())
                        .description(project.getDescription())
                        .memberCount(counts.getOrDefault(project.getId(), 0L))
                        .skills(splitSkills(project.getSkills()))
                        .build())
                .toList();
    }

    /**
     * LIKE wildcards typed by the user are stripped rather than escaped, so a
     * search for "100%" cannot turn into a match-everything query.
     */
    private String likePattern(String term) {
        String cleaned = term.toLowerCase().replaceAll("[%_\\\\]", "").trim();
        return cleaned.isEmpty() ? null : "%" + cleaned + "%";
    }

    private List<String> splitSkills(String skills) {
        if (skills == null || skills.isBlank()) {
            return List.of();
        }
        return Arrays.stream(skills.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }

    private User requireViewer(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> ApiException.notFound("User not found"));
    }
}