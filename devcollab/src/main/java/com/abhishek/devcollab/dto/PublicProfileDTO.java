package com.abhishek.devcollab.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PublicProfileDTO {

    /** SELF, CONNECTED, PENDING_IN, PENDING_OUT or NONE, relative to the viewer. */
    private String relation;
    private PublicUserDTO profile;
    private List<ProjectSummaryDTO> projects;
}
