package com.bankease.service;

import com.bankease.dto.request.LoginRequest;
import com.bankease.dto.request.RegisterRequest;
import com.bankease.dto.response.AuthResponse;
import com.bankease.entity.BankAccount;
import com.bankease.entity.User;
import com.bankease.exception.BadRequestException;
import com.bankease.repository.BankAccountRepository;
import com.bankease.repository.UserRepository;
import com.bankease.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final BankAccountRepository bankAccountRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        if (request.getPhoneNumber() != null &&
                userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new BadRequestException("Phone number is already registered");
        }

        // Create user
        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phoneNumber(request.getPhoneNumber())
                .address(request.getAddress())
                .role(User.Role.USER)
                .build();
        user = userRepository.save(user);

        // Create bank account with initial balance of ₹10,000 (demo)
        String accountNumber = generateUniqueAccountNumber();
        BankAccount account = BankAccount.builder()
                .accountNumber(accountNumber)
                .ifscCode("BKEZ0001234")
                .accountType(BankAccount.AccountType.SAVINGS)
                .balance(new BigDecimal("10000.00"))
                .user(user)
                .build();
        account = bankAccountRepository.save(account);

        // Auto-login: generate token
        String token = jwtTokenProvider.generateTokenFromEmail(user.getEmail());

        log.info("New user registered: {} with account: {}", user.getEmail(), accountNumber);

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .accountNumber(account.getAccountNumber())
                .message("Registration successful! Welcome to BankEase.")
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        String token = jwtTokenProvider.generateToken(authentication);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("User not found"));

        BankAccount account = bankAccountRepository.findByUserId(user.getId()).orElse(null);

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .accountNumber(account != null ? account.getAccountNumber() : null)
                .message("Login successful! Welcome back, " + user.getFullName() + ".")
                .build();
    }

    private String generateUniqueAccountNumber() {
        Random random = new Random();
        String accountNumber;
        do {
            // Generate 12-digit account number starting with 1234
            long number = 1234_0000_0000L + (long) (random.nextDouble() * 9_9999_9999L);
            accountNumber = String.valueOf(number);
        } while (bankAccountRepository.existsByAccountNumber(accountNumber));
        return accountNumber;
    }
}

