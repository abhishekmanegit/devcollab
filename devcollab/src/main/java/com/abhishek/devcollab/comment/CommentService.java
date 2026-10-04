package com.abhishek.devcollab.comment;

import com.abhishek.devcollab.dto.CommentResponseDTO;
import com.abhishek.devcollab.exception.ApiException;
import com.abhishek.devcollab.project.Project;
import com.abhishek.devcollab.project.ProjectRepository;
import com.abhishek.devcollab.user.User;
import com.abhishek.devcollab.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;

    @Transactional
    public CommentResponseDTO addComment(Long projectId, String content, String email) {

        if (content == null || content.isBlank()) {
            throw ApiException.badRequest("Comment cannot be empty");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> ApiException.notFound("User not found"));

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> ApiException.notFound("Project not found"));

        Comment comment = commentRepository.save(Comment.builder()
                .content(content.trim())
                .user(user)
                .project(project)
                .build());

        return toDto(comment);
    }

    @Transactional(readOnly = true)
    public List<CommentResponseDTO> getComments(Long projectId) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> ApiException.notFound("Project not found"));

        return commentRepository.findByProjectWithAuthors(project).stream()
                .map(this::toDto)
                .toList();
    }

    private CommentResponseDTO toDto(Comment comment) {
        User author = comment.getUser();
        return CommentResponseDTO.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .authorName(author == null ? "Anonymous" : author.getName())
                .authorGithubUrl(author == null ? null : author.getGithubUrl())
                .authorAvatarUrl(author == null ? null : author.getProfilePictureUrl())
                .createdAt(comment.getCreatedAt())
                .build();
    }
}