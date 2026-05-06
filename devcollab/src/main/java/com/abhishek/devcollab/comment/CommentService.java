package com.abhishek.devcollab.comment;

import com.abhishek.devcollab.project.Project;
import com.abhishek.devcollab.project.ProjectRepository;
import com.abhishek.devcollab.user.User;
import com.abhishek.devcollab.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;

    // ADD COMMENT
    public Comment addComment(Long projectId, String content, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        Comment comment = Comment.builder()
                .content(content)
                .user(user)
                .project(project)
                .build();

        return commentRepository.save(comment);
    }

    // GET COMMENTS
    public List<Comment> getComments(Long projectId) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        return commentRepository.findByProject(project);
    }
}