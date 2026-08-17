export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      consultants: {
        Row: {
          created_at: string
          custom_message: string | null
          display_order: number
          id: string
          is_active: boolean
          name: string
          photo: string | null
          updated_at: string
          whatsapp: string
        }
        Insert: {
          created_at?: string
          custom_message?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          name: string
          photo?: string | null
          updated_at?: string
          whatsapp?: string
        }
        Update: {
          created_at?: string
          custom_message?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          name?: string
          photo?: string | null
          updated_at?: string
          whatsapp?: string
        }
        Relationships: []
      }
      galleries: {
        Row: {
          created_at: string
          description: string
          display_order: number
          id: string
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          display_order?: number
          id?: string
          name: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          display_order?: number
          id?: string
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      gallery_images: {
        Row: {
          caption: string
          created_at: string
          display_order: number
          gallery_id: string
          id: string
          url: string
        }
        Insert: {
          caption?: string
          created_at?: string
          display_order?: number
          gallery_id: string
          id?: string
          url: string
        }
        Update: {
          caption?: string
          created_at?: string
          display_order?: number
          gallery_id?: string
          id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "gallery_images_gallery_id_fkey"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "galleries"
            referencedColumns: ["id"]
          },
        ]
      }
      look_contacts: {
        Row: {
          consultant_id: string | null
          consultant_name: string
          created_at: string
          event_type: string
          id: string
          look_id: string | null
          look_reference: string
        }
        Insert: {
          consultant_id?: string | null
          consultant_name?: string
          created_at?: string
          event_type?: string
          id?: string
          look_id?: string | null
          look_reference?: string
        }
        Update: {
          consultant_id?: string | null
          consultant_name?: string
          created_at?: string
          event_type?: string
          id?: string
          look_id?: string | null
          look_reference?: string
        }
        Relationships: [
          {
            foreignKeyName: "look_contacts_consultant_id_fkey"
            columns: ["consultant_id"]
            isOneToOne: false
            referencedRelation: "consultants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "look_contacts_look_id_fkey"
            columns: ["look_id"]
            isOneToOne: false
            referencedRelation: "looks"
            referencedColumns: ["id"]
          },
        ]
      }
      looks: {
        Row: {
          created_at: string
          detail_image: string | null
          display_order: number
          full_look_image: string | null
          id: string
          reference: string
          status: string
          updated_at: string
          whatsapp_message: string | null
        }
        Insert: {
          created_at?: string
          detail_image?: string | null
          display_order?: number
          full_look_image?: string | null
          id?: string
          reference: string
          status?: string
          updated_at?: string
          whatsapp_message?: string | null
        }
        Update: {
          created_at?: string
          detail_image?: string | null
          display_order?: number
          full_look_image?: string | null
          id?: string
          reference?: string
          status?: string
          updated_at?: string
          whatsapp_message?: string | null
        }
        Relationships: []
      }
      photos: {
        Row: {
          created_at: string
          display_order: number
          id: string
          image_role: string | null
          is_active: boolean
          label: string
          look_id: string | null
          storage_path: string | null
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          image_role?: string | null
          is_active?: boolean
          label?: string
          look_id?: string | null
          storage_path?: string | null
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          image_role?: string | null
          is_active?: boolean
          label?: string
          look_id?: string | null
          storage_path?: string | null
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "photos_look_id_fkey"
            columns: ["look_id"]
            isOneToOne: false
            referencedRelation: "looks"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean
          last_login_at: string | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string
          id: string
          is_active?: boolean
          last_login_at?: string | null
          name?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          last_login_at?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_sections: {
        Row: {
          display_order: number
          is_active: boolean
          key: string
          name: string
          updated_at: string
        }
        Insert: {
          display_order?: number
          is_active?: boolean
          key: string
          name: string
          updated_at?: string
        }
        Update: {
          display_order?: number
          is_active?: boolean
          key?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          key: string
          updated_at?: string
          value?: string
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      site_texts: {
        Row: {
          display_order: number
          group_name: string
          key: string
          label: string
          updated_at: string
          value: string
        }
        Insert: {
          display_order?: number
          group_name?: string
          key: string
          label: string
          updated_at?: string
          value?: string
        }
        Update: {
          display_order?: number
          group_name?: string
          key?: string
          label?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      site_visits: {
        Row: {
          country: string
          created_at: string
          device: string
          id: string
          language: string
          path: string
          referrer: string
          visitor_key: string
        }
        Insert: {
          country?: string
          created_at?: string
          device?: string
          id?: string
          language?: string
          path?: string
          referrer?: string
          visitor_key?: string
        }
        Update: {
          country?: string
          created_at?: string
          device?: string
          id?: string
          language?: string
          path?: string
          referrer?: string
          visitor_key?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_principal: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "principal" | "admin"
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
    Enums: {
      app_role: ["principal", "admin"],
    },
  },
} as const
