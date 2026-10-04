package com.abhishek.devcollab.project;

import com.abhishek.devcollab.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {

    boolean existsByUserAndProject(User user, Project project);

    List<ProjectMember> findByProject(Project project);

    List<ProjectMember> findByUser(User user);

    long countByProject(Project project);

    @Query("select pm.project.id from ProjectMember pm where pm.user = :user")
    List<Long> findProjectIdsByUser(@Param("user") User user);

    @Query("select pm.project.id, count(pm) from ProjectMember pm where pm.project.id in :projectIds group by pm.project.id")
    List<Object[]> countByProjectIds(@Param("projectIds") List<Long> projectIds);
}