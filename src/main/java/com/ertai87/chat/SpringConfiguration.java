package com.ertai87.chat;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.LinkedList;
import java.util.List;

@Configuration
public class SpringConfiguration {


    @Bean
    public ChatLog chatLog(){
        return new ChatLog();
    }
}
