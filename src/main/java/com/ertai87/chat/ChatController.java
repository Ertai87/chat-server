package com.ertai87.chat;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class ChatController {

    @Autowired
    private ChatLog log;

    @RequestMapping(value = "/receiveMessage", method = RequestMethod.POST)
    public boolean receiveMessage(@RequestBody ChatEntry message){
        log.addEntry(message);
        return true;
    }

    @RequestMapping("/sendMessageLog")
    public String sendMessageLog(){
        List<ChatEntry> entries = log.getEntries();
        if (!entries.isEmpty()){
            return entries.get(0).getMessage();
        }
        return("");
    }

    @RequestMapping("/ping")
    public String ping(){
        return "Service up";
    }
}
