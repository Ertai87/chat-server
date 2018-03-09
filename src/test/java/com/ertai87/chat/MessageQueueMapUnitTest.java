package com.ertai87.chat;

import org.hamcrest.core.Is;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import java.util.HashSet;
import java.util.LinkedList;
import java.util.Map;
import java.util.Queue;

import static com.ertai87.chat.Constants.ADMIN_USERNAME;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.mockito.Matchers.any;
import static org.mockito.Matchers.anyBoolean;
import static org.mockito.Matchers.anyString;
import static org.mockito.Matchers.eq;
import static org.mockito.Mockito.*;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = Application.class)
public class MessageQueueMapUnitTest {

    @Mock
    private Map<String, Queue<ChatEntry>> data;

    @Mock
    private Map<String, Boolean> locks;

    @InjectMocks
    private MessageQueueMap messageQueueMap;

    private final String USERNAME = "user1";
    private final String MESSAGE = "test message";

    @Test
    public void testAddUserWhenNotExists(){
        when(data.containsKey(anyString())).thenReturn(false);
        messageQueueMap.addUser(USERNAME);
        verify(data).put(eq(USERNAME), any(Queue.class));
        verify(locks).put(USERNAME, false);
    }

    @Test(expected = RuntimeException.class)
    public void testAddUserWhenExists(){
        when(data.containsKey(anyString())).thenReturn(true);
        messageQueueMap.addUser(USERNAME);
        verify(data, never()).put(anyString(), any(Queue.class));
        verify(locks, never()).put(anyString(), anyBoolean());
    }

    @Test(expected = RuntimeException.class)
    public void testAddAdminUser(){
        when(data.containsKey(anyString())).thenReturn(false);
        messageQueueMap.addUser(ADMIN_USERNAME);
        verify(data, never()).put(anyString(), any(Queue.class));
        verify(locks, never()).put(anyString(), anyBoolean());
    }
    
    @Test
    public void testAddMessage() throws InterruptedException {
        Map.Entry<String, Queue<ChatEntry>> entry = mock(Map.Entry.class);
        HashSet<Map.Entry<String, Queue<ChatEntry>>> entrySet = new HashSet<>();
        Queue<ChatEntry> messageQueue = Mockito.mock(Queue.class);
        entrySet.add(entry);

        when(data.containsKey(anyString())).thenReturn(true);
        when(data.entrySet()).thenReturn(entrySet);
        when(locks.get(anyString())).thenReturn(false);
        when(entry.getKey()).thenReturn(USERNAME);
        when(entry.getValue()).thenReturn(messageQueue);

        messageQueueMap.addMessage(new ChatEntry(USERNAME, MESSAGE));

        verify(data).entrySet();
        verify(locks, atLeastOnce()).get(USERNAME);
        verify(locks).put(USERNAME, true);
        verify(locks).put(USERNAME, false);
        verify(entry, atLeastOnce()).getKey();
        verify(messageQueue).add(any(ChatEntry.class));
    }

    @Test(expected = RuntimeException.class)
    public void testAddMessageWhenUserDoesNotExist() throws InterruptedException {
        when(data.containsKey(anyString())).thenReturn(false);
        messageQueueMap.addMessage(new ChatEntry(USERNAME, MESSAGE));
        verify(locks, never()).get(anyString());
        verify(locks, never()).put(anyString(), anyBoolean());
    }

    @Test
    public void testRetrieveNewMessagesForUserWhoExists() throws InterruptedException {
        ChatEntry entry = new ChatEntry(USERNAME, MESSAGE);
        Queue<ChatEntry> messages = new LinkedList<>();
        messages.add(entry);

        when(data.containsKey(anyString())).thenReturn(true);
        when(locks.get(anyString())).thenReturn(false);
        when(data.get(anyString())).thenReturn(messages);

        Queue<ChatEntry> ret = messageQueueMap.retrieveNewMessages(USERNAME);

        verify(locks).put(USERNAME, true);
        verify(data).get(USERNAME);
        verify(data).put(eq(USERNAME), any(Queue.class));
        verify(locks).put(USERNAME, false);
        assertThat(ret.contains(entry), Is.is(true));
    }

    @Test(expected = RuntimeException.class)
    public void testRetrieveNewMessagesForUserWhoDoesNotExist() throws InterruptedException {
        when(data.containsKey(anyString())).thenReturn(false);
        messageQueueMap.retrieveNewMessages(USERNAME);
        verify(locks, never()).put(anyString(), anyBoolean());
        verify(data, never()).put(anyString(), any(Queue.class));
    }

    @Test
    public void testDeleteUserWhoExists() throws InterruptedException {
        when(data.containsKey(anyString())).thenReturn(true);
        when(locks.get(anyString())).thenReturn(false);
        messageQueueMap.deleteUser(USERNAME);
        verify(locks).put(USERNAME, true);
        verify(data).remove(USERNAME);
        verify(locks).remove(USERNAME);
    }

    @Test(expected = RuntimeException.class)
    public void testDeleteUserWhoDoesNotExist() throws InterruptedException {
        when(data.containsKey(anyString())).thenReturn(false);
        messageQueueMap.deleteUser(USERNAME);
        verify(locks, never()).put(anyString(), anyBoolean());
        verify(data, never()).remove(anyString());
        verify(locks, never()).remove(anyString());
    }
}
