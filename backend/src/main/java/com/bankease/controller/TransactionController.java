package com.bankease.controller;

import com.bankease.dto.request.TransferRequest;
import com.bankease.dto.response.ApiResponse;
import com.bankease.dto.response.TransactionResponse;
import com.bankease.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping("/transfer")
    public ResponseEntity<ApiResponse<TransactionResponse>> transfer(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody TransferRequest request) {
        TransactionResponse response = transactionService.transfer(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success("Transfer successful", response));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<Page<TransactionResponse>>> getTransactionHistory(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<TransactionResponse> history = transactionService.getTransactionHistory(
                userDetails.getUsername(), pageable);
        return ResponseEntity.ok(ApiResponse.success("Transaction history retrieved", history));
    }

    @GetMapping("/recent")
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> getRecentTransactions(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<TransactionResponse> recent = transactionService.getRecentTransactions(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Recent transactions retrieved", recent));
    }
}

