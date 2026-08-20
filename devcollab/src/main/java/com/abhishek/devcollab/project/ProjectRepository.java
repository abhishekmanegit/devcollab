package com.abhishek.devcollab.project;

import com.abhishek.devcollab.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByCreatedBy(User user);
}