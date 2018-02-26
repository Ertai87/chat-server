package com.ertai87.chat;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedList;
import java.util.Map;
import java.util.Queue;

import static java.lang.Thread.sleep;

@RestController
public class ChatController {

    @Autowired
    private Map<String, Queue<ChatEntry>> messageQueueMap;

    @Autowired
    private Map<String, Boolean> messageQueueLocks;

    @RequestMapping(value = "/postLogin", method = RequestMethod.POST)
    public @ResponseBody String postLogin(@RequestBody String username){
        //For some reason, an = sign is appended to the string parameter in flight, have to remove it
        username = username.substring(0, username.length() - 1);
        if (!messageQueueMap.containsKey(username)){
            messageQueueMap.put(username, new LinkedList<>());
            messageQueueLocks.put(username, false);
        }else{
            throw new RuntimeException("Username " + username + " already exists!");
        }
        return "{}";
    }

    @RequestMapping(value = "/postMessage", method = RequestMethod.POST)
    public @ResponseBody String postMessage(@RequestBody ChatEntry message) throws InterruptedException {
        if (messageQueueMap.containsKey(message.getUsername())){
            while (messageQueueLocks.get(message.getUsername())) sleep(50);

            for (Map.Entry<String, Queue<ChatEntry>> entry : messageQueueMap.entrySet()){
                messageQueueLocks.put(entry.getKey(), true);
                entry.getValue().add(message);
                messageQueueLocks.put(entry.getKey(), false);
            }
        }else{
            throw new RuntimeException("Username " + message.getUsername() + " does not exist!");
        }
        return "{}";
    }

    @RequestMapping(value = "/getNewMessages/{username}", method = RequestMethod.GET)
    public @ResponseBody Queue<ChatEntry> getNewMessages(@PathVariable("username") String username) throws InterruptedException {

        while(messageQueueLocks.get(username)) sleep(50);

        messageQueueLocks.put(username, true);
        Queue<ChatEntry> newMessages = messageQueueMap.get(username);
        messageQueueMap.put(username, new LinkedList<>());
        messageQueueLocks.put(username, false);

        return newMessages;
    }

    @RequestMapping("/ping")
    public String ping(){
        return "Service up";
    }
}
