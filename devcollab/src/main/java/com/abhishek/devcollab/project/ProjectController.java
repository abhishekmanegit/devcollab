package com.abhishek.devcollab.project;

import com.abhishek.devcollab.dto.AddMemberRequestDTO;
import com.abhishek.devcollab.dto.CreateProjectRequestDTO;
import com.abhishek.devcollab.dto.MemberResponseDTO;
import com.abhishek.devcollab.dto.ProjectResponseDTO;
import jakarta.validation.Valid;
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

    @PostMapping("/{id}/members")
    public Map<String, String> addMember(
            @PathVariable Long id,
            @Valid @RequestBody AddMemberRequestDTO request,
            Authentication auth
    ) {
        return Map.of("message", projectService.addMember(id, request.getUserId(), auth.getName()));
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
            @Valid @RequestBody CreateProjectRequestDTO request
    ) {
        return projectService.createProject(request, auth.getName());
    }

    @GetMapping
    public List<ProjectResponseDTO> getAllProjects(Authentication auth) {
        return projectService.getAllProjects(auth.getName());
    }
}