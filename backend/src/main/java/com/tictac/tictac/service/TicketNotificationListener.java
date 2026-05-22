package com.tictac.tictac.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import com.tictac.tictac.entity.Ticket;
import com.tictac.tictac.entity.User;
import com.tictac.tictac.event.TicketAssignedEvent;
import com.tictac.tictac.event.TicketUpdatedEvent;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class TicketNotificationListener {

    private final MailService mailService;

    @Value("${frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Async
    @EventListener
    public void onTicketAssigned(TicketAssignedEvent event) {
        Ticket ticket = event.ticket();
        User agent = event.agent();
        if (agent == null || agent.getEmail() == null) return;

        String subject = "[TicTac] Nouveau ticket attribué : #" + ticket.getIdTicket() + " " + ticket.getTitle();
        String body = String.format(
                "Bonjour %s,%n%n"
                        + "Le ticket #%d \"%s\" vient de vous être attribué.%n%n"
                        + "Priorité : %s%nStatut : %s%n%n"
                        + "Consulter le ticket : %s/tickets/%d%n%n"
                        + "— TicTac",
                safeName(agent),
                ticket.getIdTicket(),
                ticket.getTitle(),
                ticket.getPriority(),
                ticket.getStatus(),
                frontendUrl,
                ticket.getIdTicket()
        );
        mailService.send(agent.getEmail(), subject, body);
    }

    @Async
    @EventListener
    public void onTicketUpdated(TicketUpdatedEvent event) {
        Ticket ticket = event.ticket();
        User creator = ticket.getCreator();
        if (creator == null || creator.getEmail() == null) return;
        if (event.changes().isEmpty()) return;

        String subject = "[TicTac] Mise à jour du ticket #" + ticket.getIdTicket() + " " + ticket.getTitle();
        String body = String.format(
                "Bonjour %s,%n%n"
                        + "Votre ticket #%d \"%s\" a été mis à jour :%n%n"
                        + "%s%n%n"
                        + "Consulter le ticket : %s/tickets/%d%n%n"
                        + "— TicTac",
                safeName(creator),
                ticket.getIdTicket(),
                ticket.getTitle(),
                String.join("\n", event.changes().stream().map(c -> "  • " + c).toList()),
                frontendUrl,
                ticket.getIdTicket()
        );
        mailService.send(creator.getEmail(), subject, body);
    }

    private String safeName(User u) {
        String fn = u.getFirstName() == null ? "" : u.getFirstName();
        return fn.isBlank() ? u.getEmail() : fn;
    }
}
