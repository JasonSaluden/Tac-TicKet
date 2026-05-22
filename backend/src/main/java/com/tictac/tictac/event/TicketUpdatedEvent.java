package com.tictac.tictac.event;

import java.util.List;

import com.tictac.tictac.entity.Ticket;

public record TicketUpdatedEvent(Ticket ticket, List<String> changes) {
}
