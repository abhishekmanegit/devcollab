package com.abhishek.devcollab.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SendCollaborationRequestDTO {

    @NotNull(message = "Recipient is required")
    @Positive(message = "Recipient is required")
    private Long userId;

    @Size(max = 500, message = "Message must be 500 characters or fewer")
    private String message;
}
