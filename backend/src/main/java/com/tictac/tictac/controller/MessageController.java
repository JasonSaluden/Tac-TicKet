package com.tictac.tictac.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tictac.tictac.dto.MessageDTO;
import com.tictac.tictac.entity.Conversation;
import com.tictac.tictac.entity.Message;
import com.tictac.tictac.service.ConversationService;
import com.tictac.tictac.service.MessageService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/messages")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class MessageController {

    private final MessageService messageService;
    private final ConversationService conversationService;

    @GetMapping
    public ResponseEntity<List<MessageDTO>> getAllMessages() {
        List<MessageDTO> messages = messageService.getAllMessages()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MessageDTO> getMessageById(@PathVariable Long id) {
        return messageService.getMessageById(id)
                .map(message -> ResponseEntity.ok(convertToDTO(message)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/conversation/{conversationId}")
    public ResponseEntity<List<MessageDTO>> getMessagesByConversation(@PathVariable Long conversationId) {
        List<MessageDTO> messages = messageService.getMessagesByConversation(conversationId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<MessageDTO>> getMessagesByUser(@PathVariable Long userId) {
        List<MessageDTO> messages = messageService.getMessagesByUser(userId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(messages);
    }

    @PostMapping
    public ResponseEntity<MessageDTO> createMessage(@RequestBody MessageDTO messageDTO) {
        Conversation conversation = conversationService.getConversationById(messageDTO.getIdConversation())
                .orElseThrow(() -> new RuntimeException("Conversation not found with id: " + messageDTO.getIdConversation()));

        Message message = Message.builder()
                .content(messageDTO.getContent())
                .userId(messageDTO.getUserId())
                .conversation(conversation)
                .build();

        Message savedMessage = messageService.createMessage(message);
        return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(savedMessage));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MessageDTO> updateMessage(
            @PathVariable Long id,
            @RequestBody MessageDTO messageDTO) {
        
        Message message = Message.builder()
                .content(messageDTO.getContent())
                .userId(messageDTO.getUserId())
                .build();

        Message updatedMessage = messageService.updateMessage(id, message);
        return ResponseEntity.ok(convertToDTO(updatedMessage));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMessage(@PathVariable Long id) {
        messageService.deleteMessage(id);
        return ResponseEntity.noContent().build();
    }

    private MessageDTO convertToDTO(Message message) {
        return MessageDTO.builder()
                .idMessage(message.getIdMessage())
                .content(message.getContent())
                .userId(message.getUserId())
                .idConversation(message.getConversation() != null ? message.getConversation().getIdConversation() : null)
                .createdAt(message.getCreatedAt())
                .updatedAt(message.getUpdatedAt())
                .build();
    }
}
