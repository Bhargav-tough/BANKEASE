package com.bankease.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccountResponse {
    private Long id;
    private String accountNumber;
    private String ifscCode;
    private String accountType;
    private BigDecimal balance;
    private LocalDateTime createdAt;
    private Boolean isActive;
    private String holderName;
    private String email;
    private String phoneNumber;
    private String address;
}

