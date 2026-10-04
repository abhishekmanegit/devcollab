package com.abhishek.devcollab.project;

import com.abhishek.devcollab.dto.CreateProjectRequestDTO;
import com.abhishek.devcollab.dto.MemberResponseDTO;
import com.abhishek.devcollab.dto.ProjectResponseDTO;
import com.abhishek.devcollab.exception.ApiException;
import com.abhishek.devcollab.user.User;
import com.abhishek.devcollab.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ProjectMemberRepository projectMemberRepository;

    @Transactional
    public ProjectResponseDTO createProject(CreateProjectRequestDTO request, String email) {
        User user = requireUser(email);

        Project project = Project.builder()
                .title(request.getTitle().trim())
                .description(request.getDescription())
                .skills(joinSkills(request.getSkills()))
                .createdBy(user)
                .build();

        project = projectRepository.save(project);

        if (!projectMemberRepository.existsByUserAndProject(user, project)) {
            projectMemberRepository.save(ProjectMember.builder()
                    .user(user)
                    .project(project)
                    .build());
        }

        return toDto(project, user, Set.of(project.getId()), Map.of(project.getId(), 1L));
    }

    public List<ProjectResponseDTO> getAllProjects(String email) {
        User user = requireUser(email);

        List<Project> projects = projectRepository.findAll();

        return toDtos(projects, user);
    }

    @Transactional
    public String joinProject(Long projectId, String email) {
        User user = requireUser(email);

        Project project = requireProject(projectId);

        if (project.getCreatedBy().getId().equals(user.getId())) {
            return "You already own this project";
        }

        if (projectMemberRepository.existsByUserAndProject(user, project)) {
            return "Already joined this project";
        }

        projectMemberRepository.save(ProjectMember.builder()
                .user(user)
                .project(project)
                .build());

        return "Joined project successfully";
    }

    public List<MemberResponseDTO> getProjectMembers(Long projectId) {
        Project project = requireProject(projectId);

        return projectMemberRepository.findByProject(project).stream()
                .map(member -> MemberResponseDTO.builder()
                        .id(member.getUser().getId())
                        .name(member.getUser().getName())
                        .email(member.getUser().getEmail())
                        .build())
                .toList();
    }

    public List<ProjectResponseDTO> getMyProjects(String email) {
        User user = requireUser(email);

        Map<Long, Project> unique = new LinkedHashMap<>();

        projectMemberRepository.findByUser(user).stream()
                .map(ProjectMember::getProject)
                .forEach(project -> unique.put(project.getId(), project));

        projectRepository.findByCreatedBy(user).stream()
                .forEach(project -> unique.putIfAbsent(project.getId(), project));

        return toDtos(new ArrayList<>(unique.values()), user);
    }

    /**
     * Loads membership state and member counts for every project in two extra queries
     * instead of two queries per project.
     */
    private List<ProjectResponseDTO> toDtos(List<Project> projects, User user) {
        if (projects.isEmpty()) {
            return List.of();
        }

        List<Long> projectIds = projects.stream().map(Project::getId).toList();

        Set<Long> joinedIds = new HashSet<>(projectMemberRepository.findProjectIdsByUser(user));

        Map<Long, Long> memberCounts = new HashMap<>();
        for (Object[] row : projectMemberRepository.countByProjectIds(projectIds)) {
            memberCounts.put((Long) row[0], (Long) row[1]);
        }

        return projects.stream()
                .map(project -> toDto(project, user, joinedIds, memberCounts))
                .toList();
    }

    private ProjectResponseDTO toDto(Project project, User currentUser, Set<Long> joinedIds, Map<Long, Long> memberCounts) {
        boolean isOwner = project.getCreatedBy().getId().equals(currentUser.getId());
        boolean isJoined = isOwner || joinedIds.contains(project.getId());

        return ProjectResponseDTO.builder()
                .id(project.getId())
                .title(project.getTitle())
                .description(project.getDescription())
                .creatorName(project.getCreatedBy().getName())
                .creatorEmail(project.getCreatedBy().getEmail())
                .memberCount(memberCounts.getOrDefault(project.getId(), 0L))
                .joined(isJoined)
                .owner(isOwner)
                .skills(splitSkills(project.getSkills()))
                .build();
    }

    private User requireUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> ApiException.notFound("User not found"));
    }

    private Project requireProject(Long projectId) {
        return projectRepository.findById(projectId)
                .orElseThrow(() -> ApiException.notFound("Project not found"));
    }

    private String joinSkills(List<String> skills) {
        if (skills == null || skills.isEmpty()) {
            return "";
        }
        return String.join(",", skills.stream()
                .filter(skill -> skill != null && !skill.isBlank())
                .map(String::trim)
                .toList());
    }

    private List<String> splitSkills(String skills) {
        if (skills == null || skills.isBlank()) {
            return List.of();
        }
        return Arrays.stream(skills.split(","))
                .map(String::trim)
                .filter(skill -> !skill.isEmpty())
                .toList();
    }
}