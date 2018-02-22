package com.ertai87.chat;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ChatController {

    @Autowired
    private ChatLog log;

    @RequestMapping("/receiveMessage")
    public boolean receiveMessage(@RequestBody ChatEntry message){
        log.addEntry(message);
        return true;
    }
}
