package com.abhishek.devcollab.project;

import com.abhishek.devcollab.dto.MemberResponseDTO;
import com.abhishek.devcollab.dto.ProjectResponseDTO;
import com.abhishek.devcollab.user.User;
import com.abhishek.devcollab.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ProjectMemberRepository projectMemberRepository;

    public ProjectResponseDTO createProject(String title, String description, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Project project = Project.builder()
                .title(title)
                .description(description)
                .createdBy(user)
                .build();

        project = projectRepository.save(project);

        if (!projectMemberRepository.existsByUserAndProject(user, project)) {
            projectMemberRepository.save(ProjectMember.builder()
                    .user(user)
                    .project(project)
                    .build());
        }

        return toDto(project, user);
    }

    public List<ProjectResponseDTO> getAllProjects(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return projectRepository.findAll().stream()
                .map(project -> toDto(project, user))
                .toList();
    }

    public String joinProject(Long projectId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

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
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        return projectMemberRepository.findByProject(project).stream()
                .map(member -> MemberResponseDTO.builder()
                        .id(member.getUser().getId())
                        .name(member.getUser().getName())
                        .email(member.getUser().getEmail())
                        .build())
                .toList();
    }

    public List<ProjectResponseDTO> getMyProjects(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Map<Long, Project> unique = new LinkedHashMap<>();

        projectMemberRepository.findByUser(user).stream()
                .map(ProjectMember::getProject)
                .forEach(project -> unique.put(project.getId(), project));

        projectRepository.findByCreatedBy(user).stream()
                .forEach(project -> unique.putIfAbsent(project.getId(), project));

        return unique.values().stream()
                .map(project -> toDto(project, user))
                .toList();
    }

    private ProjectResponseDTO toDto(Project project, User currentUser) {
        boolean isOwner = project.getCreatedBy().getId().equals(currentUser.getId());
        boolean isJoined = isOwner || projectMemberRepository.existsByUserAndProject(currentUser, project);

        return ProjectResponseDTO.builder()
                .id(project.getId())
                .title(project.getTitle())
                .description(project.getDescription())
                .creatorName(project.getCreatedBy().getName())
                .creatorEmail(project.getCreatedBy().getEmail())
                .memberCount(projectMemberRepository.countByProject(project))
                .joined(isJoined)
                .owner(isOwner)
                .build();
    }
}
