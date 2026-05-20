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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tictac.tictac.dto.ConversationDTO;
import com.tictac.tictac.entity.Conversation;
import com.tictac.tictac.entity.Ticket;
import com.tictac.tictac.service.ConversationService;
import com.tictac.tictac.service.TicketService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/conversations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class ConversationController {

    private final ConversationService conversationService;
    private final TicketService ticketService;

    @GetMapping
    public ResponseEntity<List<ConversationDTO>> getAllConversations() {
        List<ConversationDTO> conversations = conversationService.getAllConversations()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(conversations);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ConversationDTO> getConversationById(@PathVariable Long id) {
        return conversationService.getConversationById(id)
                .map(conversation -> ResponseEntity.ok(convertToDTO(conversation)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/ticket/{ticketId}")
    public ResponseEntity<ConversationDTO> getConversationByTicket(@PathVariable Long ticketId) {
        return conversationService.getConversationByTicket(ticketId)
                .map(conversation -> ResponseEntity.ok(convertToDTO(conversation)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ConversationDTO> createConversation(@RequestBody ConversationDTO conversationDTO) {
        Ticket ticket = ticketService.getTicketById(conversationDTO.getIdTicket())
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + conversationDTO.getIdTicket()));

        Conversation conversation = Conversation.builder()
                .ticket(ticket)
                .build();

        Conversation savedConversation = conversationService.createConversation(conversation);
        return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(savedConversation));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteConversation(@PathVariable Long id) {
        conversationService.deleteConversation(id);
        return ResponseEntity.noContent().build();
    }

    private ConversationDTO convertToDTO(Conversation conversation) {
        return ConversationDTO.builder()
                .idConversation(conversation.getIdConversation())
                .idTicket(conversation.getTicket() != null ? conversation.getTicket().getIdTicket() : null)
                .build();
    }
}
