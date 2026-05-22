package com.tictac.tictac.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MailService {

    private static final Logger log = LoggerFactory.getLogger(MailService.class);

    private final JavaMailSender mailSender;

    @Value("${notifications.mail.enabled:false}")
    private boolean enabled;

    @Value("${notifications.mail.from:no-reply@tictac.local}")
    private String from;

    public void send(String to, String subject, String body) {
        if (!enabled) {
            log.info("[mail-disabled] to={} subject={}", to, subject);
            return;
        }
        if (to == null || to.isBlank()) {
            log.warn("Skipping mail: recipient is empty (subject={})", subject);
            return;
        }
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(from);
            msg.setTo(to);
            msg.setSubject(subject);
            msg.setText(body);
            mailSender.send(msg);
            log.info("Mail sent to={} subject={}", to, subject);
        } catch (Exception e) {
            log.error("Failed to send mail to={} subject={}: {}", to, subject, e.getMessage());
        }
    }
}
