package com.abhishek.devcollab.user;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    /**
     * Searches developers by name, skills or bio. Matching is case-insensitive and
     * never returns email addresses.
     */
    @Query("""
            select u from User u
            where u.id <> :selfId
              and (
                lower(u.name) like :term
                or lower(coalesce(u.bio, '')) like :term
                or lower(coalesce(u.skills, '')) like :term
              )
            order by u.name
            """)
    List<User> search(@Param("selfId") Long selfId, @Param("term") String term, Pageable pageable);
}
