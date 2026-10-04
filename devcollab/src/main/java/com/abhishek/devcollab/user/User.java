package com.abhishek.devcollab.user;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 160)
    private String email;

    @JsonIgnore
    @Column(nullable = false)
    private String password;

    @Column(length = 1000)
    private String bio;

    /** Comma-separated list of skills. */
    @Column(length = 500)
    private String skills;

    @Column(length = 200)
    private String githubUrl;

    private String profilePictureUrl;
}