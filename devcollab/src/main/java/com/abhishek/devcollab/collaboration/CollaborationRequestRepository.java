package com.abhishek.devcollab.collaboration;

import com.abhishek.devcollab.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CollaborationRequestRepository extends JpaRepository<CollaborationRequest, Long> {

    List<CollaborationRequest> findByRecipientOrderByCreatedAtDesc(User recipient);

    List<CollaborationRequest> findByRequesterOrderByCreatedAtDesc(User requester);

    long countByRecipientAndStatus(User recipient, CollaborationRequest.Status status);

    @Query("""
            select count(r) from CollaborationRequest r
            where r.status = :status
              and ((r.requester.id = :a and r.recipient.id = :b)
                or (r.requester.id = :b and r.recipient.id = :a))
            """)
    long countBetween(
            @Param("a") Long a,
            @Param("b") Long b,
            @Param("status") CollaborationRequest.Status status
    );

    /** Rows are mapped to the other user in the service; a CASE expression cannot
     *  return an entity from a JPQL select clause. */
    @Query("""
            select r from CollaborationRequest r
            where r.status = :status
              and (r.requester.id = :userId or r.recipient.id = :userId)
            order by r.respondedAt desc
            """)
    List<CollaborationRequest> findAllBetween(
            @Param("userId") Long userId,
            @Param("status") CollaborationRequest.Status status
    );
}