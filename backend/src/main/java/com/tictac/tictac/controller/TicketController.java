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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.tictac.tictac.dto.TicketDTO;
import com.tictac.tictac.entity.Category;
import com.tictac.tictac.entity.Ticket;
import com.tictac.tictac.entity.User;
import com.tictac.tictac.service.CategoryService;
import com.tictac.tictac.service.TicketService;
import com.tictac.tictac.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/tickets")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class TicketController {

    private final TicketService ticketService;
    private final CategoryService categoryService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<TicketDTO>> getAllTickets() {
        List<TicketDTO> tickets = ticketService.getAllTickets()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(tickets);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketDTO> getTicketById(@PathVariable Long id) {
        return ticketService.getTicketById(id)
                .map(ticket -> ResponseEntity.ok(convertToDTO(ticket)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<TicketDTO>> getTicketsByCategory(@PathVariable Long categoryId) {
        List<TicketDTO> tickets = ticketService.getTicketsByCategory(categoryId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(tickets);
    }

    @GetMapping("/creator/{userId}")
    public ResponseEntity<List<TicketDTO>> getTicketsByCreator(@PathVariable Long userId) {
        List<TicketDTO> tickets = ticketService.getTicketsByCreator(userId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(tickets);
    }

    @GetMapping("/search")
    public ResponseEntity<List<TicketDTO>> getTicketsByStatus(@RequestParam String status) {
        List<TicketDTO> tickets = ticketService.getTicketsByStatus(status)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(tickets);
    }

    @PostMapping
    public ResponseEntity<TicketDTO> createTicket(@RequestBody TicketDTO ticketDTO) {
        Category category = categoryService.getCategoryById(ticketDTO.getIdCategory())
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + ticketDTO.getIdCategory()));

        User creator = userService.getUserById(ticketDTO.getUserCreatorId())
                .orElseThrow(() -> new RuntimeException("Creator user not found with id: " + ticketDTO.getUserCreatorId()));

        User assignedAgent = null;
        if (ticketDTO.getUserAgentId() != null) {
            assignedAgent = userService.getUserById(ticketDTO.getUserAgentId())
                    .orElseThrow(() -> new RuntimeException("Agent user not found with id: " + ticketDTO.getUserAgentId()));
        }

        Ticket ticket = Ticket.builder()
                .title(ticketDTO.getTitle())
                .description(ticketDTO.getDescription())
                .status(ticketDTO.getStatus() != null ? ticketDTO.getStatus() : "OPEN")
                .priority(ticketDTO.getPriority() != null ? ticketDTO.getPriority() : "MEDIUM")
                .creator(creator)
                .assignedAgent(assignedAgent)
                .category(category)
                .build();

        Ticket savedTicket = ticketService.createTicket(ticket);
        return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(savedTicket));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TicketDTO> updateTicket(
            @PathVariable Long id,
            @RequestBody TicketDTO ticketDTO) {
        
        Category category = null;
        if (ticketDTO.getIdCategory() != null) {
            category = categoryService.getCategoryById(ticketDTO.getIdCategory())
                    .orElseThrow(() -> new RuntimeException("Category not found with id: " + ticketDTO.getIdCategory()));
        }

        User creator = null;
        if (ticketDTO.getUserCreatorId() != null) {
            creator = userService.getUserById(ticketDTO.getUserCreatorId())
                    .orElseThrow(() -> new RuntimeException("Creator user not found with id: " + ticketDTO.getUserCreatorId()));
        }

        User assignedAgent = null;
        if (ticketDTO.getUserAgentId() != null) {
            assignedAgent = userService.getUserById(ticketDTO.getUserAgentId())
                    .orElseThrow(() -> new RuntimeException("Agent user not found with id: " + ticketDTO.getUserAgentId()));
        }

        Ticket ticket = Ticket.builder()
                .title(ticketDTO.getTitle())
                .description(ticketDTO.getDescription())
                .status(ticketDTO.getStatus())
                .priority(ticketDTO.getPriority())
                .creator(creator)
                .assignedAgent(assignedAgent)
                .category(category)
                .build();

        Ticket updatedTicket = ticketService.updateTicket(id, ticket);
        return ResponseEntity.ok(convertToDTO(updatedTicket));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(@PathVariable Long id) {
        ticketService.deleteTicket(id);
        return ResponseEntity.noContent().build();
    }

    private TicketDTO convertToDTO(Ticket ticket) {
        String creatorName = ticket.getCreator() != null
                ? ticket.getCreator().getFirstName() + " " + ticket.getCreator().getLastName()
                : null;
        String agentName = ticket.getAssignedAgent() != null
                ? ticket.getAssignedAgent().getFirstName() + " " + ticket.getAssignedAgent().getLastName()
                : null;
        return TicketDTO.builder()
                .idTicket(ticket.getIdTicket())
                .title(ticket.getTitle())
                .description(ticket.getDescription())
                .status(ticket.getStatus())
                .priority(ticket.getPriority())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .userCreatorId(ticket.getCreator() != null ? ticket.getCreator().getIdUser() : null)
                .userCreatorName(creatorName)
                .userAgentId(ticket.getAssignedAgent() != null ? ticket.getAssignedAgent().getIdUser() : null)
                .userAgentName(agentName)
                .idCategory(ticket.getCategory() != null ? ticket.getCategory().getIdCategory() : null)
                .build();
    }
}
