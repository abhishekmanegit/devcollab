package com.abhishek.devcollab.comment;

import com.abhishek.devcollab.project.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByProject(Project project);
}