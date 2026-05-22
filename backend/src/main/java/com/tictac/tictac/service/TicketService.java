package com.tictac.tictac.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tictac.tictac.entity.Category;
import com.tictac.tictac.entity.Conversation;
import com.tictac.tictac.entity.Ticket;
import com.tictac.tictac.entity.User;
import com.tictac.tictac.event.TicketAssignedEvent;
import com.tictac.tictac.event.TicketUpdatedEvent;
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
    private final ApplicationEventPublisher events;

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
        Conversation conversation = Conversation.builder()
                .ticket(savedTicket)
                .build();
        conversationRepository.save(conversation);
        return savedTicket;
    }

    public Ticket updateTicket(Long id, Ticket ticketDetails) {
        Ticket existing = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + id));

        Long previousAgentId = existing.getAssignedAgent() == null ? null : existing.getAssignedAgent().getIdUser();
        String previousStatus = existing.getStatus();
        String previousPriority = existing.getPriority();
        String previousTitle = existing.getTitle();
        String previousDescription = existing.getDescription();

        if (ticketDetails.getTitle() != null) existing.setTitle(ticketDetails.getTitle());
        if (ticketDetails.getDescription() != null) existing.setDescription(ticketDetails.getDescription());
        if (ticketDetails.getStatus() != null) existing.setStatus(ticketDetails.getStatus());
        if (ticketDetails.getPriority() != null) existing.setPriority(ticketDetails.getPriority());
        if (ticketDetails.getAssignedAgent() != null) existing.setAssignedAgent(ticketDetails.getAssignedAgent());
        if (ticketDetails.getCategory() != null) existing.setCategory(ticketDetails.getCategory());

        Ticket saved = ticketRepository.save(existing);

        User newAgent = saved.getAssignedAgent();
        Long newAgentId = newAgent == null ? null : newAgent.getIdUser();
        if (newAgentId != null && !Objects.equals(newAgentId, previousAgentId)) {
            events.publishEvent(new TicketAssignedEvent(saved, newAgent));
        }

        List<String> changes = new ArrayList<>();
        if (!Objects.equals(previousStatus, saved.getStatus())) {
            changes.add("Statut : " + previousStatus + " → " + saved.getStatus());
        }
        if (!Objects.equals(previousPriority, saved.getPriority())) {
            changes.add("Priorité : " + previousPriority + " → " + saved.getPriority());
        }
        if (!Objects.equals(previousTitle, saved.getTitle())) {
            changes.add("Titre modifié");
        }
        if (!Objects.equals(previousDescription, saved.getDescription())) {
            changes.add("Description modifiée");
        }
        if (!Objects.equals(previousAgentId, newAgentId)) {
            String label = newAgent == null
                    ? "Agent retiré"
                    : "Agent assigné : " + newAgent.getFirstName() + " " + newAgent.getLastName();
            changes.add(label);
        }
        if (!changes.isEmpty()) {
            events.publishEvent(new TicketUpdatedEvent(saved, changes));
        }

        return saved;
    }

    public void deleteTicket(Long id) {
        ticketRepository.deleteById(id);
    }
}
