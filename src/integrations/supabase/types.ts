export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      events: {
        Row: {
          created_at: string
          difficulty: string
          evidence_url: string | null
          id: string
          notes: string | null
          profile_id: string
          tags: string[] | null
          title: string
        }
        Insert: {
          created_at?: string
          difficulty?: string
          evidence_url?: string | null
          id?: string
          notes?: string | null
          profile_id: string
          tags?: string[] | null
          title: string
        }
        Update: {
          created_at?: string
          difficulty?: string
          evidence_url?: string | null
          id?: string
          notes?: string | null
          profile_id?: string
          tags?: string[] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      freeze_tokens: {
        Row: {
          created_at: string
          id: string
          profile_id: string
          reason: string | null
          redeemed_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          profile_id: string
          reason?: string | null
          redeemed_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          profile_id?: string
          reason?: string | null
          redeemed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "freeze_tokens_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      player_classes: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          active_class: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active_class?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active_class?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_active_class_fkey"
            columns: ["active_class"]
            isOneToOne: false
            referencedRelation: "player_classes"
            referencedColumns: ["id"]
          },
        ]
      }
      purchases: {
        Row: {
          cost_xp: number
          created_at: string
          id: string
          profile_id: string
          redeemed_at: string | null
          redemption_note: string | null
          reward_id: string
        }
        Insert: {
          cost_xp: number
          created_at?: string
          id?: string
          profile_id: string
          redeemed_at?: string | null
          redemption_note?: string | null
          reward_id: string
        }
        Update: {
          cost_xp?: number
          created_at?: string
          id?: string
          profile_id?: string
          redeemed_at?: string | null
          redemption_note?: string | null
          reward_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      quest_checklist: {
        Row: {
          created_at: string
          id: string
          is_done: boolean
          label: string
          quest_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_done?: boolean
          label: string
          quest_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_done?: boolean
          label?: string
          quest_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quest_checklist_quest_id_fkey"
            columns: ["quest_id"]
            isOneToOne: false
            referencedRelation: "quests"
            referencedColumns: ["id"]
          },
        ]
      }
      quests: {
        Row: {
          base_xp: number
          class_id: string
          created_at: string
          description: string | null
          difficulty: string
          due_at: string | null
          id: string
          status: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          base_xp: number
          class_id: string
          created_at?: string
          description?: string | null
          difficulty: string
          due_at?: string | null
          id?: string
          status?: string
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          base_xp?: number
          class_id?: string
          created_at?: string
          description?: string | null
          difficulty?: string
          due_at?: string | null
          id?: string
          status?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quests_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "player_classes"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards: {
        Row: {
          cooldown_days: number
          cost_xp: number
          created_at: string
          description: string | null
          id: string
          prerequisite_json: Json
          title: string
        }
        Insert: {
          cooldown_days?: number
          cost_xp: number
          created_at?: string
          description?: string | null
          id?: string
          prerequisite_json?: Json
          title: string
        }
        Update: {
          cooldown_days?: number
          cost_xp?: number
          created_at?: string
          description?: string | null
          id?: string
          prerequisite_json?: Json
          title?: string
        }
        Relationships: []
      }
      rules: {
        Row: {
          id: string
          name: string
          rules_json: Json
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          rules_json: Json
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          rules_json?: Json
          updated_at?: string
        }
        Relationships: []
      }
      skills: {
        Row: {
          class_id: string
          created_at: string
          description: string | null
          id: string
          name: string
          parent_id: string | null
          slug: string
          tier: number
        }
        Insert: {
          class_id: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          parent_id?: string | null
          slug: string
          tier: number
        }
        Update: {
          class_id?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          slug?: string
          tier?: number
        }
        Relationships: [
          {
            foreignKeyName: "skills_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "player_classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "skills_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      streaks: {
        Row: {
          best: number
          current: number
          profile_id: string
          updated_at: string
        }
        Insert: {
          best?: number
          current?: number
          profile_id: string
          updated_at?: string
        }
        Update: {
          best?: number
          current?: number
          profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "streaks_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      xp_transactions: {
        Row: {
          base_xp: number
          created_at: string
          id: string
          multiplier: number
          notes: string | null
          profile_id: string
          source: string
          source_id: string | null
          total_xp: number | null
        }
        Insert: {
          base_xp: number
          created_at?: string
          id?: string
          multiplier?: number
          notes?: string | null
          profile_id: string
          source: string
          source_id?: string | null
          total_xp?: number | null
        }
        Update: {
          base_xp?: number
          created_at?: string
          id?: string
          multiplier?: number
          notes?: string | null
          profile_id?: string
          source?: string
          source_id?: string | null
          total_xp?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "xp_transactions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_xp: {
        Args: {
          p_profile_id: string
          p_source: string
          p_source_id: string
          p_base_xp: number
          p_context?: Json
        }
        Returns: string
      }
      get_profile_stats: {
        Args: { p_profile_id: string }
        Returns: {
          total_xp: number
          current_level: number
          xp_to_next_level: number
          xp_progress: number
          today_xp: number
          current_streak: number
          longest_streak: number
          freeze_tokens: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
