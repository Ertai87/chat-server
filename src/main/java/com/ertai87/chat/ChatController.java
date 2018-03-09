package com.ertai87.chat;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Queue;

@RestController
public class ChatController {

    @Autowired
    private MessageQueueMap messageQueueMap;

    @RequestMapping(value = "/postLogin", method = RequestMethod.POST)
    public @ResponseBody String postLogin(@RequestBody String username) throws InterruptedException {
        //For some reason, an = sign is appended to the string parameter in flight, have to remove it
        username = username.substring(0, username.length() - 1);

        messageQueueMap.addUser(username);
        messageQueueMap.addAdminMessage(username + " has entered the chat room.");

        return "{}";
    }

    @RequestMapping(value = "/postMessage", method = RequestMethod.POST)
    public @ResponseBody String postMessage(@RequestBody ChatEntry message) throws InterruptedException {
        messageQueueMap.addMessage(message);
        return "{}";
    }

    @RequestMapping(value = "/getNewMessages/{username}", method = RequestMethod.GET)
    public @ResponseBody Queue<ChatEntry> getNewMessages(@PathVariable("username") String username) throws InterruptedException {
        return messageQueueMap.retrieveNewMessages(username);
    }

    /* This request may cause other methods to throw errors based on race conditions.
        This is intended behaviour.
     */
    @RequestMapping(value = "/postLogout", method = RequestMethod.POST)
    public @ResponseBody String postLogout(@RequestBody String username) throws InterruptedException {
        //For some reason, an = sign is appended to the string parameter in flight, have to remove it
        username = username.substring(0, username.length() - 1);

        messageQueueMap.deleteUser(username);
        messageQueueMap.addAdminMessage(username + " has left the chat room.");
        return "{}";
    }

    @RequestMapping("/ping")
    public String ping(){
        return "Service up";
    }


}
