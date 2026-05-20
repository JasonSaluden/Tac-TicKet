package com.tictac.tictac.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tictac.tictac.entity.Conversation;
import com.tictac.tictac.entity.Message;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByConversation(Conversation conversation);
    List<Message> findByUserId(Long userId);
}
