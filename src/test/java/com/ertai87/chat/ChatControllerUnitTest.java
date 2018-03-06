package com.ertai87.chat;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import java.util.*;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.greaterThan;
import static org.mockito.Matchers.anyObject;
import static org.mockito.Matchers.eq;
import static org.mockito.Mockito.*;

@RunWith(SpringJUnit4ClassRunner.class)
public class ChatControllerUnitTest {

    @Mock
    private HashMap<String, Queue<ChatEntry>> messageQueueMap;

    @Mock
    private HashMap<String, Boolean> messageQueueLocks;

    @InjectMocks
    private ChatController chatController;

    @Test
    public void testLoginUser() throws InterruptedException {
        String username = "user1";
        chatController.postLogin(username + "=");
        verify(messageQueueMap).put(eq(username), any(Queue.class));
        verify(messageQueueLocks, atLeastOnce()).put(username, false);
    }
}
