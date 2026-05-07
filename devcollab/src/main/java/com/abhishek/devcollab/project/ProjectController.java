package com.abhishek.devcollab.project;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;


    @PostMapping("/{id}/join")
    public String joinProject(@PathVariable Long id, Authentication auth) {

        return projectService.joinProject(id, auth.getName());
    }

    @GetMapping("/{id}/members")
    public List<ProjectMember> getMembers(@PathVariable Long id) {
        return projectService.getProjectMembers(id);
    }

    @GetMapping("/my-projects")
    public List<Project> getMyProjects(Authentication auth) {

        return projectService.getMyProjects(auth.getName());
    }


    @PostMapping
    public Project createProject(
            Authentication auth,
            @RequestBody Project project
    ) {
        return projectService.createProject(
                project.getTitle(),
                project.getDescription(),
                auth.getName()
        );
    }


    @GetMapping
    public List<Project> getAllProjects() {
        return projectService.getAllProjects();
    }
}