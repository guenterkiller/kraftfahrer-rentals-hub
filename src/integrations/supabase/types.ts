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
      admin_actions: {
        Row: {
          action: string
          admin_email: string
          assignment_id: string | null
          created_at: string
          id: string
          job_id: string
          note: string | null
        }
        Insert: {
          action: string
          admin_email: string
          assignment_id?: string | null
          created_at?: string
          id?: string
          job_id: string
          note?: string | null
        }
        Update: {
          action?: string
          admin_email?: string
          assignment_id?: string | null
          created_at?: string
          id?: string
          job_id?: string
          note?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_actions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "job_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_actions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_requests"
            referencedColumns: ["id"]
          },
        ]
      }
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
      admin_settings: {
        Row: {
          admin_email: string
        }
        Insert: {
          admin_email: string
        }
        Update: {
          admin_email?: string
        }
        Relationships: []
      }
      email_log: {
        Row: {
          assignment_id: string | null
          created_at: string
          error_message: string | null
          id: string
          job_id: string | null
          message_id: string | null
          recipient: string
          sent_at: string | null
          status: string
          subject: string | null
          template: string
        }
        Insert: {
          assignment_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          job_id?: string | null
          message_id?: string | null
          recipient: string
          sent_at?: string | null
          status?: string
          subject?: string | null
          template: string
        }
        Update: {
          assignment_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          job_id?: string | null
          message_id?: string | null
          recipient?: string
          sent_at?: string | null
          status?: string
          subject?: string | null
          template?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_log_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "job_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_log_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_requests"
            referencedColumns: ["id"]
          },
        ]
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
      feature_flags: {
        Row: {
          created_at: string
          description: string | null
          enabled: boolean
          flag_name: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          enabled?: boolean
          flag_name: string
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          enabled?: boolean
          flag_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      job_assignments: {
        Row: {
          accepted_at: string | null
          admin_note: string | null
          assigned_at: string
          cancelled_at: string | null
          cancelled_reason: string | null
          confirmed_at: string | null
          confirmed_by_admin: boolean
          created_at: string
          declined_at: string | null
          driver_id: string
          end_date: string | null
          id: string
          job_id: string
          rate_type: string
          rate_value: number
          start_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          admin_note?: string | null
          assigned_at?: string
          cancelled_at?: string | null
          cancelled_reason?: string | null
          confirmed_at?: string | null
          confirmed_by_admin?: boolean
          created_at?: string
          declined_at?: string | null
          driver_id: string
          end_date?: string | null
          id?: string
          job_id: string
          rate_type?: string
          rate_value: number
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          admin_note?: string | null
          assigned_at?: string
          cancelled_at?: string | null
          cancelled_reason?: string | null
          confirmed_at?: string | null
          confirmed_by_admin?: boolean
          created_at?: string
          declined_at?: string | null
          driver_id?: string
          end_date?: string | null
          id?: string
          job_id?: string
          rate_type?: string
          rate_value?: number
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_assignments_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "fahrer_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_assignments_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_requests"
            referencedColumns: ["id"]
          },
        ]
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
      mail_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          recipient: string
          success: boolean
          template: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          recipient: string
          success?: boolean
          template: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          recipient?: string
          success?: boolean
          template?: string
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
      [_ in never]: never
    }
    Functions: {
      admin_assign_driver: {
        Args: {
          _driver_id: string
          _end_date?: string
          _job_id: string
          _note?: string
          _rate_type?: string
          _rate_value?: number
          _start_date?: string
        }
        Returns: string
      }
      admin_cancel_assignment: {
        Args: { _assignment_id: string; _reason?: string }
        Returns: boolean
      }
      admin_confirm_assignment: {
        Args: { _assignment_id: string }
        Returns: boolean
      }
      get_fahrer_admin_summary: {
        Args: Record<PropertyKey, never>
        Returns: unknown[]
      }
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
