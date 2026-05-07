package com.abhishek.devcollab.project;

import com.abhishek.devcollab.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {

    boolean existsByUserAndProject(User user, Project project);

    List<ProjectMember> findByProject(Project project);

    List<ProjectMember> findByUser(User user);
}