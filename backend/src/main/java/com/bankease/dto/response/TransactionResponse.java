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
public class TransactionResponse {
    private Long id;
    private String transactionRef;
    private BigDecimal amount;
    private String description;
    private String transactionType;
    private String status;
    private LocalDateTime timestamp;
    private BigDecimal balanceAfterTransaction;
    private String senderAccountNumber;
    private String receiverAccountNumber;
    private String senderName;
    private String receiverName;
}

