package com.abhishek.devcollab.comment;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    // ADD COMMENT
    @PostMapping("/{id}/comments")
    public Comment addComment(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication auth
    ) {

        return commentService.addComment(
                id,
                body.get("content"),
                auth.getName()
        );
    }

    // GET COMMENTS
    @GetMapping("/{id}/comments")
    public List<Comment> getComments(@PathVariable Long id) {
        return commentService.getComments(id);
    }
}