package com.tictac.tictac.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tictac.tictac.entity.Conversation;
import com.tictac.tictac.entity.Ticket;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    Optional<Conversation> findByTicket(Ticket ticket);
}
