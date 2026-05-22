package com.tictac.tictac;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class TictacApplication {

	public static void main(String[] args) {
		SpringApplication.run(TictacApplication.class, args);
	}

}
