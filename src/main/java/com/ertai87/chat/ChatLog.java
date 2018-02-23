package com.ertai87.chat;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.LinkedList;
import java.util.List;

@Getter
public class ChatLog {

    private List<ChatEntry> entries;

    public ChatLog(){
        entries = new LinkedList<>();
    }

    public void addEntry(ChatEntry newEntry){
        entries.add(newEntry);
    }
}
