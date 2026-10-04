package com.abhishek.devcollab.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AddMemberRequestDTO {

    @NotNull(message = "userId is required")
    private Long userId;
}
