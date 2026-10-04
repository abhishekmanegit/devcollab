package com.abhishek.devcollab.comment;

import com.abhishek.devcollab.project.Project;
import com.abhishek.devcollab.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 2000)
    private String content;

    @ManyToOne
    private User user;

    @ManyToOne
    private Project project;

    // The column default lets ddl-auto=update backfill rows that predate this column
    // instead of failing with "contains null values".
    @Column(nullable = false, updatable = false)
    @org.hibernate.annotations.ColumnDefault("current_timestamp")
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}