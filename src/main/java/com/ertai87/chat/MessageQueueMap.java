package com.ertai87.chat;

import org.springframework.beans.factory.annotation.Autowired;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.Map;
import java.util.Queue;

import static com.ertai87.chat.Constants.ADMIN_USERNAME;
import static java.lang.Thread.sleep;

public class MessageQueueMap {

    @Autowired
    private Map<String, Queue<ChatEntry>> data;

    @Autowired
    private Map<String, Boolean> locks;

    private String serverAdminUsername = ADMIN_USERNAME;

    public void addUser(String username){
        if (username.equals(serverAdminUsername)){
            throw new RuntimeException("That username is reserved.  Please choose another");
        }
        if (data.containsKey(username)) {
            throw new RuntimeException("Username " + username + " already exists!");
        }

        data.put(username, new LinkedList<>());
        locks.put(username, false);
    }

    public void addMessage(ChatEntry message) throws InterruptedException {
        if (!data.containsKey(message.getUsername())) {
            throw new RuntimeException("Username " + message.getUsername() + " does not exist!");
        }
        distributeMessage(message);
    }

    public Queue<ChatEntry> retrieveNewMessages(String username) throws InterruptedException {
        if (!data.containsKey(username)) {
            throw new RuntimeException("Username " + username + " does not exist!");
        }

        while(locks.get(username)) sleep(50);
        locks.put(username, true);
        Queue<ChatEntry> newMessages = data.get(username);
        data.put(username, new LinkedList<>());
        locks.put(username, false);
        return newMessages;
    }

    public void deleteUser(String username) throws InterruptedException {
        if (!data.containsKey(username)) {
            throw new RuntimeException("Username " + username + " does not exist!");
        }

        while(locks.get(username)) sleep(50);
        locks.put(username, true);
        data.remove(username);
        locks.remove(username);
    }

    public void addAdminMessage(String message) throws InterruptedException {
        distributeMessage(new ChatEntry(serverAdminUsername, message));
    }

    private void distributeMessage(ChatEntry message) throws InterruptedException {
        for (Map.Entry<String, Queue<ChatEntry>> entry : data.entrySet()){
            while(locks.get(entry.getKey())) sleep(50);
            locks.put(entry.getKey(), true);
            entry.getValue().add(message);
            locks.put(entry.getKey(), false);
        }
    }
}
