package com.abhishek.devcollab.dto;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MemberResponseDTO {

    private Long id;
    private String name;
    private String githubUrl;
    private String profilePictureUrl;
}
