package com.bankease.controller;

import com.bankease.dto.response.AccountResponse;
import com.bankease.dto.response.ApiResponse;
import com.bankease.service.AccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/account")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AccountResponse>> getMyAccount(
            @AuthenticationPrincipal UserDetails userDetails) {
        AccountResponse account = accountService.getAccountByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Account details retrieved", account));
    }

    @GetMapping("/lookup/{accountNumber}")
    public ResponseEntity<ApiResponse<AccountResponse>> lookupAccount(
            @PathVariable String accountNumber) {
        AccountResponse account = accountService.getAccountByAccountNumber(accountNumber);
        // Return limited info for security
        AccountResponse limitedInfo = AccountResponse.builder()
                .accountNumber(account.getAccountNumber())
                .holderName(account.getHolderName())
                .ifscCode(account.getIfscCode())
                .build();
        return ResponseEntity.ok(ApiResponse.success("Account found", limitedInfo));
    }
}

