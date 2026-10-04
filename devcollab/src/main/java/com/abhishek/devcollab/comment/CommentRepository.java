package com.abhishek.devcollab.comment;

import com.abhishek.devcollab.project.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    @Query("select c from Comment c join fetch c.user where c.project = :project order by c.createdAt asc, c.id asc")
    List<Comment> findByProjectWithAuthors(@Param("project") Project project);
}