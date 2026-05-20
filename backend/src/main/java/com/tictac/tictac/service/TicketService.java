package com.tictac.tictac.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tictac.tictac.entity.Category;
import com.tictac.tictac.entity.Conversation;
import com.tictac.tictac.entity.Ticket;
import com.tictac.tictac.repository.CategoryRepository;
import com.tictac.tictac.repository.ConversationRepository;
import com.tictac.tictac.repository.TicketRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class TicketService {

    private final TicketRepository ticketRepository;
    private final CategoryRepository categoryRepository;
    private final ConversationRepository conversationRepository;

    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    public Optional<Ticket> getTicketById(Long id) {
        return ticketRepository.findById(id);
    }

    public List<Ticket> getTicketsByCategory(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + categoryId));
        return ticketRepository.findByCategory(category);
    }

    public List<Ticket> getTicketsByCreator(Long userId) {
        return ticketRepository.findByCreatorIdUser(userId);
    }

    public List<Ticket> getTicketsByStatus(String status) {
        return ticketRepository.findByStatus(status);
    }

    public Ticket createTicket(Ticket ticket) {
        Ticket savedTicket = ticketRepository.save(ticket);
        // Create associated conversation automatically
        Conversation conversation = Conversation.builder()
                .ticket(savedTicket)
                .build();
        conversationRepository.save(conversation);
        return savedTicket;
    }

    public Ticket updateTicket(Long id, Ticket ticketDetails) {
        return ticketRepository.findById(id)
                .map(ticket -> {
                    ticket.setTitle(ticketDetails.getTitle());
                    ticket.setDescription(ticketDetails.getDescription());
                    ticket.setStatus(ticketDetails.getStatus());
                    ticket.setPriority(ticketDetails.getPriority());
                    ticket.setAssignedAgent(ticketDetails.getAssignedAgent());
                    ticket.setCategory(ticketDetails.getCategory());
                    return ticketRepository.save(ticket);
                })
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + id));
    }

    public void deleteTicket(Long id) {
        ticketRepository.deleteById(id);
    }
}
