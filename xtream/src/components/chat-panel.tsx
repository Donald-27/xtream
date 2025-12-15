
'use client';

import { useState, useRef, useEffect } from 'react';
import { useCollection, useFirestore, useUser, useAuth, addDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, serverTimestamp, where, getDocs, addDoc, doc, setDoc, getDoc, writeBatch } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import type { ChatMessage, Chat } from '@/lib/types';
import { Skeleton } from './ui/skeleton';
import { formatDistanceToNow } from 'date-fns';

interface ChatPanelProps {
  chatId: string;
}

export function ChatPanel({ chatId }: ChatPanelProps) {
  const firestore = useFirestore();
  const { user } = useUser();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Memoize the reference to the messages subcollection
  const messagesQuery = useMemoFirebase(() => {
    if (!firestore || !chatId) return null;
    return query(
      collection(firestore, 'chats', chatId, 'messages'),
      orderBy('timestamp', 'asc')
    );
  }, [firestore, chatId]);
  
  const { data: messages, isLoading } = useCollection<ChatMessage>(messagesQuery);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (message.trim() && user && firestore) {
      const chatDocRef = doc(firestore, 'chats', chatId);
      const messagesColRef = collection(chatDocRef, 'messages');

      try {
        // Start a batch to ensure atomicity
        const batch = writeBatch(firestore);
        
        const chatDoc = await getDoc(chatDocRef);
        
        if (!chatDoc.exists()) {
          // If the chat doesn't exist, create it along with adding the user to participants
          const chatData: Chat = {
            id: chatId,
            type: chatId.startsWith('game_') ? 'game' : 'event',
            participantIds: [user.uid],
          };
          batch.set(chatDocRef, chatData);
        }

        // Add the new message to the batch
        const newMessageRef = doc(messagesColRef);
        const newMessageData: Omit<ChatMessage, 'id'> = {
          senderId: user.uid,
          content: message.trim(),
          timestamp: serverTimestamp(),
          senderName: user.displayName || user.email,
          senderPhotoURL: user.photoURL,
        };
        batch.set(newMessageRef, newMessageData);

        // Commit the batch
        await batch.commit();

        setMessage('');
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  const getInitials = (name?: string | null) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  }

  return (
    <div className="flex flex-col h-full">
      <header className="p-4 border-b border-border/60">
          <h2 className="text-lg font-semibold">Discussion</h2>
      </header>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading && (
            <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
            </div>
        )}
        {messages && messages.map((msg) => (
          <div key={msg.id} className="flex items-start gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={msg.senderPhotoURL || undefined} />
              <AvatarFallback>{getInitials(msg.senderName)}</AvatarFallback>
            </Avatar>
            <div className='flex-1'>
              <div className="flex items-baseline gap-2">
                <p className="font-semibold text-sm">{msg.senderName || 'Anonymous'}</p>
                <p className="text-xs text-muted-foreground">
                  {msg.timestamp ? formatDistanceToNow(new Date(msg.timestamp.seconds * 1000), { addSuffix: true }) : 'sending...'}
                </p>
              </div>
              <p className="text-primary-foreground bg-secondary p-3 rounded-lg">{msg.content}</p>
            </div>
          </div>
        ))}
         {messages && messages.length === 0 && !isLoading && (
            <p className="text-center text-muted-foreground">Be the first to say something!</p>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-border/60">
        <div className="flex items-center gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message..."
            className="flex-1 bg-background"
            disabled={!user}
          />
          <Button onClick={handleSendMessage} disabled={!message.trim() || !user}>
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

    