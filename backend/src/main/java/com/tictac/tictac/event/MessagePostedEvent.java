package com.tictac.tictac.event;

import com.tictac.tictac.entity.Message;

public record MessagePostedEvent(Message message) {
}
