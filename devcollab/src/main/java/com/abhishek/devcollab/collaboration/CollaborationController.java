package com.abhishek.devcollab.collaboration;

import com.abhishek.devcollab.dto.CollaborationRequestDTO;
import com.abhishek.devcollab.dto.PublicUserDTO;
import com.abhishek.devcollab.dto.SendCollaborationRequestDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/collaborations")
@RequiredArgsConstructor
public class CollaborationController {

    private final CollaborationService collaborationService;

    @PostMapping("/requests")
    public CollaborationRequestDTO sendRequest(
            Authentication auth,
            @Valid @RequestBody SendCollaborationRequestDTO request
    ) {
        return collaborationService.send(auth.getName(), request.getUserId(), request.getMessage());
    }

    @GetMapping("/requests/incoming")
    public List<CollaborationRequestDTO> incoming(Authentication auth) {
        return collaborationService.incoming(auth.getName());
    }

    @GetMapping("/requests/outgoing")
    public List<CollaborationRequestDTO> outgoing(Authentication auth) {
        return collaborationService.outgoing(auth.getName());
    }

    @GetMapping("/requests/pending-count")
    public Map<String, Long> pendingCount(Authentication auth) {
        return Map.of("count", collaborationService.pendingCount(auth.getName()));
    }

    @PostMapping("/requests/{id}/accept")
    public CollaborationRequestDTO accept(@PathVariable Long id, Authentication auth) {
        return collaborationService.accept(auth.getName(), id);
    }

    @PostMapping("/requests/{id}/decline")
    public CollaborationRequestDTO decline(@PathVariable Long id, Authentication auth) {
        return collaborationService.decline(auth.getName(), id);
    }

    @GetMapping("/connections")
    public List<PublicUserDTO> connections(Authentication auth) {
        return collaborationService.connections(auth.getName());
    }
}