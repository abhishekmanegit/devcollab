package com.abhishek.devcollab.project;

import com.abhishek.devcollab.dto.MemberResponseDTO;
import com.abhishek.devcollab.dto.ProjectResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping("/{id}/join")
    public Map<String, String> joinProject(@PathVariable Long id, Authentication auth) {
        String message = projectService.joinProject(id, auth.getName());
        return Map.of("message", message);
    }

    @GetMapping("/{id}/members")
    public List<MemberResponseDTO> getMembers(@PathVariable Long id) {
        return projectService.getProjectMembers(id);
    }

    @GetMapping("/my-projects")
    public List<ProjectResponseDTO> getMyProjects(Authentication auth) {
        return projectService.getMyProjects(auth.getName());
    }

    @PostMapping
    public ProjectResponseDTO createProject(
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
    public List<ProjectResponseDTO> getAllProjects(Authentication auth) {
        return projectService.getAllProjects(auth.getName());
    }
}
