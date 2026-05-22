package com.tictac.tictac.event;

import com.tictac.tictac.entity.Ticket;
import com.tictac.tictac.entity.User;

public record TicketAssignedEvent(Ticket ticket, User agent) {
}
