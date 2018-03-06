package com.ertai87.chat;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.*;

@Configuration
public class SpringConfiguration {

    @Bean
    public Map<String, Queue<ChatEntry>> messageQueueMap(){
        return new HashMap<>();
    }

    @Bean
    public Map<String, Boolean> messageQueueLocks(){
        return new HashMap<>();
    }

    @Bean
    public String serverAdminUsername(){
        return "<SERVER ADMINISTRATOR>";
    }
}
