package com.abhishek.devcollab.comment;

import com.abhishek.devcollab.dto.CommentRequestDTO;
import com.abhishek.devcollab.dto.CommentResponseDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @PostMapping("/{id}/comments")
    public CommentResponseDTO addComment(
            @PathVariable Long id,
            @Valid @RequestBody CommentRequestDTO request,
            Authentication auth
    ) {
        return commentService.addComment(id, request.getContent(), auth.getName());
    }

    @GetMapping("/{id}/comments")
    public List<CommentResponseDTO> getComments(@PathVariable Long id) {
        return commentService.getComments(id);
    }
}