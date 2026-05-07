package com.abhishek.devcollab.project;

import com.abhishek.devcollab.user.User;
import com.abhishek.devcollab.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ProjectMemberRepository projectMemberRepository;

    // CREATE PROJECT
    public Project createProject(String title, String description, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Project project = Project.builder()
                .title(title)
                .description(description)
                .createdBy(user)
                .build();

        return projectRepository.save(project);
    }

    // GET ALL PROJECTS
    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    // JOIN PROJECT
    public String joinProject(Long projectId, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        if (projectMemberRepository.existsByUserAndProject(user, project)) {
            return "Already joined this project";
        }

        ProjectMember member = ProjectMember.builder()
                .user(user)
                .project(project)
                .build();

        projectMemberRepository.save(member);

        return "Joined project successfully";
    }


    public List<ProjectMember> getProjectMembers(Long projectId) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        return projectMemberRepository.findByProject(project);
    }

    public List<Project> getMyProjects(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<ProjectMember> memberships =
                projectMemberRepository.findByUser(user);

        return memberships.stream()
                .map(ProjectMember::getProject)
                .toList();
    }
}