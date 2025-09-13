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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_log: {
        Row: {
          created_at: string
          email: string
          event: string
          id: string
          ip_address: string | null
          timestamp: string
        }
        Insert: {
          created_at?: string
          email: string
          event: string
          id?: string
          ip_address?: string | null
          timestamp?: string
        }
        Update: {
          created_at?: string
          email?: string
          event?: string
          id?: string
          ip_address?: string | null
          timestamp?: string
        }
        Relationships: []
      }
      fahrer_dokumente: {
        Row: {
          created_at: string
          fahrer_id: string
          filename: string
          filepath: string
          id: string
          type: string
          uploaded_at: string
          url: string
        }
        Insert: {
          created_at?: string
          fahrer_id: string
          filename: string
          filepath: string
          id?: string
          type: string
          uploaded_at?: string
          url: string
        }
        Update: {
          created_at?: string
          fahrer_id?: string
          filename?: string
          filepath?: string
          id?: string
          type?: string
          uploaded_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "fahrer_dokumente_fahrer_id_fkey"
            columns: ["fahrer_id"]
            isOneToOne: false
            referencedRelation: "fahrer_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fahrer_dokumente_fahrer_id_fkey"
            columns: ["fahrer_id"]
            isOneToOne: false
            referencedRelation: "fahrer_profile_admin_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      fahrer_profile: {
        Row: {
          adresse: string | null
          beschreibung: string | null
          created_at: string
          dokumente: Json | null
          email: string
          email_opt_out: boolean
          erfahrung_jahre: number | null
          fuehrerscheinklassen: string[] | null
          id: string
          nachname: string
          ort: string | null
          plz: string | null
          spezialisierungen: string[] | null
          status: string | null
          stundensatz: number | null
          telefon: string
          updated_at: string
          verfuegbare_regionen: string[] | null
          verfuegbarkeit: string | null
          vorname: string
        }
        Insert: {
          adresse?: string | null
          beschreibung?: string | null
          created_at?: string
          dokumente?: Json | null
          email: string
          email_opt_out?: boolean
          erfahrung_jahre?: number | null
          fuehrerscheinklassen?: string[] | null
          id?: string
          nachname: string
          ort?: string | null
          plz?: string | null
          spezialisierungen?: string[] | null
          status?: string | null
          stundensatz?: number | null
          telefon: string
          updated_at?: string
          verfuegbare_regionen?: string[] | null
          verfuegbarkeit?: string | null
          vorname: string
        }
        Update: {
          adresse?: string | null
          beschreibung?: string | null
          created_at?: string
          dokumente?: Json | null
          email?: string
          email_opt_out?: boolean
          erfahrung_jahre?: number | null
          fuehrerscheinklassen?: string[] | null
          id?: string
          nachname?: string
          ort?: string | null
          plz?: string | null
          spezialisierungen?: string[] | null
          status?: string | null
          stundensatz?: number | null
          telefon?: string
          updated_at?: string
          verfuegbare_regionen?: string[] | null
          verfuegbarkeit?: string | null
          vorname?: string
        }
        Relationships: []
      }
      job_mail_log: {
        Row: {
          created_at: string | null
          driver_snapshot: Json | null
          email: string
          error: string | null
          fahrer_id: string
          id: string
          job_request_id: string
          mail_template: string | null
          meta: Json | null
          reply_to: string | null
          status: string
          subject: string | null
        }
        Insert: {
          created_at?: string | null
          driver_snapshot?: Json | null
          email: string
          error?: string | null
          fahrer_id: string
          id?: string
          job_request_id: string
          mail_template?: string | null
          meta?: Json | null
          reply_to?: string | null
          status: string
          subject?: string | null
        }
        Update: {
          created_at?: string | null
          driver_snapshot?: Json | null
          email?: string
          error?: string | null
          fahrer_id?: string
          id?: string
          job_request_id?: string
          mail_template?: string | null
          meta?: Json | null
          reply_to?: string | null
          status?: string
          subject?: string | null
        }
        Relationships: []
      }
      job_requests: {
        Row: {
          besonderheiten: string | null
          company: string | null
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string
          einsatzort: string
          fahrzeugtyp: string
          fuehrerscheinklasse: string
          id: string
          nachricht: string
          status: string
          updated_at: string
          zeitraum: string
        }
        Insert: {
          besonderheiten?: string | null
          company?: string | null
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone: string
          einsatzort: string
          fahrzeugtyp: string
          fuehrerscheinklasse?: string
          id?: string
          nachricht: string
          status?: string
          updated_at?: string
          zeitraum: string
        }
        Update: {
          besonderheiten?: string | null
          company?: string | null
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          einsatzort?: string
          fahrzeugtyp?: string
          fuehrerscheinklasse?: string
          id?: string
          nachricht?: string
          status?: string
          updated_at?: string
          zeitraum?: string
        }
        Relationships: []
      }
      jobalarm_antworten: {
        Row: {
          antwort: string
          created_at: string
          fahrer_email: string
          id: string
          job_id: string
        }
        Insert: {
          antwort: string
          created_at?: string
          fahrer_email: string
          id?: string
          job_id: string
        }
        Update: {
          antwort?: string
          created_at?: string
          fahrer_email?: string
          id?: string
          job_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobalarm_antworten_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      jobalarm_fahrer: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      fahrer_profile_admin_summary: {
        Row: {
          created_at: string | null
          email_display: string | null
          erfahrung_jahre: number | null
          fuehrerscheinklassen: string[] | null
          id: string | null
          nachname: string | null
          ort: string | null
          spezialisierungen: string[] | null
          status: string | null
          stundensatz: number | null
          telefon_display: string | null
          updated_at: string | null
          verfuegbare_regionen: string[] | null
          vorname: string | null
        }
        Insert: {
          created_at?: string | null
          email_display?: never
          erfahrung_jahre?: number | null
          fuehrerscheinklassen?: string[] | null
          id?: string | null
          nachname?: string | null
          ort?: string | null
          spezialisierungen?: string[] | null
          status?: string | null
          stundensatz?: number | null
          telefon_display?: never
          updated_at?: string | null
          verfuegbare_regionen?: string[] | null
          vorname?: string | null
        }
        Update: {
          created_at?: string | null
          email_display?: never
          erfahrung_jahre?: number | null
          fuehrerscheinklassen?: string[] | null
          id?: string | null
          nachname?: string | null
          ort?: string | null
          spezialisierungen?: string[] | null
          status?: string | null
          stundensatz?: number | null
          telefon_display?: never
          updated_at?: string | null
          verfuegbare_regionen?: string[] | null
          vorname?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      is_admin: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      is_admin_user: {
        Args: { user_uuid?: string }
        Returns: boolean
      }
      log_job_mail: {
        Args: {
          p_driver_snapshot?: Json
          p_email: string
          p_error?: string
          p_fahrer_id: string
          p_job_request_id: string
          p_mail_template?: string
          p_meta?: Json
          p_reply_to?: string
          p_status: string
          p_subject?: string
        }
        Returns: undefined
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
