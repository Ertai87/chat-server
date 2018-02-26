package com.ertai87.chat;

import lombok.AllArgsConstructor;
import lombok.Data;

@AllArgsConstructor
@Data
class ChatEntry{
    private String username;
    private String message;
}
