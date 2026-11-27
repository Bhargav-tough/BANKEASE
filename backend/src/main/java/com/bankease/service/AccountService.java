package com.bankease.service;

import com.bankease.dto.response.AccountResponse;
import com.bankease.entity.BankAccount;
import com.bankease.entity.User;
import com.bankease.exception.ResourceNotFoundException;
import com.bankease.repository.BankAccountRepository;
import com.bankease.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final BankAccountRepository bankAccountRepository;
    private final UserRepository userRepository;

    public AccountResponse getAccountByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        BankAccount account = bankAccountRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Bank account not found"));

        return mapToAccountResponse(account, user);
    }

    public AccountResponse getAccountByAccountNumber(String accountNumber) {
        BankAccount account = bankAccountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with number: " + accountNumber));
        return mapToAccountResponse(account, account.getUser());
    }

    private AccountResponse mapToAccountResponse(BankAccount account, User user) {
        return AccountResponse.builder()
                .id(account.getId())
                .accountNumber(account.getAccountNumber())
                .ifscCode(account.getIfscCode())
                .accountType(account.getAccountType().name())
                .balance(account.getBalance())
                .createdAt(account.getCreatedAt())
                .isActive(account.getIsActive())
                .holderName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .address(user.getAddress())
                .build();
    }
}

