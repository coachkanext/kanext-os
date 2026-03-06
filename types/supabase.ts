/**
 * Supabase Database Types — KaNeXT OS
 *
 * Hand-written to match the schema created in Supabase SQL editor.
 * Replace with auto-generated types via `supabase gen types typescript` when CI is set up.
 */

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          mode: string;
          logo_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          mode?: string;
          logo_url?: string | null;
        };
        Update: Partial<Database['public']['Tables']['organizations']['Insert']>;
      };
      programs: {
        Row: {
          id: string;
          org_id: string;
          name: string;
          sport: string;
          gender: string;
          division: string | null;
          conference: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          name: string;
          sport?: string;
          gender?: string;
          division?: string | null;
          conference?: string | null;
        };
        Update: Partial<Database['public']['Tables']['programs']['Insert']>;
      };
      seasons: {
        Row: {
          id: string;
          program_id: string;
          label: string;
          start_date: string;
          end_date: string;
          is_current: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          program_id: string;
          label: string;
          start_date: string;
          end_date: string;
          is_current?: boolean;
        };
        Update: Partial<Database['public']['Tables']['seasons']['Insert']>;
      };
      memberships: {
        Row: {
          id: string;
          user_id: string;
          org_id: string;
          role_lens: string;
          display_name: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          org_id: string;
          role_lens?: string;
          display_name?: string | null;
        };
        Update: Partial<Database['public']['Tables']['memberships']['Insert']>;
      };
      players: {
        Row: {
          id: string;
          full_name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
        };
        Update: Partial<Database['public']['Tables']['players']['Insert']>;
      };
      roster_entries: {
        Row: {
          id: string;
          player_id: string;
          program_id: string;
          season_id: string;
          jersey_number: string | null;
          position: string | null;
          height: string | null;
          weight: number | null;
          class_year: string | null;
          status: string;
          scholarship_pct: number | null;
          nil_amount: number | null;
          gpa: number | null;
          notes: string | null;
          flagged: boolean;
          hometown: string | null;
          previous_school: string | null;
          headshot_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          player_id: string;
          program_id: string;
          season_id: string;
          jersey_number?: string | null;
          position?: string | null;
          height?: string | null;
          weight?: number | null;
          class_year?: string | null;
          status?: string;
          scholarship_pct?: number | null;
          nil_amount?: number | null;
          gpa?: number | null;
          notes?: string | null;
          flagged?: boolean;
          hometown?: string | null;
          previous_school?: string | null;
          headshot_url?: string | null;
        };
        Update: Partial<Database['public']['Tables']['roster_entries']['Insert']>;
      };
      player_ratings: {
        Row: {
          id: string;
          roster_entry_id: string;
          kr: number | null;
          off_kr: number | null;
          def_kr: number | null;
          archetype: string | null;
          shooting: number | null;
          finishing: number | null;
          playmaking: number | null;
          on_ball_defense: number | null;
          team_defense: number | null;
          rebounding: number | null;
          physical: number | null;
          ppg: number | null;
          rpg: number | null;
          apg: number | null;
          spg: number | null;
          bpg: number | null;
          fg_pct: number | null;
          three_pct: number | null;
          ft_pct: number | null;
          gp: number | null;
          minutes: number | null;
          usage: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          roster_entry_id: string;
          kr?: number | null;
          off_kr?: number | null;
          def_kr?: number | null;
          archetype?: string | null;
          shooting?: number | null;
          finishing?: number | null;
          playmaking?: number | null;
          on_ball_defense?: number | null;
          team_defense?: number | null;
          rebounding?: number | null;
          physical?: number | null;
          ppg?: number | null;
          rpg?: number | null;
          apg?: number | null;
          spg?: number | null;
          bpg?: number | null;
          fg_pct?: number | null;
          three_pct?: number | null;
          ft_pct?: number | null;
          gp?: number | null;
          minutes?: number | null;
          usage?: number | null;
        };
        Update: Partial<Database['public']['Tables']['player_ratings']['Insert']>;
      };
      coaches: {
        Row: {
          id: string;
          program_id: string;
          full_name: string;
          title: string;
          bio: string | null;
          offensive_system: string | null;
          defensive_system: string | null;
          tendencies: string | null;
          headshot_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          program_id: string;
          full_name: string;
          title: string;
          bio?: string | null;
          offensive_system?: string | null;
          defensive_system?: string | null;
          tendencies?: string | null;
          headshot_url?: string | null;
        };
        Update: Partial<Database['public']['Tables']['coaches']['Insert']>;
      };
      depth_chart: {
        Row: {
          id: string;
          program_id: string;
          season_id: string;
          roster_entry_id: string;
          group_type: string;
          group_name: string;
          slot: string | null;
          sort_order: number;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          program_id: string;
          season_id: string;
          roster_entry_id: string;
          group_type: string;
          group_name: string;
          slot?: string | null;
          sort_order?: number;
          status?: string;
        };
        Update: Partial<Database['public']['Tables']['depth_chart']['Insert']>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};

// Convenience row types
export type OrganizationRow = Database['public']['Tables']['organizations']['Row'];
export type ProgramRow = Database['public']['Tables']['programs']['Row'];
export type SeasonRow = Database['public']['Tables']['seasons']['Row'];
export type MembershipRow = Database['public']['Tables']['memberships']['Row'];
export type PlayerRow = Database['public']['Tables']['players']['Row'];
export type RosterEntryRow = Database['public']['Tables']['roster_entries']['Row'];
export type PlayerRatingRow = Database['public']['Tables']['player_ratings']['Row'];
export type CoachRow = Database['public']['Tables']['coaches']['Row'];
export type DepthChartRow = Database['public']['Tables']['depth_chart']['Row'];
