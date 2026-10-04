package com.abhishek.devcollab.dto;

import lombok.*;

import java.util.List;

/**
 * A developer as seen by other developers. Deliberately excludes email so that
 * search results and profiles never leak login addresses.
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PublicUserDTO {

    private Long id;
    private String name;
    private String bio;
    private List<String> skills;
    private String githubUrl;
    private String profilePictureUrl;
}
