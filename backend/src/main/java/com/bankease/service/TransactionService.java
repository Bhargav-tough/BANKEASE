package com.bankease.service;

import com.bankease.dto.request.TransferRequest;
import com.bankease.dto.response.TransactionResponse;
import com.bankease.entity.BankAccount;
import com.bankease.entity.Transaction;
import com.bankease.entity.User;
import com.bankease.exception.BadRequestException;
import com.bankease.exception.InsufficientFundsException;
import com.bankease.exception.ResourceNotFoundException;
import com.bankease.repository.BankAccountRepository;
import com.bankease.repository.TransactionRepository;
import com.bankease.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final BankAccountRepository bankAccountRepository;
    private final UserRepository userRepository;

    @Transactional
    public TransactionResponse transfer(String senderEmail, TransferRequest request) {
        User senderUser = userRepository.findByEmail(senderEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Sender not found"));

        BankAccount senderAccount = bankAccountRepository.findByUserId(senderUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Sender account not found"));

        BankAccount receiverAccount = bankAccountRepository.findByAccountNumber(request.getRecipientAccountNumber())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Recipient account not found: " + request.getRecipientAccountNumber()));

        // Validations
        if (senderAccount.getAccountNumber().equals(request.getRecipientAccountNumber())) {
            throw new BadRequestException("Cannot transfer to your own account");
        }

        if (!receiverAccount.getIsActive()) {
            throw new BadRequestException("Recipient account is inactive");
        }

        if (!senderAccount.getIsActive()) {
            throw new BadRequestException("Your account is inactive");
        }

        BigDecimal amount = request.getAmount();
        if (senderAccount.getBalance().compareTo(amount) < 0) {
            throw new InsufficientFundsException(
                    "Insufficient balance. Available: ₹" + senderAccount.getBalance());
        }

        // Perform transfer
        senderAccount.setBalance(senderAccount.getBalance().subtract(amount));
        receiverAccount.setBalance(receiverAccount.getBalance().add(amount));

        bankAccountRepository.save(senderAccount);
        bankAccountRepository.save(receiverAccount);

        // Create transaction record
        String txnRef = "TXN" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();

        Transaction transaction = Transaction.builder()
                .transactionRef(txnRef)
                .amount(amount)
                .description(request.getDescription() != null ? request.getDescription() : "Fund Transfer")
                .transactionType(Transaction.TransactionType.TRANSFER)
                .status(Transaction.TransactionStatus.SUCCESS)
                .balanceAfterTransaction(senderAccount.getBalance())
                .senderAccount(senderAccount)
                .receiverAccount(receiverAccount)
                .build();
        transaction = transactionRepository.save(transaction);

        log.info("Transfer successful: {} -> {} | Amount: ₹{} | Ref: {}",
                senderAccount.getAccountNumber(), receiverAccount.getAccountNumber(), amount, txnRef);

        return mapToTransactionResponse(transaction, senderAccount, receiverAccount);
    }

    public Page<TransactionResponse> getTransactionHistory(String email, Pageable pageable) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        BankAccount account = bankAccountRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        return transactionRepository.findAllByAccountId(account.getId(), pageable)
                .map(t -> mapToTransactionResponse(t, t.getSenderAccount(), t.getReceiverAccount()));
    }

    public List<TransactionResponse> getRecentTransactions(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        BankAccount account = bankAccountRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        return transactionRepository.findTop5ByAccountId(account.getId()).stream()
                .map(t -> mapToTransactionResponse(t, t.getSenderAccount(), t.getReceiverAccount()))
                .collect(Collectors.toList());
    }

    private TransactionResponse mapToTransactionResponse(Transaction t,
                                                          BankAccount sender,
                                                          BankAccount receiver) {
        return TransactionResponse.builder()
                .id(t.getId())
                .transactionRef(t.getTransactionRef())
                .amount(t.getAmount())
                .description(t.getDescription())
                .transactionType(t.getTransactionType().name())
                .status(t.getStatus().name())
                .timestamp(t.getTimestamp())
                .balanceAfterTransaction(t.getBalanceAfterTransaction())
                .senderAccountNumber(sender != null ? sender.getAccountNumber() : null)
                .receiverAccountNumber(receiver != null ? receiver.getAccountNumber() : null)
                .senderName(sender != null && sender.getUser() != null ? sender.getUser().getFullName() : null)
                .receiverName(receiver != null && receiver.getUser() != null ? receiver.getUser().getFullName() : null)
                .build();
    }
}

