package com.bankease.config;

import com.bankease.entity.BankAccount;
import com.bankease.entity.User;
import com.bankease.repository.BankAccountRepository;
import com.bankease.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final BankAccountRepository bankAccountRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return;
        }

        seedUser("Ravi Kumar", "ravi@example.com", "password123", "9876543210",
                "MG Road, Bangalore", User.Role.USER, "123400000001", new BigDecimal("25000.00"));
        seedUser("Priya Sharma", "priya@example.com", "password123", "9876543211",
                "Anna Nagar, Chennai", User.Role.USER, "123400000002", new BigDecimal("15000.00"));
        seedUser("Admin User", "admin@bankease.com", "password123", "9000000000",
                "Head Office, Mumbai", User.Role.ADMIN, "123400000003", new BigDecimal("50000.00"));

        log.info("Demo users and bank accounts seeded successfully.");
    }

    private void seedUser(String fullName, String email, String rawPassword, String phone,
                          String address, User.Role role, String accountNumber, BigDecimal balance) {
        User user = User.builder()
                .fullName(fullName)
                .email(email)
                .password(passwordEncoder.encode(rawPassword))
                .phoneNumber(phone)
                .address(address)
                .role(role)
                .build();
        user = userRepository.save(user);

        BankAccount account = BankAccount.builder()
                .accountNumber(accountNumber)
                .ifscCode("BKEZ0001234")
                .accountType(BankAccount.AccountType.SAVINGS)
                .balance(balance)
                .user(user)
                .build();
        bankAccountRepository.save(account);
    }
}

