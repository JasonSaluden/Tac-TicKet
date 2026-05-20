package com.tictac.tictac.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tictac.tictac.entity.Category;
import com.tictac.tictac.entity.Ticket;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByCategory(Category category);
    List<Ticket> findByUserCreatorId(Long userId);
    List<Ticket> findByStatus(String status);
}
