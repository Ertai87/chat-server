package com.ertai87.chat;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import static org.mockito.Mockito.anyString;
import static org.mockito.Mockito.verify;

@RunWith(SpringJUnit4ClassRunner.class)
public class ChatControllerUnitTest {

    @Mock
    private MessageQueueMap messageQueueMap;

    @InjectMocks
    private ChatController chatController;

    private final String USERNAME = "user1";
    private final String MESSAGE = "test message";

    @Test
    public void testLoginUser() throws InterruptedException {
        chatController.postLogin(USERNAME + "=");
        verify(messageQueueMap).addUser(USERNAME);
        verify(messageQueueMap).addAdminMessage(anyString());
    }

    @Test
    public void testAddMessage() throws InterruptedException {
        ChatEntry entry = new ChatEntry(USERNAME, MESSAGE);
        chatController.postMessage(entry);
        verify(messageQueueMap).addMessage(entry);
    }

    @Test
    public void testLogoutUser() throws InterruptedException {
        chatController.postLogout(USERNAME + "=");
        verify(messageQueueMap).deleteUser(USERNAME);
    }

    @Test
    public void testGetNewMessages() throws InterruptedException {
        chatController.getNewMessages(USERNAME);
        verify(messageQueueMap).retrieveNewMessages(USERNAME);
    }
}
