package com.abhishek.devcollab.project;

import com.abhishek.devcollab.user.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(length = 2000)
    private String description;

    /** Comma-separated list of skills the project is looking for. */
    @Column(length = 500)
    private String skills;

    @ManyToOne
    private User createdBy;
}