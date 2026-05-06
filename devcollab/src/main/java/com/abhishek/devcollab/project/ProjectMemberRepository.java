package com.abhishek.devcollab.project;

import com.abhishek.devcollab.user.User;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {

    boolean existsByUserAndProject(User user, Project project);

    List<ProjectMember> findByProject(Project project);
}