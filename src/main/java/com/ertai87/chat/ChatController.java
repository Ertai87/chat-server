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

    @Autowired
    private String serverAdminUsername;

    @RequestMapping(value = "/postLogin", method = RequestMethod.POST)
    public @ResponseBody String postLogin(@RequestBody String username) throws InterruptedException {
        //For some reason, an = sign is appended to the string parameter in flight, have to remove it
        username = username.substring(0, username.length() - 1);

        if (username.equals(serverAdminUsername)){
            throw new RuntimeException("That username is reserved.  Please choose another");
        }
        if (messageQueueMap.containsKey(username)) {
            throw new RuntimeException("Username " + username + " already exists!");
        }

        messageQueueMap.put(username, new LinkedList<>());
        messageQueueLocks.put(username, false);

        distributeAdminMessage(username + " has entered the chat room.");

        return "{}";
    }

    @RequestMapping(value = "/postMessage", method = RequestMethod.POST)
    public @ResponseBody String postMessage(@RequestBody ChatEntry message) throws InterruptedException {
        if (messageQueueMap.containsKey(message.getUsername())){
            distributeMessage(message);
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

    /* This request may cause other methods to throw errors based on race conditions.
        This is intended behaviour.
     */
    @RequestMapping(value = "/postLogout", method = RequestMethod.POST)
    public @ResponseBody String postLogout(@RequestBody String username) throws InterruptedException {
        //For some reason, an = sign is appended to the string parameter in flight, have to remove it
        username = username.substring(0, username.length() - 1);

        while(messageQueueLocks.get(username)) sleep(50);
        messageQueueLocks.put(username, true);
        messageQueueMap.remove(username);
        messageQueueLocks.remove(username);

        distributeAdminMessage(username + " has left the chat room.");
        return "{}";
    }

    @RequestMapping("/ping")
    public String ping(){
        return "Service up";
    }

    private void distributeAdminMessage(String message) throws InterruptedException {
        distributeMessage(new ChatEntry(serverAdminUsername, message));
    }

    private void distributeMessage(ChatEntry message) throws InterruptedException {
        for (Map.Entry<String, Queue<ChatEntry>> entry : messageQueueMap.entrySet()){
            while(messageQueueLocks.get(entry.getKey())) sleep(50);
            messageQueueLocks.put(entry.getKey(), true);
            entry.getValue().add(message);
            messageQueueLocks.put(entry.getKey(), false);
        }
    }
}
