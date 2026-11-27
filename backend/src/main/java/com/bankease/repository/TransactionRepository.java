package com.bankease.repository;

import com.bankease.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    @Query("SELECT t FROM Transaction t WHERE t.senderAccount.id = :accountId OR t.receiverAccount.id = :accountId ORDER BY t.timestamp DESC")
    Page<Transaction> findAllByAccountId(@Param("accountId") Long accountId, Pageable pageable);

    @Query("SELECT t FROM Transaction t WHERE t.senderAccount.id = :accountId OR t.receiverAccount.id = :accountId ORDER BY t.timestamp DESC")
    List<Transaction> findAllByAccountId(@Param("accountId") Long accountId);

    @Query("SELECT t FROM Transaction t WHERE (t.senderAccount.id = :accountId OR t.receiverAccount.id = :accountId) ORDER BY t.timestamp DESC LIMIT 5")
    List<Transaction> findTop5ByAccountId(@Param("accountId") Long accountId);
}

