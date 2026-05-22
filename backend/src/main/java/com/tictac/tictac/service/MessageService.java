package com.tictac.tictac.service;

import java.util.List;
import java.util.Optional;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tictac.tictac.entity.Conversation;
import com.tictac.tictac.entity.Message;
import com.tictac.tictac.event.MessagePostedEvent;
import com.tictac.tictac.repository.ConversationRepository;
import com.tictac.tictac.repository.MessageRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class MessageService {

    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final ApplicationEventPublisher events;

    public List<Message> getAllMessages() {
        return messageRepository.findAll();
    }

    public Optional<Message> getMessageById(Long id) {
        return messageRepository.findById(id);
    }

    public List<Message> getMessagesByConversation(Long conversationId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found with id: " + conversationId));
        return messageRepository.findByConversation(conversation);
    }

    public List<Message> getMessagesByUser(Long userId) {
        return messageRepository.findByAuthorIdUser(userId);
    }

    public Message createMessage(Message message) {
        Message saved = messageRepository.save(message);
        events.publishEvent(new MessagePostedEvent(saved));
        return saved;
    }

    public Message updateMessage(Long id, Message messageDetails) {
        return messageRepository.findById(id)
                .map(message -> {
                    message.setContent(messageDetails.getContent());
                    return messageRepository.save(message);
                })
                .orElseThrow(() -> new RuntimeException("Message not found with id: " + id));
    }

    public void deleteMessage(Long id) {
        messageRepository.deleteById(id);
    }
}
