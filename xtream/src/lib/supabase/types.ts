export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          email: string | null
          display_name: string | null
          is_verified: boolean
          bio: string
          location: string
          profile_picture_url: string
          cover_photo_url: string
          follower_ids: string[]
          following_ids: string[]
          username_last_changed: string | null
          qr_code_data: string | null
          created_at: string
          lifetime_gold: number
          blocked_user_ids: string[]
          default_stream_category: string | null
          discovery_radius: number
          is_discoverable: boolean
          has_seen_onboarding: boolean
        }
        Insert: {
          id: string
          username: string
          email?: string | null
          display_name?: string | null
          is_verified?: boolean
          bio?: string
          location?: string
          profile_picture_url?: string
          cover_photo_url?: string
          follower_ids?: string[]
          following_ids?: string[]
          username_last_changed?: string | null
          qr_code_data?: string | null
          created_at?: string
          lifetime_gold?: number
          blocked_user_ids?: string[]
          default_stream_category?: string | null
          discovery_radius?: number
          is_discoverable?: boolean
          has_seen_onboarding?: boolean
        }
        Update: {
          id?: string
          username?: string
          email?: string | null
          display_name?: string | null
          is_verified?: boolean
          bio?: string
          location?: string
          profile_picture_url?: string
          cover_photo_url?: string
          follower_ids?: string[]
          following_ids?: string[]
          username_last_changed?: string | null
          qr_code_data?: string | null
          created_at?: string
          lifetime_gold?: number
          blocked_user_ids?: string[]
          default_stream_category?: string | null
          discovery_radius?: number
          is_discoverable?: boolean
          has_seen_onboarding?: boolean
        }
      }
      streams: {
        Row: {
          id: string
          user_id: string
          title: string
          category: string
          description: string
          tags: string[]
          live: boolean
          start_time: string
          end_time: string | null
          thumbnail_url: string
          reactions: Json
          allow_co_streaming: boolean
          co_streamer_ids: string[]
          join_requests: string[]
          recording_url: string | null
          audio_url: string | null
          allow_audio_download: boolean
          duration: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          category?: string
          description?: string
          tags?: string[]
          live?: boolean
          start_time?: string
          end_time?: string | null
          thumbnail_url?: string
          reactions?: Json
          allow_co_streaming?: boolean
          co_streamer_ids?: string[]
          join_requests?: string[]
          recording_url?: string | null
          audio_url?: string | null
          allow_audio_download?: boolean
          duration?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          category?: string
          description?: string
          tags?: string[]
          live?: boolean
          start_time?: string
          end_time?: string | null
          thumbnail_url?: string
          reactions?: Json
          allow_co_streaming?: boolean
          co_streamer_ids?: string[]
          join_requests?: string[]
          recording_url?: string | null
          audio_url?: string | null
          allow_audio_download?: boolean
          duration?: number | null
          created_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          creator_id: string
          original_stream_id: string
          title: string
          video_url: string
          thumbnail_url: string
          created_at: string
          reactions: Json
        }
        Insert: {
          id?: string
          creator_id: string
          original_stream_id: string
          title: string
          video_url?: string
          thumbnail_url?: string
          created_at?: string
          reactions?: Json
        }
        Update: {
          id?: string
          creator_id?: string
          original_stream_id?: string
          title?: string
          video_url?: string
          thumbnail_url?: string
          created_at?: string
          reactions?: Json
        }
      }
      events: {
        Row: {
          id: string
          title: string
          description: string
          organizer_id: string
          event_type: string
          location: string
          start_time: string
          max_attendees: number
          attendee_ids: string[]
          host: string | null
          type: string | null
          spots: string | null
          is_invitation: boolean
          distance: string | null
          is_free: boolean
          category: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string
          organizer_id: string
          event_type?: string
          location?: string
          start_time?: string
          max_attendees?: number
          attendee_ids?: string[]
          host?: string | null
          type?: string | null
          spots?: string | null
          is_invitation?: boolean
          distance?: string | null
          is_free?: boolean
          category?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          organizer_id?: string
          event_type?: string
          location?: string
          start_time?: string
          max_attendees?: number
          attendee_ids?: string[]
          host?: string | null
          type?: string | null
          spots?: string | null
          is_invitation?: boolean
          distance?: string | null
          is_free?: boolean
          category?: string | null
          created_at?: string
        }
      }
      challenges: {
        Row: {
          id: string
          creator_id: string
          title: string
          description: string
          rules: string
          submission_type: string
          deadline: string
          created_at: string
          cover_image_url: string | null
        }
        Insert: {
          id?: string
          creator_id: string
          title: string
          description?: string
          rules?: string
          submission_type?: string
          deadline?: string
          created_at?: string
          cover_image_url?: string | null
        }
        Update: {
          id?: string
          creator_id?: string
          title?: string
          description?: string
          rules?: string
          submission_type?: string
          deadline?: string
          created_at?: string
          cover_image_url?: string | null
        }
      }
      challenge_entries: {
        Row: {
          id: string
          challenge_id: string
          user_id: string
          content_url: string | null
          text_content: string | null
          created_at: string
          reactions: Json
        }
        Insert: {
          id?: string
          challenge_id: string
          user_id: string
          content_url?: string | null
          text_content?: string | null
          created_at?: string
          reactions?: Json
        }
        Update: {
          id?: string
          challenge_id?: string
          user_id?: string
          content_url?: string | null
          text_content?: string | null
          created_at?: string
          reactions?: Json
        }
      }
      beacons: {
        Row: {
          id: string
          creator_id: string
          location: string
          purpose: string
          expires_at: string
          created_at: string
          participant_ids: string[]
        }
        Insert: {
          id?: string
          creator_id: string
          location?: string
          purpose?: string
          expires_at?: string
          created_at?: string
          participant_ids?: string[]
        }
        Update: {
          id?: string
          creator_id?: string
          location?: string
          purpose?: string
          expires_at?: string
          created_at?: string
          participant_ids?: string[]
        }
      }
      chats: {
        Row: {
          id: string
          type: string
          participant_ids: string[]
          created_at: string
        }
        Insert: {
          id?: string
          type?: string
          participant_ids?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          type?: string
          participant_ids?: string[]
          created_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          chat_id: string
          sender_id: string
          content: string
          created_at: string
          sender_name: string | null
          sender_photo_url: string | null
        }
        Insert: {
          id?: string
          chat_id: string
          sender_id: string
          content: string
          created_at?: string
          sender_name?: string | null
          sender_photo_url?: string | null
        }
        Update: {
          id?: string
          chat_id?: string
          sender_id?: string
          content?: string
          created_at?: string
          sender_name?: string | null
          sender_photo_url?: string | null
        }
      }
      comments: {
        Row: {
          id: string
          content_id: string
          content_type: string
          user_id: string
          text: string
          parent_id: string | null
          created_at: string
          reactions: Json
        }
        Insert: {
          id?: string
          content_id: string
          content_type: string
          user_id: string
          text: string
          parent_id?: string | null
          created_at?: string
          reactions?: Json
        }
        Update: {
          id?: string
          content_id?: string
          content_type?: string
          user_id?: string
          text?: string
          parent_id?: string | null
          created_at?: string
          reactions?: Json
        }
      }
      user_reactions: {
        Row: {
          id: string
          user_id: string
          content_id: string
          content_type: string
          reaction_type: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content_id: string
          content_type: string
          reaction_type: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content_id?: string
          content_type?: string
          reaction_type?: string
          created_at?: string
        }
      }
    }
  }
}
