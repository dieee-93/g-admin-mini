Need to install the following packages:
supabase@2.75.5
Ok to proceed? (y) 
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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      achievement_definitions: {
        Row: {
          conditions: Json
          created_at: string | null
          description: string
          domain: string
          icon: string
          id: string
          is_active: boolean | null
          name: string
          points: number | null
          tier: string | null
          trigger_event: string
          type: string
          updated_at: string | null
        }
        Insert: {
          conditions: Json
          created_at?: string | null
          description: string
          domain: string
          icon: string
          id: string
          is_active?: boolean | null
          name: string
          points?: number | null
          tier?: string | null
          trigger_event: string
          type?: string
          updated_at?: string | null
        }
        Update: {
          conditions?: Json
          created_at?: string | null
          description?: string
          domain?: string
          icon?: string
          id?: string
          is_active?: boolean | null
          name?: string
          points?: number | null
          tier?: string | null
          trigger_event?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      afip_configuration: {
        Row: {
          business_name: string
          certificate_path: string | null
          created_at: string | null
          environment: string | null
          id: string
          is_active: boolean | null
          last_used_number_a: number | null
          last_used_number_b: number | null
          last_used_number_c: number | null
          location_id: string | null
          private_key_path: string | null
          punto_venta: number
          tax_id: string
          updated_at: string | null
        }
        Insert: {
          business_name: string
          certificate_path?: string | null
          created_at?: string | null
          environment?: string | null
          id?: string
          is_active?: boolean | null
          last_used_number_a?: number | null
          last_used_number_b?: number | null
          last_used_number_c?: number | null
          location_id?: string | null
          private_key_path?: string | null
          punto_venta?: number
          tax_id: string
          updated_at?: string | null
        }
        Update: {
          business_name?: string
          certificate_path?: string | null
          created_at?: string | null
          environment?: string | null
          id?: string
          is_active?: boolean | null
          last_used_number_a?: number | null
          last_used_number_b?: number | null
          last_used_number_c?: number | null
          location_id?: string | null
          private_key_path?: string | null
          punto_venta?: number
          tax_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "afip_configuration_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: true
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      afip_configurations: {
        Row: {
          certificate_path: string | null
          created_at: string | null
          cuit: string
          environment: string | null
          id: string
          is_active: boolean | null
          location_id: string
          private_key_path: string | null
          punto_venta: number
          ultimo_comprobante: number | null
          updated_at: string | null
        }
        Insert: {
          certificate_path?: string | null
          created_at?: string | null
          cuit: string
          environment?: string | null
          id?: string
          is_active?: boolean | null
          location_id: string
          private_key_path?: string | null
          punto_venta: number
          ultimo_comprobante?: number | null
          updated_at?: string | null
        }
        Update: {
          certificate_path?: string | null
          created_at?: string | null
          cuit?: string
          environment?: string | null
          id?: string
          is_active?: boolean | null
          location_id?: string
          private_key_path?: string | null
          punto_venta?: number
          ultimo_comprobante?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "afip_configurations_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: true
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          auto_expire_ms: number | null
          confidence: number | null
          context: string
          created_at: string | null
          description: string | null
          escalation_level: number | null
          id: string
          intelligence_level: string
          is_recurring: boolean | null
          last_occurrence: string | null
          metadata: Json | null
          model_version: string | null
          occurrence_count: number | null
          persistent: boolean | null
          predicted_date: string | null
          recurrence_pattern: string | null
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          status: string
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          auto_expire_ms?: number | null
          confidence?: number | null
          context: string
          created_at?: string | null
          description?: string | null
          escalation_level?: number | null
          id?: string
          intelligence_level?: string
          is_recurring?: boolean | null
          last_occurrence?: string | null
          metadata?: Json | null
          model_version?: string | null
          occurrence_count?: number | null
          persistent?: boolean | null
          predicted_date?: string | null
          recurrence_pattern?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity: string
          status?: string
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          auto_expire_ms?: number | null
          confidence?: number | null
          context?: string
          created_at?: string | null
          description?: string | null
          escalation_level?: number | null
          id?: string
          intelligence_level?: string
          is_recurring?: boolean | null
          last_occurrence?: string | null
          metadata?: Json | null
          model_version?: string | null
          occurrence_count?: number | null
          persistent?: boolean | null
          predicted_date?: string | null
          recurrence_pattern?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          status?: string
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      appointment_slots: {
        Row: {
          appointment_id: string | null
          created_at: string | null
          date: string
          end_time: string
          id: string
          staff_id: string
          start_time: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string | null
          date: string
          end_time: string
          id?: string
          staff_id: string
          start_time: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          appointment_id?: string | null
          created_at?: string | null
          date?: string
          end_time?: string
          id?: string
          staff_id?: string
          start_time?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointment_slots_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_slots_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          appointment_date: string
          booking_source: string
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          confirmation_sent_at: string | null
          created_at: string | null
          created_by: string | null
          customer_email: string | null
          customer_id: string | null
          customer_name: string
          customer_phone: string | null
          end_time: string
          id: string
          notes: string | null
          package_id: string | null
          provider_id: string | null
          provider_name: string | null
          reminder_sent_at: string | null
          service_duration_minutes: number
          service_id: string | null
          service_name: string
          start_time: string
          status: string
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          appointment_date: string
          booking_source: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          confirmation_sent_at?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name: string
          customer_phone?: string | null
          end_time: string
          id?: string
          notes?: string | null
          package_id?: string | null
          provider_id?: string | null
          provider_name?: string | null
          reminder_sent_at?: string | null
          service_duration_minutes: number
          service_id?: string | null
          service_name: string
          start_time: string
          status?: string
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          appointment_date?: string
          booking_source?: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          confirmation_sent_at?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string | null
          end_time?: string
          id?: string
          notes?: string | null
          package_id?: string | null
          provider_id?: string | null
          provider_name?: string | null
          reminder_sent_at?: string | null
          service_duration_minutes?: number
          service_id?: string | null
          service_name?: string
          start_time?: string
          status?: string
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_appointments_package"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "service_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_steps: {
        Row: {
          approved_at: string | null
          approver_id: string | null
          comments: string | null
          created_at: string | null
          id: string
          level: number
          status: string
          workflow_id: string | null
        }
        Insert: {
          approved_at?: string | null
          approver_id?: string | null
          comments?: string | null
          created_at?: string | null
          id?: string
          level: number
          status?: string
          workflow_id?: string | null
        }
        Update: {
          approved_at?: string | null
          approver_id?: string | null
          comments?: string | null
          created_at?: string | null
          id?: string
          level?: number
          status?: string
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "approval_steps_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "approval_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_workflows: {
        Row: {
          created_at: string | null
          current_level: number
          entity_id: string
          entity_type: string
          id: string
          required_level: number
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_level?: number
          entity_id: string
          entity_type: string
          id?: string
          required_level: number
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_level?: number
          entity_id?: string
          entity_type?: string
          id?: string
          required_level?: number
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      assets_archived_20260205: {
        Row: {
          asset_code: string | null
          assigned_to: string | null
          category: string | null
          condition: string | null
          created_at: string | null
          created_by: string | null
          current_rental_id: string | null
          current_value: number | null
          currently_rented: boolean | null
          custom_fields: Json | null
          description: string | null
          id: string | null
          is_rentable: boolean | null
          last_maintenance_date: string | null
          location: string | null
          maintenance_interval_days: number | null
          name: string | null
          next_maintenance_date: string | null
          notes: string | null
          purchase_date: string | null
          purchase_price: number | null
          rental_price_per_day: number | null
          rental_price_per_hour: number | null
          status: string | null
          tags: string[] | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          asset_code?: string | null
          assigned_to?: string | null
          category?: string | null
          condition?: string | null
          created_at?: string | null
          created_by?: string | null
          current_rental_id?: string | null
          current_value?: number | null
          currently_rented?: boolean | null
          custom_fields?: Json | null
          description?: string | null
          id?: string | null
          is_rentable?: boolean | null
          last_maintenance_date?: string | null
          location?: string | null
          maintenance_interval_days?: number | null
          name?: string | null
          next_maintenance_date?: string | null
          notes?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          rental_price_per_day?: number | null
          rental_price_per_hour?: number | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          asset_code?: string | null
          assigned_to?: string | null
          category?: string | null
          condition?: string | null
          created_at?: string | null
          created_by?: string | null
          current_rental_id?: string | null
          current_value?: number | null
          currently_rented?: boolean | null
          custom_fields?: Json | null
          description?: string | null
          id?: string | null
          is_rentable?: boolean | null
          last_maintenance_date?: string | null
          location?: string | null
          maintenance_interval_days?: number | null
          name?: string | null
          next_maintenance_date?: string | null
          notes?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          rental_price_per_day?: number | null
          rental_price_per_hour?: number | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      async_update_queue: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          priority: number | null
          processed_at: string | null
          update_type: string
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          priority?: number | null
          processed_at?: string | null
          update_type: string
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          priority?: number | null
          processed_at?: string | null
          update_type?: string
        }
        Relationships: []
      }
      availability_exceptions: {
        Row: {
          created_at: string | null
          custom_end_time: string | null
          custom_start_time: string | null
          exception_date: string
          id: string
          is_closed: boolean | null
          location_id: string | null
          reason: string | null
          staff_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          custom_end_time?: string | null
          custom_start_time?: string | null
          exception_date: string
          id?: string
          is_closed?: boolean | null
          location_id?: string | null
          reason?: string | null
          staff_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          custom_end_time?: string | null
          custom_start_time?: string | null
          exception_date?: string
          id?: string
          is_closed?: boolean | null
          location_id?: string | null
          reason?: string | null
          staff_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "availability_exceptions_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availability_exceptions_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      availability_rules: {
        Row: {
          buffer_minutes: number | null
          cancellation_fee_percentage: number | null
          cancellation_policy: string | null
          created_at: string | null
          day_of_week: number
          end_time: string
          id: string
          is_active: boolean | null
          location_id: string | null
          max_advance_days: number | null
          min_advance_hours: number | null
          slot_duration_minutes: number | null
          start_time: string
          updated_at: string | null
        }
        Insert: {
          buffer_minutes?: number | null
          cancellation_fee_percentage?: number | null
          cancellation_policy?: string | null
          created_at?: string | null
          day_of_week: number
          end_time: string
          id?: string
          is_active?: boolean | null
          location_id?: string | null
          max_advance_days?: number | null
          min_advance_hours?: number | null
          slot_duration_minutes?: number | null
          start_time: string
          updated_at?: string | null
        }
        Update: {
          buffer_minutes?: number | null
          cancellation_fee_percentage?: number | null
          cancellation_policy?: string | null
          created_at?: string | null
          day_of_week?: number
          end_time?: string
          id?: string
          is_active?: boolean | null
          location_id?: string | null
          max_advance_days?: number | null
          min_advance_hours?: number | null
          slot_duration_minutes?: number | null
          start_time?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "availability_rules_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      b2b_contracts: {
        Row: {
          contract_number: string
          corporate_account_id: string | null
          created_at: string | null
          created_by: string | null
          customer_id: string | null
          end_date: string | null
          id: string
          minimum_order_quantity: number | null
          minimum_order_value: number | null
          payment_terms: number
          pricing_tier_id: string | null
          renewal_terms: string | null
          signature_date: string | null
          signed_by_customer: string | null
          signed_by_supplier: string | null
          start_date: string
          status: string
          terms_and_conditions: string
          type: string
          updated_at: string | null
        }
        Insert: {
          contract_number: string
          corporate_account_id?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          end_date?: string | null
          id?: string
          minimum_order_quantity?: number | null
          minimum_order_value?: number | null
          payment_terms?: number
          pricing_tier_id?: string | null
          renewal_terms?: string | null
          signature_date?: string | null
          signed_by_customer?: string | null
          signed_by_supplier?: string | null
          start_date: string
          status?: string
          terms_and_conditions: string
          type: string
          updated_at?: string | null
        }
        Update: {
          contract_number?: string
          corporate_account_id?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          end_date?: string | null
          id?: string
          minimum_order_quantity?: number | null
          minimum_order_value?: number | null
          payment_terms?: number
          pricing_tier_id?: string | null
          renewal_terms?: string | null
          signature_date?: string | null
          signed_by_customer?: string | null
          signed_by_supplier?: string | null
          start_date?: string
          status?: string
          terms_and_conditions?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "b2b_contracts_corporate_account_id_fkey"
            columns: ["corporate_account_id"]
            isOneToOne: false
            referencedRelation: "corporate_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "b2b_contracts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      b2b_quote_items: {
        Row: {
          created_at: string | null
          discount_percentage: number | null
          id: string
          line_total: number
          product_id: string | null
          product_name: string
          quantity: number
          quote_id: string | null
          tiered_price: number | null
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          discount_percentage?: number | null
          id?: string
          line_total: number
          product_id?: string | null
          product_name: string
          quantity: number
          quote_id?: string | null
          tiered_price?: number | null
          unit_price: number
        }
        Update: {
          created_at?: string | null
          discount_percentage?: number | null
          id?: string
          line_total?: number
          product_id?: string | null
          product_name?: string
          quantity?: number
          quote_id?: string | null
          tiered_price?: number | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "b2b_quote_items_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "b2b_quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      b2b_quotes: {
        Row: {
          approved_by: string | null
          corporate_account_id: string | null
          created_at: string | null
          created_by: string | null
          customer_id: string | null
          discount_amount: number
          id: string
          notes: string | null
          quote_number: string
          status: string
          subtotal: number
          tax_amount: number
          terms_and_conditions: string | null
          total_amount: number
          updated_at: string | null
          valid_until: string
        }
        Insert: {
          approved_by?: string | null
          corporate_account_id?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          discount_amount?: number
          id?: string
          notes?: string | null
          quote_number: string
          status?: string
          subtotal?: number
          tax_amount?: number
          terms_and_conditions?: string | null
          total_amount?: number
          updated_at?: string | null
          valid_until: string
        }
        Update: {
          approved_by?: string | null
          corporate_account_id?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          discount_amount?: number
          id?: string
          notes?: string | null
          quote_number?: string
          status?: string
          subtotal?: number
          tax_amount?: number
          terms_and_conditions?: string | null
          total_amount?: number
          updated_at?: string | null
          valid_until?: string
        }
        Relationships: [
          {
            foreignKeyName: "b2b_quotes_corporate_account_id_fkey"
            columns: ["corporate_account_id"]
            isOneToOne: false
            referencedRelation: "corporate_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "b2b_quotes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      bill_splits: {
        Row: {
          amount: number
          assigned_items: string[] | null
          created_at: string
          custom_percentage: number | null
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          id: string
          paid_at: string | null
          payment_method_id: string | null
          split_bill_id: string
          status: string | null
          tip_amount: number
        }
        Insert: {
          amount: number
          assigned_items?: string[] | null
          created_at?: string
          custom_percentage?: number | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          paid_at?: string | null
          payment_method_id?: string | null
          split_bill_id: string
          status?: string | null
          tip_amount?: number
        }
        Update: {
          amount?: number
          assigned_items?: string[] | null
          created_at?: string
          custom_percentage?: number | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          paid_at?: string | null
          payment_method_id?: string | null
          split_bill_id?: string
          status?: string | null
          tip_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "bill_splits_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bill_splits_split_bill_id_fkey"
            columns: ["split_bill_id"]
            isOneToOne: false
            referencedRelation: "split_bills"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_cycles: {
        Row: {
          amount: number
          created_at: string
          cycle_number: number
          due_date: string
          end_date: string
          id: string
          invoice_id: string | null
          start_date: string
          status: string
          subscription_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          cycle_number: number
          due_date: string
          end_date: string
          id?: string
          invoice_id?: string | null
          start_date: string
          status?: string
          subscription_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          cycle_number?: number
          due_date?: string
          end_date?: string
          id?: string
          invoice_id?: string | null
          start_date?: string
          status?: string
          subscription_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_cycles_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_billing_cycles_invoice_id"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      brands: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      business_profiles: {
        Row: {
          active_capabilities: Json
          auto_resolved_capabilities: Json | null
          business_name: string
          business_structure: string | null
          business_type: string | null
          completed_milestones: Json
          computed_configuration: Json | null
          country: string | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          email: string | null
          id: string
          is_first_time_dashboard: boolean | null
          onboarding_step: number | null
          organization_id: string | null
          phone: string | null
          selected_activities: Json
          selected_infrastructure: Json
          setup_completed: boolean | null
          setup_completed_at: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          active_capabilities?: Json
          auto_resolved_capabilities?: Json | null
          business_name: string
          business_structure?: string | null
          business_type?: string | null
          completed_milestones?: Json
          computed_configuration?: Json | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          email?: string | null
          id?: string
          is_first_time_dashboard?: boolean | null
          onboarding_step?: number | null
          organization_id?: string | null
          phone?: string | null
          selected_activities?: Json
          selected_infrastructure?: Json
          setup_completed?: boolean | null
          setup_completed_at?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          active_capabilities?: Json
          auto_resolved_capabilities?: Json | null
          business_name?: string
          business_structure?: string | null
          business_type?: string | null
          completed_milestones?: Json
          computed_configuration?: Json | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          email?: string | null
          id?: string
          is_first_time_dashboard?: boolean | null
          onboarding_step?: number | null
          organization_id?: string | null
          phone?: string | null
          selected_activities?: Json
          selected_infrastructure?: Json
          setup_completed?: boolean | null
          setup_completed_at?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      carts: {
        Row: {
          created_at: string | null
          customer_id: string | null
          expires_at: string | null
          id: string
          items: Json
          location_id: string | null
          session_id: string | null
          subtotal: number | null
          tax: number | null
          total: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          expires_at?: string | null
          id?: string
          items?: Json
          location_id?: string | null
          session_id?: string | null
          subtotal?: number | null
          tax?: number | null
          total?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          expires_at?: string | null
          id?: string
          items?: Json
          location_id?: string | null
          session_id?: string | null
          subtotal?: number | null
          tax?: number | null
          total?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "carts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carts_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      cash_sessions: {
        Row: {
          actual_cash: number | null
          approved_by: string | null
          audit_notes: string | null
          cash_drops: number | null
          cash_in: number | null
          cash_out: number | null
          cash_refunds: number | null
          cash_sales: number | null
          closed_at: string | null
          closed_by: string | null
          closing_notes: string | null
          created_at: string
          employee_id: string | null
          expected_cash: number | null
          id: string
          location_id: string | null
          money_location_id: string
          net_cash: number | null
          opened_at: string
          opened_by: string
          opening_notes: string | null
          shift_id: string | null
          starting_cash: number
          status: string
          updated_at: string
          variance: number | null
        }
        Insert: {
          actual_cash?: number | null
          approved_by?: string | null
          audit_notes?: string | null
          cash_drops?: number | null
          cash_in?: number | null
          cash_out?: number | null
          cash_refunds?: number | null
          cash_sales?: number | null
          closed_at?: string | null
          closed_by?: string | null
          closing_notes?: string | null
          created_at?: string
          employee_id?: string | null
          expected_cash?: number | null
          id?: string
          location_id?: string | null
          money_location_id: string
          net_cash?: number | null
          opened_at?: string
          opened_by: string
          opening_notes?: string | null
          shift_id?: string | null
          starting_cash: number
          status?: string
          updated_at?: string
          variance?: number | null
        }
        Update: {
          actual_cash?: number | null
          approved_by?: string | null
          audit_notes?: string | null
          cash_drops?: number | null
          cash_in?: number | null
          cash_out?: number | null
          cash_refunds?: number | null
          cash_sales?: number | null
          closed_at?: string | null
          closed_by?: string | null
          closing_notes?: string | null
          created_at?: string
          employee_id?: string | null
          expected_cash?: number | null
          id?: string
          location_id?: string | null
          money_location_id?: string
          net_cash?: number | null
          opened_at?: string
          opened_by?: string
          opening_notes?: string | null
          shift_id?: string | null
          starting_cash?: number
          status?: string
          updated_at?: string
          variance?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cash_sessions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_sessions_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_sessions_money_location_id_fkey"
            columns: ["money_location_id"]
            isOneToOne: false
            referencedRelation: "money_location_balances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_sessions_money_location_id_fkey"
            columns: ["money_location_id"]
            isOneToOne: false
            referencedRelation: "money_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_sessions_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "operational_shifts"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_products: {
        Row: {
          catalog_id: string
          created_at: string | null
          is_featured: boolean | null
          product_id: string
          sort_order: number | null
        }
        Insert: {
          catalog_id: string
          created_at?: string | null
          is_featured?: boolean | null
          product_id: string
          sort_order?: number | null
        }
        Update: {
          catalog_id?: string
          created_at?: string | null
          is_featured?: boolean | null
          product_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "catalog_products_catalog_id_fkey"
            columns: ["catalog_id"]
            isOneToOne: false
            referencedRelation: "catalogs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalog_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      catalogs: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          filters: Json | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          name: string
          type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          filters?: Json | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name: string
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          filters?: Json | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      chart_of_accounts: {
        Row: {
          account_type: string
          allow_transactions: boolean | null
          code: string
          created_at: string
          created_by: string | null
          currency: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_group: boolean | null
          location_id: string | null
          name: string
          normal_balance: string
          parent_id: string | null
          sub_type: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          account_type: string
          allow_transactions?: boolean | null
          code: string
          created_at?: string
          created_by?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_group?: boolean | null
          location_id?: string | null
          name: string
          normal_balance: string
          parent_id?: string | null
          sub_type?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          account_type?: string
          allow_transactions?: boolean | null
          code?: string
          created_at?: string
          created_by?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_group?: boolean | null
          location_id?: string | null
          name?: string
          normal_balance?: string
          parent_id?: string | null
          sub_type?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chart_of_accounts_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chart_of_accounts_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "account_balances"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "chart_of_accounts_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      context_additional_costs: {
        Row: {
          amount: number | null
          amount_per_item: number | null
          context_id: string
          cost_category: string | null
          cost_type: string
          created_at: string | null
          id: string
          include_in_cost: boolean | null
          include_in_price: boolean | null
          is_active: boolean | null
          max_amount: number | null
          min_order_value: number | null
          name: string
          percentage: number | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          amount?: number | null
          amount_per_item?: number | null
          context_id: string
          cost_category?: string | null
          cost_type: string
          created_at?: string | null
          id?: string
          include_in_cost?: boolean | null
          include_in_price?: boolean | null
          is_active?: boolean | null
          max_amount?: number | null
          min_order_value?: number | null
          name: string
          percentage?: number | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          amount?: number | null
          amount_per_item?: number | null
          context_id?: string
          cost_category?: string | null
          cost_type?: string
          created_at?: string | null
          id?: string
          include_in_cost?: boolean | null
          include_in_price?: boolean | null
          is_active?: boolean | null
          max_amount?: number | null
          min_order_value?: number | null
          name?: string
          percentage?: number | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "context_additional_costs_context_id_fkey"
            columns: ["context_id"]
            isOneToOne: false
            referencedRelation: "service_contexts"
            referencedColumns: ["id"]
          },
        ]
      }
      context_staff_requirements: {
        Row: {
          context_id: string
          count: number
          created_at: string | null
          hourly_rate_override: number | null
          id: string
          loaded_factor_override: number | null
          minutes_per_unit: number
          per: string
          role_id: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          context_id: string
          count?: number
          created_at?: string | null
          hourly_rate_override?: number | null
          id?: string
          loaded_factor_override?: number | null
          minutes_per_unit: number
          per?: string
          role_id: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          context_id?: string
          count?: number
          created_at?: string | null
          hourly_rate_override?: number | null
          id?: string
          loaded_factor_override?: number | null
          minutes_per_unit?: number
          per?: string
          role_id?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "context_staff_requirements_context_id_fkey"
            columns: ["context_id"]
            isOneToOne: false
            referencedRelation: "service_contexts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "context_staff_requirements_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "job_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      corporate_accounts: {
        Row: {
          created_at: string | null
          credit_limit: number | null
          current_balance: number | null
          customer_id: string | null
          id: string
          is_active: boolean | null
          payment_terms: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          credit_limit?: number | null
          current_balance?: number | null
          customer_id?: string | null
          id?: string
          is_active?: boolean | null
          payment_terms?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          credit_limit?: number | null
          current_balance?: number | null
          customer_id?: string | null
          id?: string
          is_active?: boolean | null
          payment_terms?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "corporate_accounts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_addresses: {
        Row: {
          address_line_1: string
          address_line_2: string | null
          city: string | null
          country: string | null
          created_at: string | null
          customer_id: string
          delivery_instructions: string | null
          formatted_address: string | null
          id: string
          is_default: boolean | null
          is_verified: boolean | null
          label: string
          last_used_at: string | null
          latitude: number | null
          longitude: number | null
          postal_code: string | null
          state: string | null
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          address_line_1: string
          address_line_2?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          customer_id: string
          delivery_instructions?: string | null
          formatted_address?: string | null
          id?: string
          is_default?: boolean | null
          is_verified?: boolean | null
          label?: string
          last_used_at?: string | null
          latitude?: number | null
          longitude?: number | null
          postal_code?: string | null
          state?: string | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          address_line_1?: string
          address_line_2?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          customer_id?: string
          delivery_instructions?: string | null
          formatted_address?: string | null
          id?: string
          is_default?: boolean | null
          is_verified?: boolean | null
          label?: string
          last_used_at?: string | null
          latitude?: number | null
          longitude?: number | null
          postal_code?: string | null
          state?: string | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_addresses_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_packages: {
        Row: {
          amount_paid: number
          created_at: string | null
          customer_id: string
          expires_at: string | null
          id: string
          package_id: string
          payment_status: string
          purchased_at: string | null
          purchased_by: string | null
          sessions_remaining: number
          sessions_used: number | null
          status: string
          updated_at: string | null
        }
        Insert: {
          amount_paid: number
          created_at?: string | null
          customer_id: string
          expires_at?: string | null
          id?: string
          package_id: string
          payment_status?: string
          purchased_at?: string | null
          purchased_by?: string | null
          sessions_remaining: number
          sessions_used?: number | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          amount_paid?: number
          created_at?: string | null
          customer_id?: string
          expires_at?: string | null
          id?: string
          package_id?: string
          payment_status?: string
          purchased_at?: string | null
          purchased_by?: string | null
          sessions_remaining?: number
          sessions_used?: number | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_packages_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_packages_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "service_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_rfm_profiles: {
        Row: {
          avg_order_value: number | null
          churn_risk: string | null
          created_at: string | null
          customer_id: number | null
          frequency_count: number | null
          id: number
          is_vip: boolean | null
          last_purchase_date: string | null
          lifetime_value: number | null
          loyalty_tier: string | null
          recency_days: number | null
          rfm_segment: string | null
          updated_at: string | null
          visit_frequency: number | null
        }
        Insert: {
          avg_order_value?: number | null
          churn_risk?: string | null
          created_at?: string | null
          customer_id?: number | null
          frequency_count?: number | null
          id?: never
          is_vip?: boolean | null
          last_purchase_date?: string | null
          lifetime_value?: number | null
          loyalty_tier?: string | null
          recency_days?: number | null
          rfm_segment?: string | null
          updated_at?: string | null
          visit_frequency?: number | null
        }
        Update: {
          avg_order_value?: number | null
          churn_risk?: string | null
          created_at?: string | null
          customer_id?: number | null
          frequency_count?: number | null
          id?: never
          is_vip?: boolean | null
          last_purchase_date?: string | null
          lifetime_value?: number | null
          loyalty_tier?: string | null
          recency_days?: number | null
          rfm_segment?: string | null
          updated_at?: string | null
          visit_frequency?: number | null
        }
        Relationships: []
      }
      customer_rfm_update_queue: {
        Row: {
          customer_id: string
          queued_at: string | null
        }
        Insert: {
          customer_id: string
          queued_at?: string | null
        }
        Update: {
          customer_id?: string
          queued_at?: string | null
        }
        Relationships: []
      }
      customer_update_log: {
        Row: {
          id: number
          record_id: string
          table_name: string
          updated_at: string | null
          updated_columns: Json | null
        }
        Insert: {
          id?: never
          record_id: string
          table_name: string
          updated_at?: string | null
          updated_columns?: Json | null
        }
        Update: {
          id?: never
          record_id?: string
          table_name?: string
          updated_at?: string | null
          updated_columns?: Json | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          created_at: string | null
          created_via: string | null
          dni: string | null
          email: string | null
          email_verification_token: string | null
          email_verified: boolean | null
          id: string
          is_active: boolean
          mobile: string | null
          name: string
          notes: string | null
          password_hash: string | null
          password_reset_expires: string | null
          password_reset_token: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_via?: string | null
          dni?: string | null
          email?: string | null
          email_verification_token?: string | null
          email_verified?: boolean | null
          id?: string
          is_active?: boolean
          mobile?: string | null
          name: string
          notes?: string | null
          password_hash?: string | null
          password_reset_expires?: string | null
          password_reset_token?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_via?: string | null
          dni?: string | null
          email?: string | null
          email_verification_token?: string | null
          email_verified?: boolean | null
          id?: string
          is_active?: boolean
          mobile?: string | null
          name?: string
          notes?: string | null
          password_hash?: string | null
          password_reset_expires?: string | null
          password_reset_token?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      daily_analytics: {
        Row: {
          average_order_value: number
          average_service_time: unknown
          created_at: string
          customer_satisfaction_avg: number
          date: string
          id: string
          refund_amount: number
          table_turnover_rate: number
          total_covers: number
          total_discounts: number
          total_orders: number
          total_revenue: number
          total_tips: number
        }
        Insert: {
          average_order_value?: number
          average_service_time?: unknown
          created_at?: string
          customer_satisfaction_avg?: number
          date: string
          id?: string
          refund_amount?: number
          table_turnover_rate?: number
          total_covers?: number
          total_discounts?: number
          total_orders?: number
          total_revenue?: number
          total_tips?: number
        }
        Update: {
          average_order_value?: number
          average_service_time?: unknown
          created_at?: string
          customer_satisfaction_avg?: number
          date?: string
          id?: string
          refund_amount?: number
          table_turnover_rate?: number
          total_covers?: number
          total_discounts?: number
          total_orders?: number
          total_revenue?: number
          total_tips?: number
        }
        Relationships: []
      }
      deliveries: {
        Row: {
          created_at: string | null
          delivery_address: string
          delivery_zone: string | null
          distance_km: number | null
          driver_id: string | null
          driver_name: string | null
          estimated_time_minutes: number | null
          id: string
          order_id: string
          scheduled_date: string
          scheduled_end_time: string
          scheduled_start_time: string
          status: string | null
          tracking_url: string | null
          updated_at: string | null
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string | null
          delivery_address: string
          delivery_zone?: string | null
          distance_km?: number | null
          driver_id?: string | null
          driver_name?: string | null
          estimated_time_minutes?: number | null
          id?: string
          order_id: string
          scheduled_date: string
          scheduled_end_time: string
          scheduled_start_time: string
          status?: string | null
          tracking_url?: string | null
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string | null
          delivery_address?: string
          delivery_zone?: string | null
          distance_km?: number | null
          driver_id?: string | null
          driver_name?: string | null
          estimated_time_minutes?: number | null
          id?: string
          order_id?: string
          scheduled_date?: string
          scheduled_end_time?: string
          scheduled_start_time?: string
          status?: string | null
          tracking_url?: string | null
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deliveries_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_assignments: {
        Row: {
          accepted_at: string | null
          actual_distance_km: number | null
          actual_duration_minutes: number | null
          arrived_at: string | null
          assigned_at: string
          created_at: string
          customer_feedback: string | null
          customer_rating: number | null
          deleted_at: string | null
          delivered_at: string | null
          driver_id: string
          estimated_distance_km: number | null
          estimated_duration_minutes: number | null
          failed_at: string | null
          failure_notes: string | null
          failure_reason: string | null
          id: string
          in_transit_at: string | null
          metadata: Json | null
          notes: string | null
          on_time: boolean | null
          picked_up_at: string | null
          queue_id: string
          status: string
          updated_at: string | null
          zone_id: string | null
        }
        Insert: {
          accepted_at?: string | null
          actual_distance_km?: number | null
          actual_duration_minutes?: number | null
          arrived_at?: string | null
          assigned_at?: string
          created_at?: string
          customer_feedback?: string | null
          customer_rating?: number | null
          deleted_at?: string | null
          delivered_at?: string | null
          driver_id: string
          estimated_distance_km?: number | null
          estimated_duration_minutes?: number | null
          failed_at?: string | null
          failure_notes?: string | null
          failure_reason?: string | null
          id?: string
          in_transit_at?: string | null
          metadata?: Json | null
          notes?: string | null
          on_time?: boolean | null
          picked_up_at?: string | null
          queue_id: string
          status?: string
          updated_at?: string | null
          zone_id?: string | null
        }
        Update: {
          accepted_at?: string | null
          actual_distance_km?: number | null
          actual_duration_minutes?: number | null
          arrived_at?: string | null
          assigned_at?: string
          created_at?: string
          customer_feedback?: string | null
          customer_rating?: number | null
          deleted_at?: string | null
          delivered_at?: string | null
          driver_id?: string
          estimated_distance_km?: number | null
          estimated_duration_minutes?: number | null
          failed_at?: string | null
          failure_notes?: string | null
          failure_reason?: string | null
          id?: string
          in_transit_at?: string | null
          metadata?: Json | null
          notes?: string | null
          on_time?: boolean | null
          picked_up_at?: string | null
          queue_id?: string
          status?: string
          updated_at?: string | null
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_assignments_queue_id_fkey"
            columns: ["queue_id"]
            isOneToOne: false
            referencedRelation: "fulfillment_queue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_assignments_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "delivery_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_events: {
        Row: {
          created_at: string
          delivery_id: string
          driver_id: string | null
          event_type: string
          id: string
          lat: number | null
          lng: number | null
          metadata: Json | null
          new_status: string | null
          notes: string | null
          old_status: string | null
        }
        Insert: {
          created_at?: string
          delivery_id: string
          driver_id?: string | null
          event_type: string
          id?: string
          lat?: number | null
          lng?: number | null
          metadata?: Json | null
          new_status?: string | null
          notes?: string | null
          old_status?: string | null
        }
        Update: {
          created_at?: string
          delivery_id?: string
          driver_id?: string | null
          event_type?: string
          id?: string
          lat?: number | null
          lng?: number | null
          metadata?: Json | null
          new_status?: string | null
          notes?: string | null
          old_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_events_delivery_id_fkey"
            columns: ["delivery_id"]
            isOneToOne: false
            referencedRelation: "delivery_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_events_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_orders: {
        Row: {
          actual_delivery_time: string | null
          assigned_at: string | null
          created_at: string
          current_lat: number | null
          current_lng: number | null
          customer_address_id: string | null
          customer_id: string | null
          customer_name: string
          customer_phone: string | null
          delivery_address: string
          delivery_instructions: string | null
          delivery_lat: number | null
          delivery_latitude: number | null
          delivery_lng: number | null
          delivery_longitude: number | null
          delivery_type: string
          distance_km: number | null
          driver_id: string | null
          estimated_arrival_time: string | null
          estimated_duration_minutes: number | null
          id: string
          items: Json
          notes: string | null
          order_id: string | null
          photo_url: string | null
          pickup_time: string | null
          priority: string
          received_by: string | null
          sale_id: string
          scheduled_delivery_time: string | null
          signature_url: string | null
          status: string
          total: number
          updated_at: string | null
          zone_id: string | null
        }
        Insert: {
          actual_delivery_time?: string | null
          assigned_at?: string | null
          created_at?: string
          current_lat?: number | null
          current_lng?: number | null
          customer_address_id?: string | null
          customer_id?: string | null
          customer_name: string
          customer_phone?: string | null
          delivery_address: string
          delivery_instructions?: string | null
          delivery_lat?: number | null
          delivery_latitude?: number | null
          delivery_lng?: number | null
          delivery_longitude?: number | null
          delivery_type?: string
          distance_km?: number | null
          driver_id?: string | null
          estimated_arrival_time?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          items?: Json
          notes?: string | null
          order_id?: string | null
          photo_url?: string | null
          pickup_time?: string | null
          priority?: string
          received_by?: string | null
          sale_id: string
          scheduled_delivery_time?: string | null
          signature_url?: string | null
          status?: string
          total: number
          updated_at?: string | null
          zone_id?: string | null
        }
        Update: {
          actual_delivery_time?: string | null
          assigned_at?: string | null
          created_at?: string
          current_lat?: number | null
          current_lng?: number | null
          customer_address_id?: string | null
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string | null
          delivery_address?: string
          delivery_instructions?: string | null
          delivery_lat?: number | null
          delivery_latitude?: number | null
          delivery_lng?: number | null
          delivery_longitude?: number | null
          delivery_type?: string
          distance_km?: number | null
          driver_id?: string | null
          estimated_arrival_time?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          items?: Json
          notes?: string | null
          order_id?: string | null
          photo_url?: string | null
          pickup_time?: string | null
          priority?: string
          received_by?: string | null
          sale_id?: string
          scheduled_delivery_time?: string | null
          signature_url?: string | null
          status?: string
          total?: number
          updated_at?: string | null
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_orders_customer_address_id_fkey"
            columns: ["customer_address_id"]
            isOneToOne: false
            referencedRelation: "customer_addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_orders_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_orders_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_orders_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_orders_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "delivery_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_routes: {
        Row: {
          actual_duration_minutes: number | null
          completed_at: string | null
          created_at: string
          delivery_id: string
          destination_lat: number
          destination_lng: number
          distance_km: number
          estimated_duration_minutes: number
          id: string
          optimization_algorithm: string | null
          optimized_path: Json
          origin_lat: number
          origin_lng: number
          traffic_factor: number | null
          waypoints: Json | null
        }
        Insert: {
          actual_duration_minutes?: number | null
          completed_at?: string | null
          created_at?: string
          delivery_id: string
          destination_lat: number
          destination_lng: number
          distance_km: number
          estimated_duration_minutes: number
          id?: string
          optimization_algorithm?: string | null
          optimized_path?: Json
          origin_lat: number
          origin_lng: number
          traffic_factor?: number | null
          waypoints?: Json | null
        }
        Update: {
          actual_duration_minutes?: number | null
          completed_at?: string | null
          created_at?: string
          delivery_id?: string
          destination_lat?: number
          destination_lng?: number
          distance_km?: number
          estimated_duration_minutes?: number
          id?: string
          optimization_algorithm?: string | null
          optimized_path?: Json
          origin_lat?: number
          origin_lng?: number
          traffic_factor?: number | null
          waypoints?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_routes_delivery_id_fkey"
            columns: ["delivery_id"]
            isOneToOne: false
            referencedRelation: "delivery_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_zones: {
        Row: {
          boundaries: Json
          center_lat: number | null
          center_lng: number | null
          color: string
          created_at: string
          deleted_at: string | null
          delivery_fee: number
          description: string | null
          estimated_time_minutes: number
          id: string
          is_active: boolean
          location_id: string | null
          min_order_amount: number | null
          name: string
          priority: number | null
          updated_at: string | null
        }
        Insert: {
          boundaries: Json
          center_lat?: number | null
          center_lng?: number | null
          color?: string
          created_at?: string
          deleted_at?: string | null
          delivery_fee?: number
          description?: string | null
          estimated_time_minutes?: number
          id?: string
          is_active?: boolean
          location_id?: string | null
          min_order_amount?: number | null
          name: string
          priority?: number | null
          updated_at?: string | null
        }
        Update: {
          boundaries?: Json
          center_lat?: number | null
          center_lng?: number | null
          color?: string
          created_at?: string
          deleted_at?: string | null
          delivery_fee?: number
          description?: string | null
          estimated_time_minutes?: number
          id?: string
          is_active?: boolean
          location_id?: string | null
          min_order_amount?: number | null
          name?: string
          priority?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_zones_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_locations: {
        Row: {
          accuracy_meters: number | null
          battery_level: number | null
          delivery_id: string | null
          driver_id: string
          heading: number | null
          id: string
          is_online: boolean | null
          lat: number
          lng: number
          speed_kmh: number | null
          timestamp: string
        }
        Insert: {
          accuracy_meters?: number | null
          battery_level?: number | null
          delivery_id?: string | null
          driver_id: string
          heading?: number | null
          id?: string
          is_online?: boolean | null
          lat: number
          lng: number
          speed_kmh?: number | null
          timestamp?: string
        }
        Update: {
          accuracy_meters?: number | null
          battery_level?: number | null
          delivery_id?: string | null
          driver_id?: string
          heading?: number | null
          id?: string
          is_online?: boolean | null
          lat?: number
          lng?: number
          speed_kmh?: number | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "driver_locations_delivery_id_fkey"
            columns: ["delivery_id"]
            isOneToOne: false
            referencedRelation: "delivery_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_locations_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_availability: {
        Row: {
          created_at: string | null
          day_of_week: number
          employee_id: string
          end_time: string
          id: string
          is_available: boolean | null
          notes: string | null
          preference_level: string | null
          start_time: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          employee_id: string
          end_time: string
          id?: string
          is_available?: boolean | null
          notes?: string | null
          preference_level?: string | null
          start_time: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          employee_id?: string
          end_time?: string
          id?: string
          is_available?: boolean | null
          notes?: string | null
          preference_level?: string | null
          start_time?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_availability_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_skills: {
        Row: {
          certification_date: string | null
          certified: boolean | null
          created_at: string | null
          employee_id: string
          expiry_date: string | null
          id: string
          notes: string | null
          proficiency_level: string | null
          skill_name: string
          updated_at: string | null
        }
        Insert: {
          certification_date?: string | null
          certified?: boolean | null
          created_at?: string | null
          employee_id: string
          expiry_date?: string | null
          id?: string
          notes?: string | null
          proficiency_level?: string | null
          skill_name: string
          updated_at?: string | null
        }
        Update: {
          certification_date?: string | null
          certified?: boolean | null
          created_at?: string | null
          employee_id?: string
          expiry_date?: string | null
          id?: string
          notes?: string | null
          proficiency_level?: string | null
          skill_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_skills_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_training: {
        Row: {
          certificate_url: string | null
          completed_date: string
          created_at: string | null
          created_by: string | null
          employee_id: string
          expiry_date: string | null
          id: string
          issuing_authority: string | null
          notes: string | null
          training_name: string
          training_type: Database["public"]["Enums"]["training_type_enum"]
        }
        Insert: {
          certificate_url?: string | null
          completed_date: string
          created_at?: string | null
          created_by?: string | null
          employee_id: string
          expiry_date?: string | null
          id?: string
          issuing_authority?: string | null
          notes?: string | null
          training_name: string
          training_type: Database["public"]["Enums"]["training_type_enum"]
        }
        Update: {
          certificate_url?: string | null
          completed_date?: string
          created_at?: string | null
          created_by?: string | null
          employee_id?: string
          expiry_date?: string | null
          id?: string
          issuing_authority?: string | null
          notes?: string | null
          training_name?: string
          training_type?: Database["public"]["Enums"]["training_type_enum"]
        }
        Relationships: [
          {
            foreignKeyName: "employee_training_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_reports: {
        Row: {
          created_at: string | null
          data: Json | null
          end_date: string
          file_url: string | null
          id: string
          is_consolidated: boolean | null
          location_id: string | null
          report_name: string
          report_type: string
          start_date: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          end_date: string
          file_url?: string | null
          id?: string
          is_consolidated?: boolean | null
          location_id?: string | null
          report_name: string
          report_type: string
          start_date: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          end_date?: string
          file_url?: string | null
          id?: string
          is_consolidated?: boolean | null
          location_id?: string | null
          report_name?: string
          report_type?: string
          start_date?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_reports_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      fulfillment_policies: {
        Row: {
          auto_accept_orders: boolean | null
          auto_assign_drivers: boolean | null
          cancellation_allowed: boolean | null
          cancellation_deadline_minutes: number | null
          created_at: string | null
          created_by: string | null
          custom_delivery_hours: Json | null
          customer_contact_required: boolean | null
          default_delivery_fee: number | null
          delivery_enabled: boolean | null
          delivery_notifications_enabled: boolean | null
          delivery_zones: Json | null
          driver_assignment_radius_km: number | null
          estimated_delivery_time_minutes: number | null
          estimated_prep_time_minutes: number | null
          free_delivery_threshold: number | null
          id: string
          is_system: boolean | null
          max_advance_order_days: number | null
          max_concurrent_deliveries_per_driver: number | null
          min_order_delivery: number | null
          min_order_pickup: number | null
          order_acceptance_timeout_minutes: number | null
          order_confirmation_required: boolean | null
          order_tracking_enabled: boolean | null
          packaging_fee: number | null
          pickup_discount_percent: number | null
          pickup_enabled: boolean | null
          pickup_ready_time_minutes: number | null
          refund_policy_enabled: boolean | null
          refund_processing_days: number | null
          service_charge_enabled: boolean | null
          service_charge_percent: number | null
          special_instructions_max_length: number | null
          suggested_tip_percentages: Json | null
          tips_enabled: boolean | null
          updated_at: string | null
          utensils_default: boolean | null
        }
        Insert: {
          auto_accept_orders?: boolean | null
          auto_assign_drivers?: boolean | null
          cancellation_allowed?: boolean | null
          cancellation_deadline_minutes?: number | null
          created_at?: string | null
          created_by?: string | null
          custom_delivery_hours?: Json | null
          customer_contact_required?: boolean | null
          default_delivery_fee?: number | null
          delivery_enabled?: boolean | null
          delivery_notifications_enabled?: boolean | null
          delivery_zones?: Json | null
          driver_assignment_radius_km?: number | null
          estimated_delivery_time_minutes?: number | null
          estimated_prep_time_minutes?: number | null
          free_delivery_threshold?: number | null
          id?: string
          is_system?: boolean | null
          max_advance_order_days?: number | null
          max_concurrent_deliveries_per_driver?: number | null
          min_order_delivery?: number | null
          min_order_pickup?: number | null
          order_acceptance_timeout_minutes?: number | null
          order_confirmation_required?: boolean | null
          order_tracking_enabled?: boolean | null
          packaging_fee?: number | null
          pickup_discount_percent?: number | null
          pickup_enabled?: boolean | null
          pickup_ready_time_minutes?: number | null
          refund_policy_enabled?: boolean | null
          refund_processing_days?: number | null
          service_charge_enabled?: boolean | null
          service_charge_percent?: number | null
          special_instructions_max_length?: number | null
          suggested_tip_percentages?: Json | null
          tips_enabled?: boolean | null
          updated_at?: string | null
          utensils_default?: boolean | null
        }
        Update: {
          auto_accept_orders?: boolean | null
          auto_assign_drivers?: boolean | null
          cancellation_allowed?: boolean | null
          cancellation_deadline_minutes?: number | null
          created_at?: string | null
          created_by?: string | null
          custom_delivery_hours?: Json | null
          customer_contact_required?: boolean | null
          default_delivery_fee?: number | null
          delivery_enabled?: boolean | null
          delivery_notifications_enabled?: boolean | null
          delivery_zones?: Json | null
          driver_assignment_radius_km?: number | null
          estimated_delivery_time_minutes?: number | null
          estimated_prep_time_minutes?: number | null
          free_delivery_threshold?: number | null
          id?: string
          is_system?: boolean | null
          max_advance_order_days?: number | null
          max_concurrent_deliveries_per_driver?: number | null
          min_order_delivery?: number | null
          min_order_pickup?: number | null
          order_acceptance_timeout_minutes?: number | null
          order_confirmation_required?: boolean | null
          order_tracking_enabled?: boolean | null
          packaging_fee?: number | null
          pickup_discount_percent?: number | null
          pickup_enabled?: boolean | null
          pickup_ready_time_minutes?: number | null
          refund_policy_enabled?: boolean | null
          refund_processing_days?: number | null
          service_charge_enabled?: boolean | null
          service_charge_percent?: number | null
          special_instructions_max_length?: number | null
          suggested_tip_percentages?: Json | null
          tips_enabled?: boolean | null
          updated_at?: string | null
          utensils_default?: boolean | null
        }
        Relationships: []
      }
      fulfillment_queue: {
        Row: {
          actual_ready_time: string | null
          assigned_to: string | null
          created_at: string | null
          estimated_ready_time: string | null
          fulfillment_type: string
          id: string
          location_id: string | null
          metadata: Json | null
          order_id: string | null
          priority: number | null
          status: string
          updated_at: string | null
        }
        Insert: {
          actual_ready_time?: string | null
          assigned_to?: string | null
          created_at?: string | null
          estimated_ready_time?: string | null
          fulfillment_type: string
          id?: string
          location_id?: string | null
          metadata?: Json | null
          order_id?: string | null
          priority?: number | null
          status: string
          updated_at?: string | null
        }
        Update: {
          actual_ready_time?: string | null
          assigned_to?: string | null
          created_at?: string | null
          estimated_ready_time?: string | null
          fulfillment_type?: string
          id?: string
          location_id?: string | null
          metadata?: Json | null
          order_id?: string | null
          priority?: number | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fulfillment_queue_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fulfillment_queue_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          config: Json
          created_at: string | null
          created_by: string | null
          description: string | null
          error_count: number | null
          id: string
          last_error: string | null
          last_sync: string | null
          name: string
          status: string
          type: string
          updated_at: string | null
        }
        Insert: {
          config?: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          error_count?: number | null
          id?: string
          last_error?: string | null
          last_sync?: string | null
          name: string
          status?: string
          type: string
          updated_at?: string | null
        }
        Update: {
          config?: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          error_count?: number | null
          id?: string
          last_error?: string | null
          last_sync?: string | null
          name?: string
          status?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      inventory_alert_settings: {
        Row: {
          abc_analysis_enabled: boolean
          abc_analysis_thresholds: Json
          auto_reorder_enabled: boolean
          created_at: string
          created_by: string | null
          critical_stock_threshold: number
          expiry_critical_days: number
          expiry_warning_days: number
          id: string
          is_system: boolean
          low_stock_threshold: number
          out_of_stock_threshold: number
          reorder_quantity_rules: Json
          updated_at: string
          waste_threshold_percent: number
        }
        Insert: {
          abc_analysis_enabled?: boolean
          abc_analysis_thresholds?: Json
          auto_reorder_enabled?: boolean
          created_at?: string
          created_by?: string | null
          critical_stock_threshold?: number
          expiry_critical_days?: number
          expiry_warning_days?: number
          id?: string
          is_system?: boolean
          low_stock_threshold?: number
          out_of_stock_threshold?: number
          reorder_quantity_rules?: Json
          updated_at?: string
          waste_threshold_percent?: number
        }
        Update: {
          abc_analysis_enabled?: boolean
          abc_analysis_thresholds?: Json
          auto_reorder_enabled?: boolean
          created_at?: string
          created_by?: string | null
          critical_stock_threshold?: number
          expiry_critical_days?: number
          expiry_warning_days?: number
          id?: string
          is_system?: boolean
          low_stock_threshold?: number
          out_of_stock_threshold?: number
          reorder_quantity_rules?: Json
          updated_at?: string
          waste_threshold_percent?: number
        }
        Relationships: []
      }
      inventory_transfers: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          cancelled_at: string | null
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          from_location_id: string
          id: string
          item_id: string
          notes: string | null
          quantity: number
          reason: string | null
          requested_at: string | null
          requested_by: string | null
          status: string
          to_location_id: string
          transfer_number: string
          unit: string
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          cancelled_at?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          from_location_id: string
          id?: string
          item_id: string
          notes?: string | null
          quantity: number
          reason?: string | null
          requested_at?: string | null
          requested_by?: string | null
          status?: string
          to_location_id: string
          transfer_number: string
          unit: string
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          cancelled_at?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          from_location_id?: string
          id?: string
          item_id?: string
          notes?: string | null
          quantity?: number
          reason?: string | null
          requested_at?: string | null
          requested_by?: string | null
          status?: string
          to_location_id?: string
          transfer_number?: string
          unit?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_transfers_from_location_id_fkey"
            columns: ["from_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transfers_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transfers_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "materials_trends_summary"
            referencedColumns: ["material_id"]
          },
          {
            foreignKeyName: "inventory_transfers_to_location_id_fkey"
            columns: ["to_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          afip_cae: string | null
          afip_cae_due_date: string | null
          created_at: string | null
          customer_id: string | null
          due_date: string | null
          id: string
          invoice_number: string
          invoice_type: string
          journal_entry_id: string | null
          location_id: string | null
          notes: string | null
          numero: number | null
          punto_venta: number | null
          qr_code: string | null
          sale_id: string | null
          status: string | null
          subtotal: number
          tax_amount: number
          tipo_comprobante: string | null
          total: number
          updated_at: string | null
        }
        Insert: {
          afip_cae?: string | null
          afip_cae_due_date?: string | null
          created_at?: string | null
          customer_id?: string | null
          due_date?: string | null
          id?: string
          invoice_number: string
          invoice_type: string
          journal_entry_id?: string | null
          location_id?: string | null
          notes?: string | null
          numero?: number | null
          punto_venta?: number | null
          qr_code?: string | null
          sale_id?: string | null
          status?: string | null
          subtotal?: number
          tax_amount?: number
          tipo_comprobante?: string | null
          total?: number
          updated_at?: string | null
        }
        Update: {
          afip_cae?: string | null
          afip_cae_due_date?: string | null
          created_at?: string | null
          customer_id?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string
          invoice_type?: string
          journal_entry_id?: string | null
          location_id?: string | null
          notes?: string | null
          numero?: number | null
          punto_venta?: number | null
          qr_code?: string | null
          sale_id?: string | null
          status?: string | null
          subtotal?: number
          tax_amount?: number
          tipo_comprobante?: string | null
          total?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      item_modifications: {
        Row: {
          created_at: string
          description: string
          id: string
          ingredients_affected: string[] | null
          order_item_id: string
          preparation_notes: string | null
          price_adjustment: number
          type: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          ingredients_affected?: string[] | null
          order_item_id: string
          preparation_notes?: string | null
          price_adjustment?: number
          type: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          ingredients_affected?: string[] | null
          order_item_id?: string
          preparation_notes?: string | null
          price_adjustment?: number
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "item_modifications_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
        ]
      }
      job_roles: {
        Row: {
          applicable_convention: string | null
          created_at: string | null
          default_hourly_rate: number | null
          department: string | null
          description: string | null
          id: string
          is_active: boolean | null
          labor_category: string | null
          loaded_factor: number | null
          name: string
          organization_id: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          applicable_convention?: string | null
          created_at?: string | null
          default_hourly_rate?: number | null
          department?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          labor_category?: string | null
          loaded_factor?: number | null
          name: string
          organization_id: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          applicable_convention?: string | null
          created_at?: string | null
          default_hourly_rate?: number | null
          department?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          labor_category?: string | null
          loaded_factor?: number | null
          name?: string
          organization_id?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          cash_session_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          entry_number: string | null
          entry_type: string
          external_reference: string | null
          id: string
          is_posted: boolean | null
          location_id: string | null
          notes: string | null
          posted_at: string | null
          posting_date: string
          reference_id: string | null
          reference_type: string | null
          transaction_date: string
        }
        Insert: {
          cash_session_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          entry_number?: string | null
          entry_type: string
          external_reference?: string | null
          id?: string
          is_posted?: boolean | null
          location_id?: string | null
          notes?: string | null
          posted_at?: string | null
          posting_date?: string
          reference_id?: string | null
          reference_type?: string | null
          transaction_date: string
        }
        Update: {
          cash_session_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          entry_number?: string | null
          entry_type?: string
          external_reference?: string | null
          id?: string
          is_posted?: boolean | null
          location_id?: string | null
          notes?: string | null
          posted_at?: string | null
          posting_date?: string
          reference_id?: string | null
          reference_type?: string | null
          transaction_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_entries_cash_session_id_fkey"
            columns: ["cash_session_id"]
            isOneToOne: false
            referencedRelation: "cash_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_entries_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_lines: {
        Row: {
          account_id: string
          amount: number
          created_at: string
          description: string | null
          id: string
          journal_entry_id: string
          money_location_id: string | null
        }
        Insert: {
          account_id: string
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          journal_entry_id: string
          money_location_id?: string | null
        }
        Update: {
          account_id?: string
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          journal_entry_id?: string
          money_location_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "journal_lines_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "account_balances"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "journal_lines_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_lines_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_lines_money_location_id_fkey"
            columns: ["money_location_id"]
            isOneToOne: false
            referencedRelation: "money_location_balances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_lines_money_location_id_fkey"
            columns: ["money_location_id"]
            isOneToOne: false
            referencedRelation: "money_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          address_line_1: string
          address_line_2: string | null
          city: string | null
          closing_date: string | null
          code: string
          country: string | null
          created_at: string | null
          created_by: string | null
          domicilio_afip: string
          email: string | null
          id: string
          is_main: boolean | null
          latitude: number | null
          longitude: number | null
          manager_id: string | null
          name: string
          opening_date: string | null
          operating_hours: Json | null
          organization_id: string | null
          phone: string | null
          postal_code: string | null
          punto_venta_afip: number
          state: string | null
          status: string | null
          timezone: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          address_line_1: string
          address_line_2?: string | null
          city?: string | null
          closing_date?: string | null
          code: string
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          domicilio_afip: string
          email?: string | null
          id?: string
          is_main?: boolean | null
          latitude?: number | null
          longitude?: number | null
          manager_id?: string | null
          name: string
          opening_date?: string | null
          operating_hours?: Json | null
          organization_id?: string | null
          phone?: string | null
          postal_code?: string | null
          punto_venta_afip: number
          state?: string | null
          status?: string | null
          timezone?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          address_line_1?: string
          address_line_2?: string | null
          city?: string | null
          closing_date?: string | null
          code?: string
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          domicilio_afip?: string
          email?: string | null
          id?: string
          is_main?: boolean | null
          latitude?: number | null
          longitude?: number | null
          manager_id?: string | null
          name?: string
          opening_date?: string | null
          operating_hours?: Json | null
          organization_id?: string | null
          phone?: string | null
          postal_code?: string | null
          punto_venta_afip?: number
          state?: string | null
          status?: string | null
          timezone?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      maintenance_schedules: {
        Row: {
          created_at: string | null
          equipment_id: string | null
          equipment_name: string
          estimated_cost: number | null
          id: string
          maintenance_type: string
          notes: string | null
          scheduled_date: string
          scheduled_end_time: string
          scheduled_start_time: string
          status: string | null
          technician_id: string | null
          technician_name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          equipment_id?: string | null
          equipment_name: string
          estimated_cost?: number | null
          id?: string
          maintenance_type: string
          notes?: string | null
          scheduled_date: string
          scheduled_end_time: string
          scheduled_start_time: string
          status?: string | null
          technician_id?: string | null
          technician_name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          equipment_id?: string | null
          equipment_name?: string
          estimated_cost?: number | null
          id?: string
          maintenance_type?: string
          notes?: string | null
          scheduled_date?: string
          scheduled_end_time?: string
          scheduled_start_time?: string
          status?: string | null
          technician_id?: string | null
          technician_name?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_schedules_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      materials: {
        Row: {
          auto_calculate_cost: boolean | null
          batch_size: number | null
          brand_id: string | null
          category: string | null
          created_at: string | null
          display_mode: string | null
          id: string
          ingredients_available: boolean | null
          location: string | null
          location_id: string | null
          max_stock: number | null
          min_stock: number | null
          name: string
          notes: string | null
          package_cost: number | null
          package_size: number | null
          package_unit: string | null
          precision_digits: number | null
          production_config: Json | null
          production_time: number | null
          recipe_id: string | null
          requires_production: boolean | null
          stock: number
          type: string
          unit: string
          unit_cost: number | null
          updated_at: string | null
        }
        Insert: {
          auto_calculate_cost?: boolean | null
          batch_size?: number | null
          brand_id?: string | null
          category?: string | null
          created_at?: string | null
          display_mode?: string | null
          id?: string
          ingredients_available?: boolean | null
          location?: string | null
          location_id?: string | null
          max_stock?: number | null
          min_stock?: number | null
          name: string
          notes?: string | null
          package_cost?: number | null
          package_size?: number | null
          package_unit?: string | null
          precision_digits?: number | null
          production_config?: Json | null
          production_time?: number | null
          recipe_id?: string | null
          requires_production?: boolean | null
          stock?: number
          type: string
          unit: string
          unit_cost?: number | null
          updated_at?: string | null
        }
        Update: {
          auto_calculate_cost?: boolean | null
          batch_size?: number | null
          brand_id?: string | null
          category?: string | null
          created_at?: string | null
          display_mode?: string | null
          id?: string
          ingredients_available?: boolean | null
          location?: string | null
          location_id?: string | null
          max_stock?: number | null
          min_stock?: number | null
          name?: string
          notes?: string | null
          package_cost?: number | null
          package_size?: number | null
          package_unit?: string | null
          precision_digits?: number | null
          production_config?: Json | null
          production_time?: number | null
          recipe_id?: string | null
          requires_production?: boolean | null
          stock?: number
          type?: string
          unit?: string
          unit_cost?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "items_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "materials_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      member_benefits: {
        Row: {
          benefit_type: string
          benefit_value: Json
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          tier_id: string
          updated_at: string | null
        }
        Insert: {
          benefit_type: string
          benefit_value: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          tier_id: string
          updated_at?: string | null
        }
        Update: {
          benefit_type?: string
          benefit_value?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          tier_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "member_benefits_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "membership_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      membership_tiers: {
        Row: {
          created_at: string | null
          description: string | null
          discount_percentage: number | null
          features: Json | null
          id: string
          is_active: boolean | null
          max_guests: number | null
          monthly_price: number
          nutrition_consultations: number | null
          personal_trainer_sessions: number | null
          tier_level: number
          tier_name: string
          updated_at: string | null
          yearly_price: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          discount_percentage?: number | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_guests?: number | null
          monthly_price: number
          nutrition_consultations?: number | null
          personal_trainer_sessions?: number | null
          tier_level: number
          tier_name: string
          updated_at?: string | null
          yearly_price?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          discount_percentage?: number | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_guests?: number | null
          monthly_price?: number
          nutrition_consultations?: number | null
          personal_trainer_sessions?: number | null
          tier_level?: number
          tier_name?: string
          updated_at?: string | null
          yearly_price?: number | null
        }
        Relationships: []
      }
      membership_usage: {
        Row: {
          benefit_id: string | null
          facility: string | null
          id: string
          membership_id: string
          notes: string | null
          order_id: string | null
          usage_type: string
          used_at: string | null
        }
        Insert: {
          benefit_id?: string | null
          facility?: string | null
          id?: string
          membership_id: string
          notes?: string | null
          order_id?: string | null
          usage_type: string
          used_at?: string | null
        }
        Update: {
          benefit_id?: string | null
          facility?: string | null
          id?: string
          membership_id?: string
          notes?: string | null
          order_id?: string | null
          usage_type?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "membership_usage_benefit_id_fkey"
            columns: ["benefit_id"]
            isOneToOne: false
            referencedRelation: "member_benefits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "membership_usage_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "membership_usage_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          auto_renew: boolean | null
          created_at: string | null
          customer_id: string
          end_date: string | null
          id: string
          notes: string | null
          payment_frequency: string | null
          registration_fee: number | null
          start_date: string
          status: string
          tier_id: string
          updated_at: string | null
        }
        Insert: {
          auto_renew?: boolean | null
          created_at?: string | null
          customer_id: string
          end_date?: string | null
          id?: string
          notes?: string | null
          payment_frequency?: string | null
          registration_fee?: number | null
          start_date?: string
          status?: string
          tier_id: string
          updated_at?: string | null
        }
        Update: {
          auto_renew?: boolean | null
          created_at?: string | null
          customer_id?: string
          end_date?: string | null
          id?: string
          notes?: string | null
          payment_frequency?: string | null
          registration_fee?: number | null
          start_date?: string
          status?: string
          tier_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "memberships_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: true
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "membership_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_engineering_analysis: {
        Row: {
          analysis_date: string
          created_at: string | null
          id: string
          menu_category: string | null
          popularity_index: number
          profitability_index: number
          recipe_id: string
          recommendation: string | null
        }
        Insert: {
          analysis_date?: string
          created_at?: string | null
          id?: string
          menu_category?: string | null
          popularity_index?: number
          profitability_index?: number
          recipe_id: string
          recommendation?: string | null
        }
        Update: {
          analysis_date?: string
          created_at?: string | null
          id?: string
          menu_category?: string | null
          popularity_index?: number
          profitability_index?: number
          recipe_id?: string
          recommendation?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_engineering_analysis_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipe_intelligence_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_engineering_analysis_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_performance: {
        Row: {
          average_rating: number | null
          created_at: string
          date: string
          id: string
          product_id: string
          rank_by_revenue: number | null
          rank_by_volume: number | null
          revenue: number
          units_sold: number
        }
        Insert: {
          average_rating?: number | null
          created_at?: string
          date: string
          id?: string
          product_id: string
          rank_by_revenue?: number | null
          rank_by_volume?: number | null
          revenue?: number
          units_sold?: number
        }
        Update: {
          average_rating?: number | null
          created_at?: string
          date?: string
          id?: string
          product_id?: string
          rank_by_revenue?: number | null
          rank_by_volume?: number | null
          revenue?: number
          units_sold?: number
        }
        Relationships: []
      }
      mobile_inventory_constraints: {
        Row: {
          created_at: string | null
          current_quantity: number
          id: string
          material_id: string
          max_quantity: number
          unit: string
          updated_at: string | null
          vehicle_id: string
        }
        Insert: {
          created_at?: string | null
          current_quantity?: number
          id?: string
          material_id: string
          max_quantity?: number
          unit: string
          updated_at?: string | null
          vehicle_id: string
        }
        Update: {
          created_at?: string | null
          current_quantity?: number
          id?: string
          material_id?: string
          max_quantity?: number
          unit?: string
          updated_at?: string | null
          vehicle_id?: string
        }
        Relationships: []
      }
      mobile_routes: {
        Row: {
          created_at: string | null
          driver_id: string | null
          end_location: Json | null
          id: string
          route_date: string
          route_name: string
          start_location: Json | null
          status: string
          updated_at: string | null
          vehicle_id: string | null
          waypoints: Json[] | null
        }
        Insert: {
          created_at?: string | null
          driver_id?: string | null
          end_location?: Json | null
          id?: string
          route_date: string
          route_name: string
          start_location?: Json | null
          status: string
          updated_at?: string | null
          vehicle_id?: string | null
          waypoints?: Json[] | null
        }
        Update: {
          created_at?: string | null
          driver_id?: string | null
          end_location?: Json | null
          id?: string
          route_date?: string
          route_name?: string
          start_location?: Json | null
          status?: string
          updated_at?: string | null
          vehicle_id?: string | null
          waypoints?: Json[] | null
        }
        Relationships: []
      }
      money_locations: {
        Row: {
          account_id: string
          api_credentials: Json | null
          code: string | null
          created_at: string
          created_by: string | null
          current_balance: number | null
          default_float: number | null
          description: string | null
          external_account_number: string | null
          id: string
          is_active: boolean | null
          location_id: string | null
          location_type: string
          max_cash_limit: number | null
          name: string
          requires_session: boolean | null
          responsible_user_id: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          account_id: string
          api_credentials?: Json | null
          code?: string | null
          created_at?: string
          created_by?: string | null
          current_balance?: number | null
          default_float?: number | null
          description?: string | null
          external_account_number?: string | null
          id?: string
          is_active?: boolean | null
          location_id?: string | null
          location_type: string
          max_cash_limit?: number | null
          name: string
          requires_session?: boolean | null
          responsible_user_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          account_id?: string
          api_credentials?: Json | null
          code?: string | null
          created_at?: string
          created_by?: string | null
          current_balance?: number | null
          default_float?: number | null
          description?: string | null
          external_account_number?: string | null
          id?: string
          is_active?: boolean | null
          location_id?: string | null
          location_type?: string
          max_cash_limit?: number | null
          name?: string
          requires_session?: boolean | null
          responsible_user_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "money_locations_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "account_balances"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "money_locations_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "money_locations_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      money_movements: {
        Row: {
          amount: number
          cash_session_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          journal_entry_id: string
          money_location_id: string
          movement_type: string
          running_balance: number | null
        }
        Insert: {
          amount: number
          cash_session_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          journal_entry_id: string
          money_location_id: string
          movement_type: string
          running_balance?: number | null
        }
        Update: {
          amount?: number
          cash_session_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          journal_entry_id?: string
          money_location_id?: string
          movement_type?: string
          running_balance?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "money_movements_cash_session_id_fkey"
            columns: ["cash_session_id"]
            isOneToOne: false
            referencedRelation: "cash_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "money_movements_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "money_movements_money_location_id_fkey"
            columns: ["money_location_id"]
            isOneToOne: false
            referencedRelation: "money_location_balances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "money_movements_money_location_id_fkey"
            columns: ["money_location_id"]
            isOneToOne: false
            referencedRelation: "money_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      operation_locks: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          expires_at: string
          id: string
          ip_address: unknown
          operation_type: string
          request_params: Json
          result: Json | null
          status: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          expires_at?: string
          id: string
          ip_address?: unknown
          operation_type: string
          request_params: Json
          result?: Json | null
          status?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          expires_at?: string
          id?: string
          ip_address?: unknown
          operation_type?: string
          request_params?: Json
          result?: Json | null
          status?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      operational_shifts: {
        Row: {
          active_staff_count: number | null
          business_id: string
          card_total: number | null
          cash_total: number | null
          close_notes: string | null
          closed_at: string | null
          closed_by: string | null
          created_at: string
          id: string
          labor_cost: number | null
          location_id: string | null
          open_notes: string | null
          opened_at: string
          opened_by: string
          other_total: number | null
          qr_total: number | null
          status: string
          total_sales: number | null
          transfer_total: number | null
          updated_at: string
        }
        Insert: {
          active_staff_count?: number | null
          business_id: string
          card_total?: number | null
          cash_total?: number | null
          close_notes?: string | null
          closed_at?: string | null
          closed_by?: string | null
          created_at?: string
          id?: string
          labor_cost?: number | null
          location_id?: string | null
          open_notes?: string | null
          opened_at?: string
          opened_by: string
          other_total?: number | null
          qr_total?: number | null
          status?: string
          total_sales?: number | null
          transfer_total?: number | null
          updated_at?: string
        }
        Update: {
          active_staff_count?: number | null
          business_id?: string
          card_total?: number | null
          cash_total?: number | null
          close_notes?: string | null
          closed_at?: string | null
          closed_by?: string | null
          created_at?: string
          id?: string
          labor_cost?: number | null
          location_id?: string | null
          open_notes?: string | null
          opened_at?: string
          opened_by?: string
          other_total?: number | null
          qr_total?: number | null
          status?: string
          total_sales?: number | null
          transfer_total?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "operational_shifts_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          actual_prep_time: unknown
          allergy_warnings: string[] | null
          created_at: string
          id: string
          line_total: number
          modifications: string[] | null
          order_id: string
          preparation_time_estimate: unknown
          product_id: string
          quantity: number
          ready_at: string | null
          served_at: string | null
          special_instructions: string | null
          spice_level: number | null
          started_prep_at: string | null
          station_assigned: string | null
          status: string | null
          temperature_preference: string | null
          unit_price: number
          updated_at: string
        }
        Insert: {
          actual_prep_time?: unknown
          allergy_warnings?: string[] | null
          created_at?: string
          id?: string
          line_total?: number
          modifications?: string[] | null
          order_id: string
          preparation_time_estimate?: unknown
          product_id: string
          quantity: number
          ready_at?: string | null
          served_at?: string | null
          special_instructions?: string | null
          spice_level?: number | null
          started_prep_at?: string | null
          station_assigned?: string | null
          status?: string | null
          temperature_preference?: string | null
          unit_price: number
          updated_at?: string
        }
        Update: {
          actual_prep_time?: unknown
          allergy_warnings?: string[] | null
          created_at?: string
          id?: string
          line_total?: number
          modifications?: string[] | null
          order_id?: string
          preparation_time_estimate?: unknown
          product_id?: string
          quantity?: number
          ready_at?: string | null
          served_at?: string | null
          special_instructions?: string | null
          spice_level?: number | null
          started_prep_at?: string | null
          station_assigned?: string | null
          status?: string | null
          temperature_preference?: string | null
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          actual_ready_time: string | null
          allergy_warnings: string[] | null
          completed_at: string | null
          created_at: string
          customer_id: string | null
          customer_rating: number | null
          dietary_requirements: string[] | null
          discounts: number
          estimated_ready_time: string | null
          feedback: string | null
          fulfillment_type: string
          id: string
          kitchen_notes: string | null
          order_number: string
          order_type: string
          party_id: string | null
          pickup_time: string | null
          preparation_time: unknown
          priority_level: string | null
          sale_id: string | null
          special_instructions: string[] | null
          status: string
          subtotal: number
          table_id: string | null
          taxes: number
          tips: number
          total: number
          updated_at: string
        }
        Insert: {
          actual_ready_time?: string | null
          allergy_warnings?: string[] | null
          completed_at?: string | null
          created_at?: string
          customer_id?: string | null
          customer_rating?: number | null
          dietary_requirements?: string[] | null
          discounts?: number
          estimated_ready_time?: string | null
          feedback?: string | null
          fulfillment_type: string
          id?: string
          kitchen_notes?: string | null
          order_number: string
          order_type: string
          party_id?: string | null
          pickup_time?: string | null
          preparation_time?: unknown
          priority_level?: string | null
          sale_id?: string | null
          special_instructions?: string[] | null
          status?: string
          subtotal?: number
          table_id?: string | null
          taxes?: number
          tips?: number
          total?: number
          updated_at?: string
        }
        Update: {
          actual_ready_time?: string | null
          allergy_warnings?: string[] | null
          completed_at?: string | null
          created_at?: string
          customer_id?: string | null
          customer_rating?: number | null
          dietary_requirements?: string[] | null
          discounts?: number
          estimated_ready_time?: string | null
          feedback?: string | null
          fulfillment_type?: string
          id?: string
          kitchen_notes?: string | null
          order_number?: string
          order_type?: string
          party_id?: string | null
          pickup_time?: string | null
          preparation_time?: unknown
          priority_level?: string | null
          sale_id?: string | null
          special_instructions?: string[] | null
          status?: string
          subtotal?: number
          table_id?: string | null
          taxes?: number
          tips?: number
          total?: number
          updated_at?: string
        }
        Relationships: []
      }
      organization_features: {
        Row: {
          activated_at: string | null
          activated_by: string | null
          config: Json | null
          created_at: string | null
          enabled: boolean | null
          feature_id: string
          id: string
          organization_id: string
          updated_at: string | null
        }
        Insert: {
          activated_at?: string | null
          activated_by?: string | null
          config?: Json | null
          created_at?: string | null
          enabled?: boolean | null
          feature_id: string
          id?: string
          organization_id: string
          updated_at?: string | null
        }
        Update: {
          activated_at?: string | null
          activated_by?: string | null
          config?: Json | null
          created_at?: string | null
          enabled?: boolean | null
          feature_id?: string
          id?: string
          organization_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_features_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          id: string
          name: string
          settings: Json | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          settings?: Json | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          settings?: Json | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      parties: {
        Row: {
          actual_duration: number | null
          completed_at: string | null
          created_at: string | null
          customer_id: string | null
          customer_name: string | null
          estimated_duration: number | null
          id: string
          notes: string | null
          seated_at: string | null
          size: number
          status: string | null
          table_id: string
          total_spent: number | null
          updated_at: string | null
        }
        Insert: {
          actual_duration?: number | null
          completed_at?: string | null
          created_at?: string | null
          customer_id?: string | null
          customer_name?: string | null
          estimated_duration?: number | null
          id?: string
          notes?: string | null
          seated_at?: string | null
          size: number
          status?: string | null
          table_id: string
          total_spent?: number | null
          updated_at?: string | null
        }
        Update: {
          actual_duration?: number | null
          completed_at?: string | null
          created_at?: string | null
          customer_id?: string | null
          customer_name?: string | null
          estimated_duration?: number | null
          id?: string
          notes?: string | null
          seated_at?: string | null
          size?: number
          status?: string | null
          table_id?: string
          total_spent?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parties_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parties_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "tables"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_gateways: {
        Row: {
          config: Json | null
          created_at: string | null
          id: string
          is_active: boolean
          is_online: boolean
          name: string
          provider: string | null
          supports_recurring: boolean
          supports_refunds: boolean
          type: string
          updated_at: string | null
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean
          is_online?: boolean
          name: string
          provider?: string | null
          supports_recurring?: boolean
          supports_refunds?: boolean
          type: string
          updated_at?: string | null
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean
          is_online?: boolean
          name?: string
          provider?: string | null
          supports_recurring?: boolean
          supports_refunds?: boolean
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          amount: number
          authorization_code: string | null
          batch_id: string | null
          card_brand: string | null
          created_at: string
          customer_signature: string | null
          cvv_verified: boolean | null
          id: string
          is_contactless: boolean
          is_emv: boolean | null
          last_four_digits: string | null
          order_id: string | null
          processed_at: string | null
          processing_time: unknown
          provider: string | null
          receipt_method: string | null
          reference_number: string | null
          sale_id: string
          status: string | null
          terminal_id: string | null
          tip_amount: number
          tip_percentage: number | null
          transaction_id: string | null
          type: string
        }
        Insert: {
          amount: number
          authorization_code?: string | null
          batch_id?: string | null
          card_brand?: string | null
          created_at?: string
          customer_signature?: string | null
          cvv_verified?: boolean | null
          id?: string
          is_contactless?: boolean
          is_emv?: boolean | null
          last_four_digits?: string | null
          order_id?: string | null
          processed_at?: string | null
          processing_time?: unknown
          provider?: string | null
          receipt_method?: string | null
          reference_number?: string | null
          sale_id: string
          status?: string | null
          terminal_id?: string | null
          tip_amount?: number
          tip_percentage?: number | null
          transaction_id?: string | null
          type: string
        }
        Update: {
          amount?: number
          authorization_code?: string | null
          batch_id?: string | null
          card_brand?: string | null
          created_at?: string
          customer_signature?: string | null
          cvv_verified?: boolean | null
          id?: string
          is_contactless?: boolean
          is_emv?: boolean | null
          last_four_digits?: string | null
          order_id?: string | null
          processed_at?: string | null
          processing_time?: unknown
          provider?: string | null
          receipt_method?: string | null
          reference_number?: string | null
          sale_id?: string
          status?: string | null
          terminal_id?: string | null
          tip_amount?: number
          tip_percentage?: number | null
          transaction_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_methods_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods_config: {
        Row: {
          code: string
          config: Json | null
          created_at: string | null
          description: string | null
          display_name: string
          gateway_id: string | null
          icon: string | null
          id: string
          is_active: boolean
          name: string
          requires_gateway: boolean
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          code: string
          config?: Json | null
          created_at?: string | null
          description?: string | null
          display_name: string
          gateway_id?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          requires_gateway?: boolean
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          config?: Json | null
          created_at?: string | null
          description?: string | null
          display_name?: string
          gateway_id?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          requires_gateway?: boolean
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_methods_config_gateway_id_fkey"
            columns: ["gateway_id"]
            isOneToOne: false
            referencedRelation: "payment_gateways"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          currency: string
          failure_reason: string | null
          id: string
          invoice_id: string
          payment_method_id: string | null
          processed_at: string | null
          provider: string | null
          retry_count: number
          status: string
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: string | null
          currency?: string
          failure_reason?: string | null
          id?: string
          invoice_id: string
          payment_method_id?: string | null
          processed_at?: string | null
          provider?: string | null
          retry_count?: number
          status?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          currency?: string
          failure_reason?: string | null
          id?: string
          invoice_id?: string
          payment_method_id?: string | null
          processed_at?: string | null
          provider?: string | null
          retry_count?: number
          status?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_periods: {
        Row: {
          bonuses: Json | null
          created_at: string | null
          created_by: string | null
          deductions: Json | null
          employee_id: string
          id: string
          overtime_hours: number | null
          overtime_pay: number | null
          period_end: string
          period_start: string
          regular_hours: number | null
          regular_pay: number | null
          status: string
          total_hours: number | null
          total_pay: number | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          bonuses?: Json | null
          created_at?: string | null
          created_by?: string | null
          deductions?: Json | null
          employee_id: string
          id?: string
          overtime_hours?: number | null
          overtime_pay?: number | null
          period_end: string
          period_start: string
          regular_hours?: number | null
          regular_pay?: number | null
          status?: string
          total_hours?: number | null
          total_pay?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          bonuses?: Json | null
          created_at?: string | null
          created_by?: string | null
          deductions?: Json | null
          employee_id?: string
          id?: string
          overtime_hours?: number | null
          overtime_pay?: number | null
          period_end?: string
          period_start?: string
          regular_hours?: number | null
          regular_pay?: number | null
          status?: string
          total_hours?: number | null
          total_pay?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payroll_periods_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      percepciones_retenciones: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          invoice_id: string
          jurisdiction: string | null
          percentage: number
          tax_type: string
          type: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          invoice_id: string
          jurisdiction?: string | null
          percentage: number
          tax_type: string
          type: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          invoice_id?: string
          jurisdiction?: string | null
          percentage?: number
          tax_type?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "percepciones_retenciones_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      pickup_time_slots: {
        Row: {
          created_at: string
          current_orders: number
          day_of_week: number
          deleted_at: string | null
          end_time: string
          id: string
          is_active: boolean
          max_orders: number
          notes: string | null
          start_time: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          current_orders?: number
          day_of_week: number
          deleted_at?: string | null
          end_time: string
          id?: string
          is_active?: boolean
          max_orders?: number
          notes?: string | null
          start_time: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          current_orders?: number
          day_of_week?: number
          deleted_at?: string | null
          end_time?: string
          id?: string
          is_active?: boolean
          max_orders?: number
          notes?: string | null
          start_time?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      pos_async_dead_letter_queue: {
        Row: {
          entity_id: string
          entity_type: Database["public"]["Enums"]["pos_entity_type"]
          failed_at: string
          final_error_message: string
          id: string
          operation_type: Database["public"]["Enums"]["pos_operation_type"]
          original_operation_id: string | null
          original_payload: Json | null
          total_retry_count: number
        }
        Insert: {
          entity_id: string
          entity_type: Database["public"]["Enums"]["pos_entity_type"]
          failed_at?: string
          final_error_message: string
          id?: string
          operation_type: Database["public"]["Enums"]["pos_operation_type"]
          original_operation_id?: string | null
          original_payload?: Json | null
          total_retry_count: number
        }
        Update: {
          entity_id?: string
          entity_type?: Database["public"]["Enums"]["pos_entity_type"]
          failed_at?: string
          final_error_message?: string
          id?: string
          operation_type?: Database["public"]["Enums"]["pos_operation_type"]
          original_operation_id?: string | null
          original_payload?: Json | null
          total_retry_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "pos_async_dead_letter_queue_original_operation_id_fkey"
            columns: ["original_operation_id"]
            isOneToOne: false
            referencedRelation: "pos_async_operations"
            referencedColumns: ["id"]
          },
        ]
      }
      pos_async_operations: {
        Row: {
          completed_at: string | null
          created_at: string
          entity_id: string
          entity_type: Database["public"]["Enums"]["pos_entity_type"]
          error_code: string | null
          error_message: string | null
          id: string
          max_retries: number
          next_retry_at: string | null
          operation_payload: Json | null
          operation_type: Database["public"]["Enums"]["pos_operation_type"]
          priority: number
          retry_count: number
          started_at: string | null
          status: Database["public"]["Enums"]["pos_async_status"]
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          entity_id: string
          entity_type: Database["public"]["Enums"]["pos_entity_type"]
          error_code?: string | null
          error_message?: string | null
          id?: string
          max_retries?: number
          next_retry_at?: string | null
          operation_payload?: Json | null
          operation_type: Database["public"]["Enums"]["pos_operation_type"]
          priority?: number
          retry_count?: number
          started_at?: string | null
          status?: Database["public"]["Enums"]["pos_async_status"]
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          entity_id?: string
          entity_type?: Database["public"]["Enums"]["pos_entity_type"]
          error_code?: string | null
          error_message?: string | null
          id?: string
          max_retries?: number
          next_retry_at?: string | null
          operation_payload?: Json | null
          operation_type?: Database["public"]["Enums"]["pos_operation_type"]
          priority?: number
          retry_count?: number
          started_at?: string | null
          status?: Database["public"]["Enums"]["pos_async_status"]
        }
        Relationships: []
      }
      pricing_tiers: {
        Row: {
          created_at: string | null
          discount_percentage: number
          fixed_price: number | null
          id: string
          max_quantity: number | null
          max_value: number | null
          min_quantity: number | null
          min_value: number | null
          pricing_config_id: string | null
        }
        Insert: {
          created_at?: string | null
          discount_percentage: number
          fixed_price?: number | null
          id?: string
          max_quantity?: number | null
          max_value?: number | null
          min_quantity?: number | null
          min_value?: number | null
          pricing_config_id?: string | null
        }
        Update: {
          created_at?: string | null
          discount_percentage?: number
          fixed_price?: number | null
          id?: string
          max_quantity?: number | null
          max_value?: number | null
          min_quantity?: number | null
          min_value?: number | null
          pricing_config_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pricing_tiers_pricing_config_id_fkey"
            columns: ["pricing_config_id"]
            isOneToOne: false
            referencedRelation: "tiered_pricings"
            referencedColumns: ["id"]
          },
        ]
      }
      product_asset_configs: {
        Row: {
          accessories: Json | null
          asset_id: string
          availability_config: Json | null
          checklist_templates: Json | null
          created_at: string | null
          created_by: string | null
          depreciation_config: Json | null
          gps_config: Json | null
          id: string
          inspection_config: Json | null
          insurance_config: Json | null
          maintenance_config: Json | null
          security_deposit_config: Json | null
          updated_at: string | null
          updated_by: string | null
          usage_restrictions: Json | null
        }
        Insert: {
          accessories?: Json | null
          asset_id: string
          availability_config?: Json | null
          checklist_templates?: Json | null
          created_at?: string | null
          created_by?: string | null
          depreciation_config?: Json | null
          gps_config?: Json | null
          id?: string
          inspection_config?: Json | null
          insurance_config?: Json | null
          maintenance_config?: Json | null
          security_deposit_config?: Json | null
          updated_at?: string | null
          updated_by?: string | null
          usage_restrictions?: Json | null
        }
        Update: {
          accessories?: Json | null
          asset_id?: string
          availability_config?: Json | null
          checklist_templates?: Json | null
          created_at?: string | null
          created_by?: string | null
          depreciation_config?: Json | null
          gps_config?: Json | null
          id?: string
          inspection_config?: Json | null
          insurance_config?: Json | null
          maintenance_config?: Json | null
          security_deposit_config?: Json | null
          updated_at?: string | null
          updated_by?: string | null
          usage_restrictions?: Json | null
        }
        Relationships: []
      }
      product_catalog_settings: {
        Row: {
          allow_backorders: boolean | null
          auto_disable_on_zero_stock: boolean | null
          check_stock: boolean | null
          created_at: string | null
          created_by: string | null
          default_markup_percentage: number | null
          id: string
          is_system: boolean | null
          menu_categories: Json | null
          minimum_notice_minutes: number | null
          modifiers_configuration: Json | null
          portion_sizes: Json | null
          pricing_strategy: string | null
          product_categories: Json | null
          recipe_costing_method: string | null
          updated_at: string | null
        }
        Insert: {
          allow_backorders?: boolean | null
          auto_disable_on_zero_stock?: boolean | null
          check_stock?: boolean | null
          created_at?: string | null
          created_by?: string | null
          default_markup_percentage?: number | null
          id?: string
          is_system?: boolean | null
          menu_categories?: Json | null
          minimum_notice_minutes?: number | null
          modifiers_configuration?: Json | null
          portion_sizes?: Json | null
          pricing_strategy?: string | null
          product_categories?: Json | null
          recipe_costing_method?: string | null
          updated_at?: string | null
        }
        Update: {
          allow_backorders?: boolean | null
          auto_disable_on_zero_stock?: boolean | null
          check_stock?: boolean | null
          created_at?: string | null
          created_by?: string | null
          default_markup_percentage?: number | null
          id?: string
          is_system?: boolean | null
          menu_categories?: Json | null
          minimum_notice_minutes?: number | null
          modifiers_configuration?: Json | null
          portion_sizes?: Json | null
          pricing_strategy?: string | null
          product_categories?: Json | null
          recipe_costing_method?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      product_components: {
        Row: {
          created_at: string | null
          id: string
          is_optional: boolean | null
          item_id: string
          material_name: string | null
          notes: string | null
          product_id: string
          quantity_required: number
          total_cost: number | null
          unit: string | null
          unit_cost: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_optional?: boolean | null
          item_id: string
          material_name?: string | null
          notes?: string | null
          product_id: string
          quantity_required: number
          total_cost?: number | null
          unit?: string | null
          unit_cost?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_optional?: boolean | null
          item_id?: string
          material_name?: string | null
          notes?: string | null
          product_id?: string
          quantity_required?: number
          total_cost?: number | null
          unit?: string | null
          unit_cost?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_components_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_components_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "materials_trends_summary"
            referencedColumns: ["material_id"]
          },
          {
            foreignKeyName: "product_components_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_digital_deliveries: {
        Row: {
          access_config: Json | null
          created_at: string | null
          created_by: string | null
          delivery_type: string
          download_config: Json | null
          hybrid_config: Json | null
          id: string
          redirect_config: Json | null
          streaming_config: Json | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          access_config?: Json | null
          created_at?: string | null
          created_by?: string | null
          delivery_type: string
          download_config?: Json | null
          hybrid_config?: Json | null
          id?: string
          redirect_config?: Json | null
          streaming_config?: Json | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          access_config?: Json | null
          created_at?: string | null
          created_by?: string | null
          delivery_type?: string
          download_config?: Json | null
          hybrid_config?: Json | null
          id?: string
          redirect_config?: Json | null
          streaming_config?: Json | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      product_recurring_configs: {
        Row: {
          access_type: string
          auto_renewal: boolean | null
          auto_renewal_notice_days: number | null
          billing_cycle: string
          billing_day: number | null
          cancellation_notice_days: number | null
          cancellation_policy: string | null
          created_at: string | null
          created_by: string | null
          id: string
          monthly_credits: number | null
          prorate_first_payment: boolean | null
          tier_benefits: string[] | null
          trial_duration_days: number | null
          trial_enabled: boolean | null
          trial_price: number | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          access_type: string
          auto_renewal?: boolean | null
          auto_renewal_notice_days?: number | null
          billing_cycle: string
          billing_day?: number | null
          cancellation_notice_days?: number | null
          cancellation_policy?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          monthly_credits?: number | null
          prorate_first_payment?: boolean | null
          tier_benefits?: string[] | null
          trial_duration_days?: number | null
          trial_enabled?: boolean | null
          trial_price?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          access_type?: string
          auto_renewal?: boolean | null
          auto_renewal_notice_days?: number | null
          billing_cycle?: string
          billing_day?: number | null
          cancellation_notice_days?: number | null
          cancellation_policy?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          monthly_credits?: number | null
          prorate_first_payment?: boolean | null
          tier_benefits?: string[] | null
          trial_duration_days?: number | null
          trial_enabled?: boolean | null
          trial_price?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      product_rental_terms: {
        Row: {
          additional_terms: string | null
          cancellation_policy: Json | null
          created_at: string | null
          created_by: string | null
          damage_policy: Json | null
          id: string
          insurance_options: Json | null
          late_return_policy: Json | null
          maintenance_cleaning: Json | null
          security_deposit: Json | null
          updated_at: string | null
          updated_by: string | null
          usage_restrictions: Json | null
        }
        Insert: {
          additional_terms?: string | null
          cancellation_policy?: Json | null
          created_at?: string | null
          created_by?: string | null
          damage_policy?: Json | null
          id?: string
          insurance_options?: Json | null
          late_return_policy?: Json | null
          maintenance_cleaning?: Json | null
          security_deposit?: Json | null
          updated_at?: string | null
          updated_by?: string | null
          usage_restrictions?: Json | null
        }
        Update: {
          additional_terms?: string | null
          cancellation_policy?: Json | null
          created_at?: string | null
          created_by?: string | null
          damage_policy?: Json | null
          id?: string
          insurance_options?: Json | null
          late_return_policy?: Json | null
          maintenance_cleaning?: Json | null
          security_deposit?: Json | null
          updated_at?: string | null
          updated_by?: string | null
          usage_restrictions?: Json | null
        }
        Relationships: []
      }
      product_staff_allocations: {
        Row: {
          count: number
          created_at: string | null
          duration_minutes: number
          employee_id: string | null
          hourly_rate: number | null
          id: string
          loaded_factor_override: number | null
          product_id: string
          role_id: string
          role_name: string | null
          total_cost: number | null
          total_hours: number | null
          updated_at: string | null
        }
        Insert: {
          count?: number
          created_at?: string | null
          duration_minutes: number
          employee_id?: string | null
          hourly_rate?: number | null
          id?: string
          loaded_factor_override?: number | null
          product_id: string
          role_id: string
          role_name?: string | null
          total_cost?: number | null
          total_hours?: number | null
          updated_at?: string | null
        }
        Update: {
          count?: number
          created_at?: string | null
          duration_minutes?: number
          employee_id?: string | null
          hourly_rate?: number | null
          id?: string
          loaded_factor_override?: number | null
          product_id?: string
          role_id?: string
          role_name?: string | null
          total_cost?: number | null
          total_hours?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_product_staff_alloc_role"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "job_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_staff_allocations_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_staff_allocations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      production_batches: {
        Row: {
          actual_quantity: number | null
          created_at: string | null
          created_by: string | null
          executed_at: string | null
          expected_quantity: number
          id: string
          material_id: string | null
          notes: string | null
          recipe_id: string
          scheduled_at: string | null
          scrap_quantity: number | null
          scrap_reason: string | null
          status: string
          updated_at: string | null
          yield_percentage: number | null
        }
        Insert: {
          actual_quantity?: number | null
          created_at?: string | null
          created_by?: string | null
          executed_at?: string | null
          expected_quantity: number
          id?: string
          material_id?: string | null
          notes?: string | null
          recipe_id: string
          scheduled_at?: string | null
          scrap_quantity?: number | null
          scrap_reason?: string | null
          status?: string
          updated_at?: string | null
          yield_percentage?: number | null
        }
        Update: {
          actual_quantity?: number | null
          created_at?: string | null
          created_by?: string | null
          executed_at?: string | null
          expected_quantity?: number
          id?: string
          material_id?: string | null
          notes?: string | null
          recipe_id?: string
          scheduled_at?: string | null
          scrap_quantity?: number | null
          scrap_reason?: string | null
          status?: string
          updated_at?: string | null
          yield_percentage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "production_batches_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_batches_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials_trends_summary"
            referencedColumns: ["material_id"]
          },
          {
            foreignKeyName: "production_batches_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipe_intelligence_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_batches_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      production_equipment: {
        Row: {
          accumulated_depreciation: number | null
          actual_hours_used: number
          assigned_to: string | null
          auto_calculate_rate: boolean
          code: string
          condition: string
          consumables_cost_per_hour: number
          created_at: string
          created_by: string | null
          current_value: number | null
          custom_fields: Json | null
          description: string | null
          energy_cost_per_hour: number
          equipment_type: string
          estimated_annual_hours: number
          hourly_cost_rate: number | null
          id: string
          insurance_cost_annual: number
          last_cost_calculation_date: string | null
          last_maintenance_date: string | null
          location: string | null
          maintenance_cost_percentage: number
          maintenance_interval_days: number
          name: string
          next_maintenance_date: string | null
          notes: string | null
          overhead_cost_per_hour: number
          purchase_date: string | null
          purchase_price: number | null
          salvage_value: number | null
          status: string
          tags: string[] | null
          updated_at: string
          updated_by: string | null
          useful_life_years: number | null
        }
        Insert: {
          accumulated_depreciation?: number | null
          actual_hours_used?: number
          assigned_to?: string | null
          auto_calculate_rate?: boolean
          code: string
          condition?: string
          consumables_cost_per_hour?: number
          created_at?: string
          created_by?: string | null
          current_value?: number | null
          custom_fields?: Json | null
          description?: string | null
          energy_cost_per_hour?: number
          equipment_type: string
          estimated_annual_hours?: number
          hourly_cost_rate?: number | null
          id?: string
          insurance_cost_annual?: number
          last_cost_calculation_date?: string | null
          last_maintenance_date?: string | null
          location?: string | null
          maintenance_cost_percentage?: number
          maintenance_interval_days?: number
          name: string
          next_maintenance_date?: string | null
          notes?: string | null
          overhead_cost_per_hour?: number
          purchase_date?: string | null
          purchase_price?: number | null
          salvage_value?: number | null
          status?: string
          tags?: string[] | null
          updated_at?: string
          updated_by?: string | null
          useful_life_years?: number | null
        }
        Update: {
          accumulated_depreciation?: number | null
          actual_hours_used?: number
          assigned_to?: string | null
          auto_calculate_rate?: boolean
          code?: string
          condition?: string
          consumables_cost_per_hour?: number
          created_at?: string
          created_by?: string | null
          current_value?: number | null
          custom_fields?: Json | null
          description?: string | null
          energy_cost_per_hour?: number
          equipment_type?: string
          estimated_annual_hours?: number
          hourly_cost_rate?: number | null
          id?: string
          insurance_cost_annual?: number
          last_cost_calculation_date?: string | null
          last_maintenance_date?: string | null
          location?: string | null
          maintenance_cost_percentage?: number
          maintenance_interval_days?: number
          name?: string
          next_maintenance_date?: string | null
          notes?: string | null
          overhead_cost_per_hour?: number
          purchase_date?: string | null
          purchase_price?: number | null
          salvage_value?: number | null
          status?: string
          tags?: string[] | null
          updated_at?: string
          updated_by?: string | null
          useful_life_years?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_production_equipment_assigned_to"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean
          allergens: string[] | null
          asset_config_id: string | null
          availability: Json | null
          available_for_online_booking: boolean | null
          available_online: boolean | null
          calories: number | null
          cancellation_policy: string | null
          category: string | null
          config: Json | null
          created_at: string | null
          created_by: string | null
          description: string | null
          digital_delivery_id: string | null
          duration_minutes: number | null
          has_materials: boolean | null
          has_staff_requirements: boolean | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_published: boolean
          name: string
          online_price: number | null
          online_stock: number | null
          online_visibility: string | null
          optional_components: Json | null
          preparation_time: number | null
          price: number
          pricing: Json | null
          product_type: string
          production_config: Json | null
          recipe_id: string | null
          recurring_config_id: string | null
          rental_terms_id: string | null
          requires_ingredients: boolean | null
          requires_specific_professional: boolean | null
          seo_description: string | null
          seo_keywords: string[] | null
          seo_title: string | null
          type: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          active?: boolean
          allergens?: string[] | null
          asset_config_id?: string | null
          availability?: Json | null
          available_for_online_booking?: boolean | null
          available_online?: boolean | null
          calories?: number | null
          cancellation_policy?: string | null
          category?: string | null
          config?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          digital_delivery_id?: string | null
          duration_minutes?: number | null
          has_materials?: boolean | null
          has_staff_requirements?: boolean | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_published?: boolean
          name: string
          online_price?: number | null
          online_stock?: number | null
          online_visibility?: string | null
          optional_components?: Json | null
          preparation_time?: number | null
          price?: number
          pricing?: Json | null
          product_type: string
          production_config?: Json | null
          recipe_id?: string | null
          recurring_config_id?: string | null
          rental_terms_id?: string | null
          requires_ingredients?: boolean | null
          requires_specific_professional?: boolean | null
          seo_description?: string | null
          seo_keywords?: string[] | null
          seo_title?: string | null
          type?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          active?: boolean
          allergens?: string[] | null
          asset_config_id?: string | null
          availability?: Json | null
          available_for_online_booking?: boolean | null
          available_online?: boolean | null
          calories?: number | null
          cancellation_policy?: string | null
          category?: string | null
          config?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          digital_delivery_id?: string | null
          duration_minutes?: number | null
          has_materials?: boolean | null
          has_staff_requirements?: boolean | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_published?: boolean
          name?: string
          online_price?: number | null
          online_stock?: number | null
          online_visibility?: string | null
          optional_components?: Json | null
          preparation_time?: number | null
          price?: number
          pricing?: Json | null
          product_type?: string
          production_config?: Json | null
          recipe_id?: string | null
          recurring_config_id?: string | null
          rental_terms_id?: string | null
          requires_ingredients?: boolean | null
          requires_specific_professional?: boolean | null
          seo_description?: string | null
          seo_keywords?: string[] | null
          seo_title?: string | null
          type?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_products_asset_config"
            columns: ["asset_config_id"]
            isOneToOne: false
            referencedRelation: "product_asset_configs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_products_digital_delivery"
            columns: ["digital_delivery_id"]
            isOneToOne: false
            referencedRelation: "product_digital_deliveries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_products_recipe"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipe_intelligence_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_products_recipe"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_products_recurring_config"
            columns: ["recurring_config_id"]
            isOneToOne: false
            referencedRelation: "product_recurring_configs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_products_rental_terms"
            columns: ["rental_terms_id"]
            isOneToOne: false
            referencedRelation: "product_rental_terms"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_availability: {
        Row: {
          break_end_time: string | null
          break_start_time: string | null
          created_at: string | null
          day_of_week: number
          end_time: string
          id: string
          is_active: boolean | null
          location_id: string | null
          override_buffer_minutes: number | null
          override_slot_duration: number | null
          staff_id: string
          start_time: string
          updated_at: string | null
        }
        Insert: {
          break_end_time?: string | null
          break_start_time?: string | null
          created_at?: string | null
          day_of_week: number
          end_time: string
          id?: string
          is_active?: boolean | null
          location_id?: string | null
          override_buffer_minutes?: number | null
          override_slot_duration?: number | null
          staff_id: string
          start_time: string
          updated_at?: string | null
        }
        Update: {
          break_end_time?: string | null
          break_start_time?: string | null
          created_at?: string | null
          day_of_week?: number
          end_time?: string
          id?: string
          is_active?: boolean | null
          location_id?: string | null
          override_buffer_minutes?: number | null
          override_slot_duration?: number | null
          staff_id?: string
          start_time?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "professional_availability_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professional_availability_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_availability: {
        Row: {
          break_times: Json | null
          created_at: string | null
          day_of_week: number
          end_time: string
          id: string
          is_available: boolean | null
          provider_id: string
          start_time: string
          updated_at: string | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          break_times?: Json | null
          created_at?: string | null
          day_of_week: number
          end_time: string
          id?: string
          is_available?: boolean | null
          provider_id: string
          start_time: string
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          break_times?: Json | null
          created_at?: string | null
          day_of_week?: number
          end_time?: string
          id?: string
          is_available?: boolean | null
          provider_id?: string
          start_time?: string
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      qr_order_items: {
        Row: {
          created_at: string
          id: string
          line_total: number
          modifications: string[] | null
          product_id: string
          qr_order_id: string
          quantity: number
          size_option: string | null
          special_instructions: string | null
          status: string | null
          unit_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          line_total?: number
          modifications?: string[] | null
          product_id: string
          qr_order_id: string
          quantity: number
          size_option?: string | null
          special_instructions?: string | null
          status?: string | null
          unit_price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          line_total?: number
          modifications?: string[] | null
          product_id?: string
          qr_order_id?: string
          quantity?: number
          size_option?: string | null
          special_instructions?: string | null
          status?: string | null
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "qr_order_items_qr_order_id_fkey"
            columns: ["qr_order_id"]
            isOneToOne: false
            referencedRelation: "qr_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      qr_orders: {
        Row: {
          allergy_warnings: string[] | null
          created_at: string
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          dietary_restrictions: string[] | null
          estimated_total: number
          expires_at: string
          id: string
          party_size: number | null
          qr_code: string
          service_preference: string | null
          session_token: string
          special_requests: string | null
          status: string | null
          submitted_at: string | null
          subtotal: number
          table_id: string
          updated_at: string
        }
        Insert: {
          allergy_warnings?: string[] | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          dietary_restrictions?: string[] | null
          estimated_total?: number
          expires_at: string
          id?: string
          party_size?: number | null
          qr_code: string
          service_preference?: string | null
          session_token: string
          special_requests?: string | null
          status?: string | null
          submitted_at?: string | null
          subtotal?: number
          table_id: string
          updated_at?: string
        }
        Update: {
          allergy_warnings?: string[] | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          dietary_restrictions?: string[] | null
          estimated_total?: number
          expires_at?: string
          id?: string
          party_size?: number | null
          qr_code?: string
          service_preference?: string | null
          session_token?: string
          special_requests?: string | null
          status?: string | null
          submitted_at?: string | null
          subtotal?: number
          table_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      recipe_ingredients: {
        Row: {
          conversion_factor: number | null
          id: string
          item_id: string | null
          quantity: number
          recipe_id: string | null
          unit: string | null
          unit_cost_override: number | null
          waste_percentage: number | null
          yield_percentage: number | null
        }
        Insert: {
          conversion_factor?: number | null
          id?: string
          item_id?: string | null
          quantity: number
          recipe_id?: string | null
          unit?: string | null
          unit_cost_override?: number | null
          waste_percentage?: number | null
          yield_percentage?: number | null
        }
        Update: {
          conversion_factor?: number | null
          id?: string
          item_id?: string | null
          quantity?: number
          recipe_id?: string | null
          unit?: string | null
          unit_cost_override?: number | null
          waste_percentage?: number | null
          yield_percentage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipe_intelligence_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_performance: {
        Row: {
          actual_cost: number
          created_at: string | null
          date: string
          id: string
          recipe_id: string
          revenue_generated: number | null
          times_produced: number
          times_sold: number | null
        }
        Insert: {
          actual_cost?: number
          created_at?: string | null
          date?: string
          id?: string
          recipe_id: string
          revenue_generated?: number | null
          times_produced?: number
          times_sold?: number | null
        }
        Update: {
          actual_cost?: number
          created_at?: string | null
          date?: string
          id?: string
          recipe_id?: string
          revenue_generated?: number | null
          times_produced?: number
          times_sold?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "recipe_performance_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipe_intelligence_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_performance_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          allergens: string[] | null
          base_cost: number | null
          created_at: string | null
          description: string | null
          dietary_tags: string[] | null
          difficulty_level: string | null
          entity_type: string
          execution_mode: string
          id: string
          image_url: string | null
          instructions: string | null
          kitchen_station: string | null
          labor_cost: number | null
          menu_category: string | null
          name: string
          nutritional_info: Json | null
          output_item_id: string | null
          output_quantity: number
          output_unit: string | null
          overhead_cost: number | null
          packaging_cost: number | null
          popularity_score: number | null
          preparation_time: number | null
          profitability_score: number | null
          quality_checks: string[] | null
          recipe_category: string | null
          serving_size: number | null
          shelf_life: unknown
          temperature_requirements: Json | null
          updated_at: string | null
          waste_percentage: number | null
          yield_percentage: number | null
        }
        Insert: {
          allergens?: string[] | null
          base_cost?: number | null
          created_at?: string | null
          description?: string | null
          dietary_tags?: string[] | null
          difficulty_level?: string | null
          entity_type: string
          execution_mode: string
          id?: string
          image_url?: string | null
          instructions?: string | null
          kitchen_station?: string | null
          labor_cost?: number | null
          menu_category?: string | null
          name: string
          nutritional_info?: Json | null
          output_item_id?: string | null
          output_quantity: number
          output_unit?: string | null
          overhead_cost?: number | null
          packaging_cost?: number | null
          popularity_score?: number | null
          preparation_time?: number | null
          profitability_score?: number | null
          quality_checks?: string[] | null
          recipe_category?: string | null
          serving_size?: number | null
          shelf_life?: unknown
          temperature_requirements?: Json | null
          updated_at?: string | null
          waste_percentage?: number | null
          yield_percentage?: number | null
        }
        Update: {
          allergens?: string[] | null
          base_cost?: number | null
          created_at?: string | null
          description?: string | null
          dietary_tags?: string[] | null
          difficulty_level?: string | null
          entity_type?: string
          execution_mode?: string
          id?: string
          image_url?: string | null
          instructions?: string | null
          kitchen_station?: string | null
          labor_cost?: number | null
          menu_category?: string | null
          name?: string
          nutritional_info?: Json | null
          output_item_id?: string | null
          output_quantity?: number
          output_unit?: string | null
          overhead_cost?: number | null
          packaging_cost?: number | null
          popularity_score?: number | null
          preparation_time?: number | null
          profitability_score?: number | null
          quality_checks?: string[] | null
          recipe_category?: string | null
          serving_size?: number | null
          shelf_life?: unknown
          temperature_requirements?: Json | null
          updated_at?: string | null
          waste_percentage?: number | null
          yield_percentage?: number | null
        }
        Relationships: []
      }
      reminder_settings: {
        Row: {
          business_profile_id: string | null
          confirmation_hours_before: number | null
          created_at: string | null
          email_api_key_encrypted: string | null
          email_confirmation_template: string | null
          email_enabled: boolean | null
          email_from_address: string | null
          email_provider: string | null
          email_reminder_template: string | null
          id: string
          reminder_hours_before: number | null
          sms_api_key_encrypted: string | null
          sms_confirmation_template: string | null
          sms_enabled: boolean | null
          sms_from_number: string | null
          sms_provider: string | null
          sms_reminder_template: string | null
          updated_at: string | null
        }
        Insert: {
          business_profile_id?: string | null
          confirmation_hours_before?: number | null
          created_at?: string | null
          email_api_key_encrypted?: string | null
          email_confirmation_template?: string | null
          email_enabled?: boolean | null
          email_from_address?: string | null
          email_provider?: string | null
          email_reminder_template?: string | null
          id?: string
          reminder_hours_before?: number | null
          sms_api_key_encrypted?: string | null
          sms_confirmation_template?: string | null
          sms_enabled?: boolean | null
          sms_from_number?: string | null
          sms_provider?: string | null
          sms_reminder_template?: string | null
          updated_at?: string | null
        }
        Update: {
          business_profile_id?: string | null
          confirmation_hours_before?: number | null
          created_at?: string | null
          email_api_key_encrypted?: string | null
          email_confirmation_template?: string | null
          email_enabled?: boolean | null
          email_from_address?: string | null
          email_provider?: string | null
          email_reminder_template?: string | null
          id?: string
          reminder_hours_before?: number | null
          sms_api_key_encrypted?: string | null
          sms_confirmation_template?: string | null
          sms_enabled?: boolean | null
          sms_from_number?: string | null
          sms_provider?: string | null
          sms_reminder_template?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reminder_settings_business_profile_id_fkey"
            columns: ["business_profile_id"]
            isOneToOne: true
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rental_items: {
        Row: {
          condition: string | null
          created_at: string | null
          daily_rate: number | null
          deposit_amount: number | null
          description: string | null
          hourly_rate: number | null
          id: string
          images: Json | null
          is_active: boolean | null
          item_name: string
          item_type: string
          max_rental_duration_days: number | null
          min_rental_duration_hours: number | null
          monthly_rate: number | null
          quantity_available: number | null
          specifications: Json | null
          updated_at: string | null
          weekly_rate: number | null
        }
        Insert: {
          condition?: string | null
          created_at?: string | null
          daily_rate?: number | null
          deposit_amount?: number | null
          description?: string | null
          hourly_rate?: number | null
          id?: string
          images?: Json | null
          is_active?: boolean | null
          item_name: string
          item_type: string
          max_rental_duration_days?: number | null
          min_rental_duration_hours?: number | null
          monthly_rate?: number | null
          quantity_available?: number | null
          specifications?: Json | null
          updated_at?: string | null
          weekly_rate?: number | null
        }
        Update: {
          condition?: string | null
          created_at?: string | null
          daily_rate?: number | null
          deposit_amount?: number | null
          description?: string | null
          hourly_rate?: number | null
          id?: string
          images?: Json | null
          is_active?: boolean | null
          item_name?: string
          item_type?: string
          max_rental_duration_days?: number | null
          min_rental_duration_hours?: number | null
          monthly_rate?: number | null
          quantity_available?: number | null
          specifications?: Json | null
          updated_at?: string | null
          weekly_rate?: number | null
        }
        Relationships: []
      }
      rental_reservations: {
        Row: {
          actual_pickup_datetime: string | null
          actual_return_datetime: string | null
          checkout_condition: string | null
          created_at: string | null
          created_by: string | null
          customer_id: string
          damage_fees: number | null
          damage_report: string | null
          deposit_paid: number | null
          end_datetime: string
          id: string
          internal_notes: string | null
          item_id: string
          late_fees: number | null
          notes: string | null
          payment_method: string | null
          payment_status: string | null
          rate_type: string
          rental_rate: number
          return_condition: string | null
          start_datetime: string
          status: string
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          actual_pickup_datetime?: string | null
          actual_return_datetime?: string | null
          checkout_condition?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_id: string
          damage_fees?: number | null
          damage_report?: string | null
          deposit_paid?: number | null
          end_datetime: string
          id?: string
          internal_notes?: string | null
          item_id: string
          late_fees?: number | null
          notes?: string | null
          payment_method?: string | null
          payment_status?: string | null
          rate_type?: string
          rental_rate: number
          return_condition?: string | null
          start_datetime: string
          status?: string
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          actual_pickup_datetime?: string | null
          actual_return_datetime?: string | null
          checkout_condition?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_id?: string
          damage_fees?: number | null
          damage_report?: string | null
          deposit_paid?: number | null
          end_datetime?: string
          id?: string
          internal_notes?: string | null
          item_id?: string
          late_fees?: number | null
          notes?: string | null
          payment_method?: string | null
          payment_status?: string | null
          rate_type?: string
          rental_rate?: number
          return_condition?: string | null
          start_datetime?: string
          status?: string
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rental_reservations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rental_reservations_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "rental_items"
            referencedColumns: ["id"]
          },
        ]
      }
      reservations: {
        Row: {
          contact_phone: string | null
          created_at: string | null
          customer_id: string | null
          id: string
          notes: string | null
          party_size: number
          reservation_date: string
          reservation_time: string
          special_requests: string | null
          status: string | null
          table_id: string | null
          updated_at: string | null
        }
        Insert: {
          contact_phone?: string | null
          created_at?: string | null
          customer_id?: string | null
          id?: string
          notes?: string | null
          party_size: number
          reservation_date: string
          reservation_time: string
          special_requests?: string | null
          status?: string | null
          table_id?: string | null
          updated_at?: string | null
        }
        Update: {
          contact_phone?: string | null
          created_at?: string | null
          customer_id?: string | null
          id?: string
          notes?: string | null
          party_size?: number
          reservation_date?: string
          reservation_time?: string
          special_requests?: string | null
          status?: string | null
          table_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reservations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "tables"
            referencedColumns: ["id"]
          },
        ]
      }
      rls_policy_backups: {
        Row: {
          check_clause: string | null
          command: string | null
          created_at: string | null
          definition: string | null
          id: number
          policy_name: string | null
          roles: string | null
          table_name: string | null
          table_schema: string | null
        }
        Insert: {
          check_clause?: string | null
          command?: string | null
          created_at?: string | null
          definition?: string | null
          id?: number
          policy_name?: string | null
          roles?: string | null
          table_name?: string | null
          table_schema?: string | null
        }
        Update: {
          check_clause?: string | null
          command?: string | null
          created_at?: string | null
          definition?: string | null
          id?: number
          policy_name?: string | null
          roles?: string | null
          table_name?: string | null
          table_schema?: string | null
        }
        Relationships: []
      }
      role_review_schedule: {
        Row: {
          assigned_date: string
          created_at: string | null
          id: string
          last_review_date: string | null
          next_review_date: string
          review_frequency_days: number | null
          review_notes: string | null
          review_status: string | null
          reviewer_user_id: string | null
          role: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          assigned_date: string
          created_at?: string | null
          id?: string
          last_review_date?: string | null
          next_review_date: string
          review_frequency_days?: number | null
          review_notes?: string | null
          review_status?: string | null
          reviewer_user_id?: string | null
          role: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_date?: string
          created_at?: string | null
          id?: string
          last_review_date?: string | null
          next_review_date?: string
          review_frequency_days?: number | null
          review_notes?: string | null
          review_status?: string | null
          reviewer_user_id?: string | null
          role?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      sale_items: {
        Row: {
          created_at: string | null
          id: string
          item_id: string | null
          notes: string | null
          product_id: string | null
          quantity: number
          sale_id: string
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_id?: string | null
          notes?: string | null
          product_id?: string | null
          quantity: number
          sale_id: string
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          id?: string
          item_id?: string | null
          notes?: string | null
          product_id?: string | null
          quantity?: number
          sale_id?: string
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "sale_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_materials_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_materials_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "materials_trends_summary"
            referencedColumns: ["material_id"]
          },
        ]
      }
      sale_payments: {
        Row: {
          amount: number
          authorized_at: string | null
          captured_at: string | null
          cash_session_id: string | null
          created_at: string
          created_by: string | null
          currency: string | null
          id: string
          idempotency_key: string | null
          initiated_at: string
          journal_entry_id: string
          metadata: Json | null
          parent_payment_id: string | null
          payment_method_id: string | null
          payment_type: string
          refunded_at: string | null
          sale_id: string
          settled_at: string | null
          shift_id: string | null
          status: Database["public"]["Enums"]["payment_status"]
          status_history: Json | null
          submitted_for_settlement_at: string | null
          transaction_type: Database["public"]["Enums"]["payment_transaction_type"]
          updated_at: string | null
          updated_by: string | null
          voided_at: string | null
        }
        Insert: {
          amount: number
          authorized_at?: string | null
          captured_at?: string | null
          cash_session_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          id?: string
          idempotency_key?: string | null
          initiated_at?: string
          journal_entry_id: string
          metadata?: Json | null
          parent_payment_id?: string | null
          payment_method_id?: string | null
          payment_type: string
          refunded_at?: string | null
          sale_id: string
          settled_at?: string | null
          shift_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          status_history?: Json | null
          submitted_for_settlement_at?: string | null
          transaction_type?: Database["public"]["Enums"]["payment_transaction_type"]
          updated_at?: string | null
          updated_by?: string | null
          voided_at?: string | null
        }
        Update: {
          amount?: number
          authorized_at?: string | null
          captured_at?: string | null
          cash_session_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          id?: string
          idempotency_key?: string | null
          initiated_at?: string
          journal_entry_id?: string
          metadata?: Json | null
          parent_payment_id?: string | null
          payment_method_id?: string | null
          payment_type?: string
          refunded_at?: string | null
          sale_id?: string
          settled_at?: string | null
          shift_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          status_history?: Json | null
          submitted_for_settlement_at?: string | null
          transaction_type?: Database["public"]["Enums"]["payment_transaction_type"]
          updated_at?: string | null
          updated_by?: string | null
          voided_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sale_payments_cash_session_id_fkey"
            columns: ["cash_session_id"]
            isOneToOne: false
            referencedRelation: "cash_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_payments_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_payments_parent_payment_id_fkey"
            columns: ["parent_payment_id"]
            isOneToOne: false
            referencedRelation: "sale_payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_payments_parent_payment_id_fkey"
            columns: ["parent_payment_id"]
            isOneToOne: false
            referencedRelation: "v_payments_pending_settlement"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_payments_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods_config"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_payments_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_payments_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "operational_shifts"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          assigned_staff_id: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          created_at: string | null
          customer_id: string | null
          discount: number | null
          id: string
          journal_entry_id: string | null
          location_id: string | null
          notes: string | null
          order_status: string | null
          order_type: string | null
          payment_method: string | null
          payment_status: string | null
          reminder_sent_24h: string | null
          reminder_sent_2h: string | null
          scheduled_time: string | null
          service_id: string | null
          status: string | null
          subtotal: number
          table_id: string | null
          tax: number
          total: number
          updated_at: string | null
        }
        Insert: {
          assigned_staff_id?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          customer_id?: string | null
          discount?: number | null
          id?: string
          journal_entry_id?: string | null
          location_id?: string | null
          notes?: string | null
          order_status?: string | null
          order_type?: string | null
          payment_method?: string | null
          payment_status?: string | null
          reminder_sent_24h?: string | null
          reminder_sent_2h?: string | null
          scheduled_time?: string | null
          service_id?: string | null
          status?: string | null
          subtotal?: number
          table_id?: string | null
          tax?: number
          total?: number
          updated_at?: string | null
        }
        Update: {
          assigned_staff_id?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          customer_id?: string | null
          discount?: number | null
          id?: string
          journal_entry_id?: string | null
          location_id?: string | null
          notes?: string | null
          order_status?: string | null
          order_type?: string | null
          payment_method?: string | null
          payment_status?: string | null
          reminder_sent_24h?: string | null
          reminder_sent_2h?: string | null
          scheduled_time?: string | null
          service_id?: string | null
          status?: string | null
          subtotal?: number
          table_id?: string | null
          tax?: number
          total?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_assigned_staff_id_fkey"
            columns: ["assigned_staff_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      schedules: {
        Row: {
          created_at: string | null
          created_by: string | null
          end_date: string
          id: string
          name: string
          notes: string | null
          start_date: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          end_date: string
          id?: string
          name: string
          notes?: string | null
          start_date: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          end_date?: string
          id?: string
          name?: string
          notes?: string | null
          start_date?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          access_level: string | null
          action_type: string
          additional_context: Json | null
          created_at: string | null
          error_message: string | null
          id: string
          ip_address: unknown
          policy_name: string | null
          resource_id: string | null
          resource_table: string | null
          session_id: string | null
          success: boolean | null
          user_agent: string | null
          user_email: string | null
          user_id: string | null
          user_role: string | null
        }
        Insert: {
          access_level?: string | null
          action_type: string
          additional_context?: Json | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          ip_address?: unknown
          policy_name?: string | null
          resource_id?: string | null
          resource_table?: string | null
          session_id?: string | null
          success?: boolean | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          user_role?: string | null
        }
        Update: {
          access_level?: string | null
          action_type?: string
          additional_context?: Json | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          ip_address?: unknown
          policy_name?: string | null
          resource_id?: string | null
          resource_table?: string | null
          session_id?: string | null
          success?: boolean | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          user_role?: string | null
        }
        Relationships: []
      }
      service_contexts: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          key: string
          name: string
          organization_id: string
          requires_feature: string | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          key: string
          name: string
          organization_id: string
          requires_feature?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          key?: string
          name?: string
          organization_id?: string
          requires_feature?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      service_events: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          notes: string | null
          party_id: string
          server_id: string | null
          table_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          notes?: string | null
          party_id: string
          server_id?: string | null
          table_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          notes?: string | null
          party_id?: string
          server_id?: string | null
          table_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_events_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "parties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_events_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "tables"
            referencedColumns: ["id"]
          },
        ]
      }
      service_packages: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          package_name: string
          package_price: number
          per_session_price: number
          service_ids: string[]
          total_sessions: number
          updated_at: string | null
          validity_days: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          package_name: string
          package_price: number
          per_session_price: number
          service_ids: string[]
          total_sessions: number
          updated_at?: string | null
          validity_days?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          package_name?: string
          package_price?: number
          per_session_price?: number
          service_ids?: string[]
          total_sessions?: number
          updated_at?: string | null
          validity_days?: number | null
        }
        Relationships: []
      }
      shift_payments: {
        Row: {
          amount: number
          created_at: string
          employee_id: string | null
          id: string
          notes: string | null
          payment_date: string
          payment_method: string
          reference: string | null
          sale_id: string | null
          shift_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          employee_id?: string | null
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method: string
          reference?: string | null
          sale_id?: string | null
          shift_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          employee_id?: string | null
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string
          reference?: string | null
          sale_id?: string | null
          shift_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shift_payments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_payments_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_payments_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "operational_shifts"
            referencedColumns: ["id"]
          },
        ]
      }
      shift_schedules: {
        Row: {
          break_duration: number | null
          created_at: string | null
          date: string
          employee_id: string
          end_time: string
          hourly_rate: number | null
          id: string
          notes: string | null
          position: string | null
          schedule_id: string | null
          start_time: string
          status: Database["public"]["Enums"]["shift_status_enum"] | null
          total_hours: number | null
          total_pay: number | null
          updated_at: string | null
        }
        Insert: {
          break_duration?: number | null
          created_at?: string | null
          date: string
          employee_id: string
          end_time: string
          hourly_rate?: number | null
          id?: string
          notes?: string | null
          position?: string | null
          schedule_id?: string | null
          start_time: string
          status?: Database["public"]["Enums"]["shift_status_enum"] | null
          total_hours?: number | null
          total_pay?: number | null
          updated_at?: string | null
        }
        Update: {
          break_duration?: number | null
          created_at?: string | null
          date?: string
          employee_id?: string
          end_time?: string
          hourly_rate?: number | null
          id?: string
          notes?: string | null
          position?: string | null
          schedule_id?: string | null
          start_time?: string
          status?: Database["public"]["Enums"]["shift_status_enum"] | null
          total_hours?: number | null
          total_pay?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shift_schedules_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_schedules_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      shift_templates: {
        Row: {
          created_at: string | null
          days_of_week: number[]
          end_time: string
          hourly_rate: number | null
          id: string
          is_active: boolean | null
          max_employees: number | null
          min_employees: number | null
          name: string
          role: string | null
          start_time: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          days_of_week: number[]
          end_time: string
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          max_employees?: number | null
          min_employees?: number | null
          name: string
          role?: string | null
          start_time: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          days_of_week?: number[]
          end_time?: string
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          max_employees?: number | null
          min_employees?: number | null
          name?: string
          role?: string | null
          start_time?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      shifts: {
        Row: {
          break_duration: number | null
          created_at: string | null
          date: string | null
          employee_id: string
          end_time: string
          hourly_rate: number | null
          id: string
          location_id: string | null
          notes: string | null
          position: string | null
          role: string | null
          start_time: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          break_duration?: number | null
          created_at?: string | null
          date?: string | null
          employee_id: string
          end_time: string
          hourly_rate?: number | null
          id?: string
          location_id?: string | null
          notes?: string | null
          position?: string | null
          role?: string | null
          start_time: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          break_duration?: number | null
          created_at?: string | null
          date?: string | null
          employee_id?: string
          end_time?: string
          hourly_rate?: number | null
          id?: string
          location_id?: string | null
          notes?: string | null
          position?: string | null
          role?: string | null
          start_time?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shifts_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shifts_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      split_bills: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          number_of_splits: number
          order_id: string | null
          sale_id: string
          split_type: string
          status: string | null
          total_amount: number
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          number_of_splits: number
          order_id?: string | null
          sale_id: string
          split_type: string
          status?: string | null
          total_amount: number
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          number_of_splits?: number
          order_id?: string | null
          sale_id?: string
          split_type?: string
          status?: string | null
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "split_bills_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_policies: {
        Row: {
          attendance_grace_period_minutes: number | null
          break_duration_minutes: number | null
          break_frequency_hours: number | null
          certification_tracking_enabled: boolean | null
          created_at: string | null
          created_by: string | null
          default_hourly_rates: Json | null
          departments: Json
          exit_interview_required: boolean | null
          id: string
          is_system: boolean | null
          labor_costing_config: Json | null
          late_threshold_minutes: number | null
          mandatory_certifications: Json | null
          max_late_arrivals_per_month: number | null
          max_unexcused_absences_per_month: number | null
          onboarding_checklist_required: boolean | null
          onboarding_duration_days: number | null
          overtime_calculation_period: string | null
          overtime_enabled: boolean | null
          overtime_multiplier: number | null
          overtime_threshold_hours: number | null
          performance_review_frequency_days: number | null
          positions: Json
          shift_swap_advance_notice_hours: number | null
          shift_swap_approval_required: boolean | null
          shift_swap_limit_per_month: number | null
          termination_notice_period_days: number | null
          time_clock_rounding_minutes: number | null
          training_requirements: Json | null
          unpaid_break_threshold: number | null
          updated_at: string | null
        }
        Insert: {
          attendance_grace_period_minutes?: number | null
          break_duration_minutes?: number | null
          break_frequency_hours?: number | null
          certification_tracking_enabled?: boolean | null
          created_at?: string | null
          created_by?: string | null
          default_hourly_rates?: Json | null
          departments?: Json
          exit_interview_required?: boolean | null
          id?: string
          is_system?: boolean | null
          labor_costing_config?: Json | null
          late_threshold_minutes?: number | null
          mandatory_certifications?: Json | null
          max_late_arrivals_per_month?: number | null
          max_unexcused_absences_per_month?: number | null
          onboarding_checklist_required?: boolean | null
          onboarding_duration_days?: number | null
          overtime_calculation_period?: string | null
          overtime_enabled?: boolean | null
          overtime_multiplier?: number | null
          overtime_threshold_hours?: number | null
          performance_review_frequency_days?: number | null
          positions?: Json
          shift_swap_advance_notice_hours?: number | null
          shift_swap_approval_required?: boolean | null
          shift_swap_limit_per_month?: number | null
          termination_notice_period_days?: number | null
          time_clock_rounding_minutes?: number | null
          training_requirements?: Json | null
          unpaid_break_threshold?: number | null
          updated_at?: string | null
        }
        Update: {
          attendance_grace_period_minutes?: number | null
          break_duration_minutes?: number | null
          break_frequency_hours?: number | null
          certification_tracking_enabled?: boolean | null
          created_at?: string | null
          created_by?: string | null
          default_hourly_rates?: Json | null
          departments?: Json
          exit_interview_required?: boolean | null
          id?: string
          is_system?: boolean | null
          labor_costing_config?: Json | null
          late_threshold_minutes?: number | null
          mandatory_certifications?: Json | null
          max_late_arrivals_per_month?: number | null
          max_unexcused_absences_per_month?: number | null
          onboarding_checklist_required?: boolean | null
          onboarding_duration_days?: number | null
          overtime_calculation_period?: string | null
          overtime_enabled?: boolean | null
          overtime_multiplier?: number | null
          overtime_threshold_hours?: number | null
          performance_review_frequency_days?: number | null
          positions?: Json
          shift_swap_advance_notice_hours?: number | null
          shift_swap_approval_required?: boolean | null
          shift_swap_limit_per_month?: number | null
          termination_notice_period_days?: number | null
          time_clock_rounding_minutes?: number | null
          training_requirements?: Json | null
          unpaid_break_threshold?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      staffing_requirements: {
        Row: {
          cost_center: string | null
          created_at: string | null
          day_of_week: number
          department: string | null
          effective_date: string | null
          id: string
          is_active: boolean | null
          max_staff: number
          min_staff: number
          notes: string | null
          optimal_staff: number
          position: string
          priority_level: string | null
          skills_required: string[] | null
          time_slot: string
          updated_at: string | null
        }
        Insert: {
          cost_center?: string | null
          created_at?: string | null
          day_of_week: number
          department?: string | null
          effective_date?: string | null
          id?: string
          is_active?: boolean | null
          max_staff?: number
          min_staff?: number
          notes?: string | null
          optimal_staff?: number
          position: string
          priority_level?: string | null
          skills_required?: string[] | null
          time_slot: string
          updated_at?: string | null
        }
        Update: {
          cost_center?: string | null
          created_at?: string | null
          day_of_week?: number
          department?: string | null
          effective_date?: string | null
          id?: string
          is_active?: boolean | null
          max_staff?: number
          min_staff?: number
          notes?: string | null
          optimal_staff?: number
          position?: string
          priority_level?: string | null
          skills_required?: string[] | null
          time_slot?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      stock_entries: {
        Row: {
          batch_number: string | null
          created_at: string | null
          delivery_date: string | null
          entry_type: string | null
          expiry_date: string | null
          id: string
          invoice_number: string | null
          item_id: string
          location_id: string | null
          metadata: Json | null
          note: string | null
          purchase_date: string | null
          quality_rating: number | null
          quantity: number
          supplier_id: string | null
          unit_cost: number | null
          updated_at: string | null
        }
        Insert: {
          batch_number?: string | null
          created_at?: string | null
          delivery_date?: string | null
          entry_type?: string | null
          expiry_date?: string | null
          id?: string
          invoice_number?: string | null
          item_id: string
          location_id?: string | null
          metadata?: Json | null
          note?: string | null
          purchase_date?: string | null
          quality_rating?: number | null
          quantity: number
          supplier_id?: string | null
          unit_cost?: number | null
          updated_at?: string | null
        }
        Update: {
          batch_number?: string | null
          created_at?: string | null
          delivery_date?: string | null
          entry_type?: string | null
          expiry_date?: string | null
          id?: string
          invoice_number?: string | null
          item_id?: string
          location_id?: string | null
          metadata?: Json | null
          note?: string | null
          purchase_date?: string | null
          quality_rating?: number | null
          quantity?: number
          supplier_id?: string | null
          unit_cost?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_entries_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_entries_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "materials_trends_summary"
            referencedColumns: ["material_id"]
          },
          {
            foreignKeyName: "stock_entries_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_entries_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          allow_usage_charges: boolean
          amount: number
          auto_collect: boolean
          auto_invoice: boolean
          billing_cycles: number | null
          billing_type: string
          created_at: string
          created_by: string | null
          currency: string
          custom_interval: number | null
          custom_interval_type: string | null
          customer_id: string
          description: string | null
          end_date: string | null
          id: string
          internal_notes: string | null
          max_retries: number
          payment_terms: string
          prorate: boolean
          reminder_days: number[]
          retry_failed_payments: boolean
          start_date: string
          status: string
          subscription_name: string
          suspend_on_failure: boolean
          tax_included: boolean
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          allow_usage_charges?: boolean
          amount: number
          auto_collect?: boolean
          auto_invoice?: boolean
          billing_cycles?: number | null
          billing_type: string
          created_at?: string
          created_by?: string | null
          currency?: string
          custom_interval?: number | null
          custom_interval_type?: string | null
          customer_id: string
          description?: string | null
          end_date?: string | null
          id?: string
          internal_notes?: string | null
          max_retries?: number
          payment_terms?: string
          prorate?: boolean
          reminder_days?: number[]
          retry_failed_payments?: boolean
          start_date: string
          status?: string
          subscription_name: string
          suspend_on_failure?: boolean
          tax_included?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          allow_usage_charges?: boolean
          amount?: number
          auto_collect?: boolean
          auto_invoice?: boolean
          billing_cycles?: number | null
          billing_type?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          custom_interval?: number | null
          custom_interval_type?: string | null
          customer_id?: string
          description?: string | null
          end_date?: string | null
          id?: string
          internal_notes?: string | null
          max_retries?: number
          payment_terms?: string
          prorate?: boolean
          reminder_days?: number[]
          retry_failed_payments?: boolean
          start_date?: string
          status?: string
          subscription_name?: string
          suspend_on_failure?: boolean
          tax_included?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_order_items: {
        Row: {
          created_at: string
          id: string
          material_id: string
          notes: string | null
          quantity: number
          received_quantity: number | null
          supplier_order_id: string
          total_cost: number | null
          unit_cost: number
        }
        Insert: {
          created_at?: string
          id?: string
          material_id: string
          notes?: string | null
          quantity: number
          received_quantity?: number | null
          supplier_order_id: string
          total_cost?: number | null
          unit_cost: number
        }
        Update: {
          created_at?: string
          id?: string
          material_id?: string
          notes?: string | null
          quantity?: number
          received_quantity?: number | null
          supplier_order_id?: string
          total_cost?: number | null
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "supplier_order_items_supplier_order_id_fkey"
            columns: ["supplier_order_id"]
            isOneToOne: false
            referencedRelation: "supplier_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_order_materials_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_order_materials_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials_trends_summary"
            referencedColumns: ["material_id"]
          },
        ]
      }
      supplier_orders: {
        Row: {
          actual_delivery_date: string | null
          approved_at: string | null
          approved_by: string | null
          cancelled_at: string | null
          created_at: string
          created_by: string | null
          expected_delivery_date: string | null
          id: string
          internal_notes: string | null
          journal_entry_id: string | null
          notes: string | null
          po_number: string
          received_at: string | null
          received_by: string | null
          status: string
          supplier_id: string
          total_amount: number | null
          updated_at: string
        }
        Insert: {
          actual_delivery_date?: string | null
          approved_at?: string | null
          approved_by?: string | null
          cancelled_at?: string | null
          created_at?: string
          created_by?: string | null
          expected_delivery_date?: string | null
          id?: string
          internal_notes?: string | null
          journal_entry_id?: string | null
          notes?: string | null
          po_number: string
          received_at?: string | null
          received_by?: string | null
          status?: string
          supplier_id: string
          total_amount?: number | null
          updated_at?: string
        }
        Update: {
          actual_delivery_date?: string | null
          approved_at?: string | null
          approved_by?: string | null
          cancelled_at?: string | null
          created_at?: string
          created_by?: string | null
          expected_delivery_date?: string | null
          id?: string
          internal_notes?: string | null
          journal_entry_id?: string | null
          notes?: string | null
          po_number?: string
          received_at?: string | null
          received_by?: string | null
          status?: string
          supplier_id?: string
          total_amount?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_orders_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          contact_person: string | null
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          payment_terms: string | null
          phone: string | null
          rating: number | null
          tax_id: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          rating?: number | null
          tax_id?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          rating?: number | null
          tax_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          created_at: string | null
          date_format: string
          id: string
          language: string
          theme: string
          time_format: string
          timezone: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          date_format?: string
          id?: string
          language?: string
          theme?: string
          time_format?: string
          timezone?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          date_format?: string
          id?: string
          language?: string
          theme?: string
          time_format?: string
          timezone?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      tables: {
        Row: {
          capacity: number
          color_code: string | null
          created_at: string | null
          daily_revenue: number | null
          id: string
          is_active: boolean | null
          location_x: number | null
          location_y: number | null
          name: string | null
          number: number
          priority: string | null
          section: string | null
          status: string | null
          turn_count: number | null
          updated_at: string | null
        }
        Insert: {
          capacity?: number
          color_code?: string | null
          created_at?: string | null
          daily_revenue?: number | null
          id?: string
          is_active?: boolean | null
          location_x?: number | null
          location_y?: number | null
          name?: string | null
          number: number
          priority?: string | null
          section?: string | null
          status?: string | null
          turn_count?: number | null
          updated_at?: string | null
        }
        Update: {
          capacity?: number
          color_code?: string | null
          created_at?: string | null
          daily_revenue?: number | null
          id?: string
          is_active?: boolean | null
          location_x?: number | null
          location_y?: number | null
          name?: string | null
          number?: number
          priority?: string | null
          section?: string | null
          status?: string | null
          turn_count?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tax_periods: {
        Row: {
          compras_netas: number | null
          created_at: string | null
          fecha_presentacion: string | null
          id: string
          iva_credito_fiscal: number | null
          iva_debito_fiscal: number | null
          location_id: string | null
          periodo: string
          presentado: boolean | null
          saldo_a_favor: number | null
          saldo_a_pagar: number | null
          tipo: string
          updated_at: string | null
          ventas_netas: number | null
        }
        Insert: {
          compras_netas?: number | null
          created_at?: string | null
          fecha_presentacion?: string | null
          id?: string
          iva_credito_fiscal?: number | null
          iva_debito_fiscal?: number | null
          location_id?: string | null
          periodo: string
          presentado?: boolean | null
          saldo_a_favor?: number | null
          saldo_a_pagar?: number | null
          tipo: string
          updated_at?: string | null
          ventas_netas?: number | null
        }
        Update: {
          compras_netas?: number | null
          created_at?: string | null
          fecha_presentacion?: string | null
          id?: string
          iva_credito_fiscal?: number | null
          iva_debito_fiscal?: number | null
          location_id?: string | null
          periodo?: string
          presentado?: boolean | null
          saldo_a_favor?: number | null
          saldo_a_pagar?: number | null
          tipo?: string
          updated_at?: string | null
          ventas_netas?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tax_periods_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      tax_reports: {
        Row: {
          created_at: string | null
          file_path: string | null
          generated_at: string | null
          id: string
          is_consolidated: boolean | null
          location_id: string | null
          period_month: number | null
          period_year: number
          report_type: string
          status: string | null
          submitted_at: string | null
        }
        Insert: {
          created_at?: string | null
          file_path?: string | null
          generated_at?: string | null
          id?: string
          is_consolidated?: boolean | null
          location_id?: string | null
          period_month?: number | null
          period_year: number
          report_type: string
          status?: string | null
          submitted_at?: string | null
        }
        Update: {
          created_at?: string | null
          file_path?: string | null
          generated_at?: string | null
          id?: string
          is_consolidated?: boolean | null
          location_id?: string | null
          period_month?: number | null
          period_year?: number
          report_type?: string
          status?: string | null
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tax_reports_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          accepts_appointments: boolean | null
          allow_online_booking: boolean | null
          appointment_notes: string | null
          attendance_rate: number | null
          availability: Json | null
          available_days: string[] | null
          avatar_url: string | null
          booking_buffer_minutes: number | null
          can_work_multiple_locations: boolean
          certifications: string[] | null
          checked_in: boolean | null
          checked_in_at: string | null
          completed_tasks: number | null
          created_at: string | null
          department: string | null
          driver_rating: number | null
          email: string | null
          employment_status: string | null
          first_name: string
          hire_date: string | null
          home_location_id: string | null
          hourly_rate: number | null
          id: string
          is_available: boolean | null
          job_role_id: string | null
          last_name: string
          license_number: string | null
          max_appointments_per_day: number | null
          name: string | null
          notes: string | null
          performance_score: number | null
          phone: string | null
          position: string
          professional_bio: string | null
          salary: number | null
          services_provided: string[] | null
          shift_preference:
            | Database["public"]["Enums"]["shift_preference_enum"]
            | null
          skills: string[] | null
          status: string | null
          total_deliveries: number | null
          training_completed: string[] | null
          updated_at: string | null
          user_id: string | null
          vehicle_type: string | null
          weekly_hours: number | null
          years_of_experience: number | null
        }
        Insert: {
          accepts_appointments?: boolean | null
          allow_online_booking?: boolean | null
          appointment_notes?: string | null
          attendance_rate?: number | null
          availability?: Json | null
          available_days?: string[] | null
          avatar_url?: string | null
          booking_buffer_minutes?: number | null
          can_work_multiple_locations?: boolean
          certifications?: string[] | null
          checked_in?: boolean | null
          checked_in_at?: string | null
          completed_tasks?: number | null
          created_at?: string | null
          department?: string | null
          driver_rating?: number | null
          email?: string | null
          employment_status?: string | null
          first_name: string
          hire_date?: string | null
          home_location_id?: string | null
          hourly_rate?: number | null
          id?: string
          is_available?: boolean | null
          job_role_id?: string | null
          last_name: string
          license_number?: string | null
          max_appointments_per_day?: number | null
          name?: string | null
          notes?: string | null
          performance_score?: number | null
          phone?: string | null
          position: string
          professional_bio?: string | null
          salary?: number | null
          services_provided?: string[] | null
          shift_preference?:
            | Database["public"]["Enums"]["shift_preference_enum"]
            | null
          skills?: string[] | null
          status?: string | null
          total_deliveries?: number | null
          training_completed?: string[] | null
          updated_at?: string | null
          user_id?: string | null
          vehicle_type?: string | null
          weekly_hours?: number | null
          years_of_experience?: number | null
        }
        Update: {
          accepts_appointments?: boolean | null
          allow_online_booking?: boolean | null
          appointment_notes?: string | null
          attendance_rate?: number | null
          availability?: Json | null
          available_days?: string[] | null
          avatar_url?: string | null
          booking_buffer_minutes?: number | null
          can_work_multiple_locations?: boolean
          certifications?: string[] | null
          checked_in?: boolean | null
          checked_in_at?: string | null
          completed_tasks?: number | null
          created_at?: string | null
          department?: string | null
          driver_rating?: number | null
          email?: string | null
          employment_status?: string | null
          first_name?: string
          hire_date?: string | null
          home_location_id?: string | null
          hourly_rate?: number | null
          id?: string
          is_available?: boolean | null
          job_role_id?: string | null
          last_name?: string
          license_number?: string | null
          max_appointments_per_day?: number | null
          name?: string | null
          notes?: string | null
          performance_score?: number | null
          phone?: string | null
          position?: string
          professional_bio?: string | null
          salary?: number | null
          services_provided?: string[] | null
          shift_preference?:
            | Database["public"]["Enums"]["shift_preference_enum"]
            | null
          skills?: string[] | null
          status?: string | null
          total_deliveries?: number | null
          training_completed?: string[] | null
          updated_at?: string | null
          user_id?: string | null
          vehicle_type?: string | null
          weekly_hours?: number | null
          years_of_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_home_location_id_fkey"
            columns: ["home_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_job_role_id_fkey"
            columns: ["job_role_id"]
            isOneToOne: false
            referencedRelation: "job_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      tiered_pricings: {
        Row: {
          applicable_customers: string[] | null
          applicable_products: string[] | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          type: string
          updated_at: string | null
        }
        Insert: {
          applicable_customers?: string[] | null
          applicable_products?: string[] | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          type: string
          updated_at?: string | null
        }
        Update: {
          applicable_customers?: string[] | null
          applicable_products?: string[] | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      time_entries: {
        Row: {
          created_at: string | null
          created_by: string | null
          employee_id: string
          entry_type: Database["public"]["Enums"]["entry_type_enum"] | null
          id: string
          is_offline: boolean | null
          location: Json | null
          notes: string | null
          schedule_id: string | null
          sync_status: Database["public"]["Enums"]["sync_status_enum"] | null
          timestamp: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          employee_id: string
          entry_type?: Database["public"]["Enums"]["entry_type_enum"] | null
          id?: string
          is_offline?: boolean | null
          location?: Json | null
          notes?: string | null
          schedule_id?: string | null
          sync_status?: Database["public"]["Enums"]["sync_status_enum"] | null
          timestamp?: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          employee_id?: string
          entry_type?: Database["public"]["Enums"]["entry_type_enum"] | null
          id?: string
          is_offline?: boolean | null
          location?: Json | null
          notes?: string | null
          schedule_id?: string | null
          sync_status?: Database["public"]["Enums"]["sync_status_enum"] | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "shift_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      time_off_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          employee_id: string
          end_date: string
          id: string
          reason: string | null
          request_type: string
          start_date: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          employee_id: string
          end_date: string
          id?: string
          reason?: string | null
          request_type: string
          start_date: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          employee_id?: string
          end_date?: string
          id?: string
          reason?: string | null
          request_type?: string
          start_date?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "time_off_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievement_progress: {
        Row: {
          achievement_id: string
          created_at: string | null
          current_value: number | null
          id: string
          last_updated: string | null
          metadata: Json | null
          progress_percentage: number | null
          target_value: number
          user_id: string
        }
        Insert: {
          achievement_id: string
          created_at?: string | null
          current_value?: number | null
          id?: string
          last_updated?: string | null
          metadata?: Json | null
          progress_percentage?: number | null
          target_value: number
          user_id: string
        }
        Update: {
          achievement_id?: string
          created_at?: string | null
          current_value?: number | null
          id?: string
          last_updated?: string | null
          metadata?: Json | null
          progress_percentage?: number | null
          target_value?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievement_progress_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievement_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          created_at: string | null
          id: string
          progress_data: Json | null
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          achievement_id: string
          created_at?: string | null
          id?: string
          progress_data?: Json | null
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          achievement_id?: string
          created_at?: string | null
          id?: string
          progress_data?: Json | null
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievement_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string | null
          id: string
          preferences: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          preferences?: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          preferences?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          name: string
          permissions: Json
          priority: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          permissions?: Json
          priority?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          permissions?: Json
          priority?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      users_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      walk_in_queue: {
        Row: {
          check_in_time: string | null
          created_at: string | null
          customer_name: string
          customer_phone: string | null
          estimated_wait_minutes: number | null
          id: string
          notified_at: string | null
          party_size: number | null
          queue_position: number | null
          requested_provider_id: string | null
          requested_service: string | null
          seated_at: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          check_in_time?: string | null
          created_at?: string | null
          customer_name: string
          customer_phone?: string | null
          estimated_wait_minutes?: number | null
          id?: string
          notified_at?: string | null
          party_size?: number | null
          queue_position?: number | null
          requested_provider_id?: string | null
          requested_service?: string | null
          seated_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          check_in_time?: string | null
          created_at?: string | null
          customer_name?: string
          customer_phone?: string | null
          estimated_wait_minutes?: number | null
          id?: string
          notified_at?: string | null
          party_size?: number | null
          queue_position?: number | null
          requested_provider_id?: string | null
          requested_service?: string | null
          seated_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      webhook_events: {
        Row: {
          attempts: number
          created_at: string
          created_by: string | null
          error_message: string | null
          event_type: string
          external_id: string | null
          id: string
          payload: Json
          processed_at: string | null
          provider: string
          sale_payment_id: string | null
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          attempts?: number
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          event_type: string
          external_id?: string | null
          id?: string
          payload: Json
          processed_at?: string | null
          provider: string
          sale_payment_id?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          attempts?: number
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          event_type?: string
          external_id?: string | null
          id?: string
          payload?: Json
          processed_at?: string | null
          provider?: string
          sale_payment_id?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "webhook_events_sale_payment_id_fkey"
            columns: ["sale_payment_id"]
            isOneToOne: false
            referencedRelation: "sale_payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "webhook_events_sale_payment_id_fkey"
            columns: ["sale_payment_id"]
            isOneToOne: false
            referencedRelation: "v_payments_pending_settlement"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      account_balances: {
        Row: {
          account_id: string | null
          account_type: string | null
          balance: number | null
          code: string | null
          name: string | null
          normal_balance: string | null
          transaction_count: number | null
        }
        Relationships: []
      }
      customer_segment_overview: {
        Row: {
          avg_lifetime_value: number | null
          avg_order_value: number | null
          avg_visit_frequency: number | null
          customer_count: number | null
          high_churn_risk_count: number | null
          percentage: number | null
          rfm_segment: string | null
          total_segment_value: number | null
          vip_count: number | null
        }
        Relationships: []
      }
      materials_trends_summary: {
        Row: {
          avg_stock_30d: number | null
          calculated_at: string | null
          current_stock: number | null
          current_value: number | null
          days_of_stock: number | null
          entries_count_30d: number | null
          entries_count_90d: number | null
          low_stock_risk: string | null
          material_id: string | null
          material_name: string | null
          min_stock: number | null
          stock_turnover: number | null
          stock_variance_30d: number | null
          total_usage_90d: number | null
          unit: string | null
          unit_cost: number | null
          usage_pattern: string | null
        }
        Relationships: []
      }
      money_location_balances: {
        Row: {
          account_code: string | null
          account_id: string | null
          current_balance: number | null
          id: string | null
          last_movement: string | null
          location_type: string | null
          name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "money_locations_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "account_balances"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "money_locations_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_intelligence_summary: {
        Row: {
          base_cost: number | null
          created_at: string | null
          difficulty_level: string | null
          id: string | null
          kitchen_station: string | null
          labor_cost: number | null
          menu_category: string | null
          name: string | null
          overhead_cost: number | null
          popularity_score: number | null
          preparation_time: number | null
          profitability_score: number | null
          recipe_category: string | null
          serving_size: number | null
          updated_at: string | null
          waste_percentage: number | null
          yield_percentage: number | null
        }
        Insert: {
          base_cost?: number | null
          created_at?: string | null
          difficulty_level?: string | null
          id?: string | null
          kitchen_station?: string | null
          labor_cost?: number | null
          menu_category?: string | null
          name?: string | null
          overhead_cost?: number | null
          popularity_score?: number | null
          preparation_time?: number | null
          profitability_score?: number | null
          recipe_category?: string | null
          serving_size?: number | null
          updated_at?: string | null
          waste_percentage?: number | null
          yield_percentage?: number | null
        }
        Update: {
          base_cost?: number | null
          created_at?: string | null
          difficulty_level?: string | null
          id?: string | null
          kitchen_station?: string | null
          labor_cost?: number | null
          menu_category?: string | null
          name?: string | null
          overhead_cost?: number | null
          popularity_score?: number | null
          preparation_time?: number | null
          profitability_score?: number | null
          recipe_category?: string | null
          serving_size?: number | null
          updated_at?: string | null
          waste_percentage?: number | null
          yield_percentage?: number | null
        }
        Relationships: []
      }
      user_roles_view: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          created_at: string | null
          employee_email: string | null
          employee_name: string | null
          employee_position: string | null
          id: string | null
          is_active: boolean | null
          role: string | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: []
      }
      v_payments_pending_settlement: {
        Row: {
          amount: number | null
          authorized_at: string | null
          created_at: string | null
          hours_since_authorization: number | null
          id: string | null
          payment_type: string | null
          sale_id: string | null
          status: Database["public"]["Enums"]["payment_status"] | null
        }
        Insert: {
          amount?: number | null
          authorized_at?: string | null
          created_at?: string | null
          hours_since_authorization?: never
          id?: string | null
          payment_type?: string | null
          sale_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
        }
        Update: {
          amount?: number | null
          authorized_at?: string | null
          created_at?: string | null
          hours_since_authorization?: never
          id?: string | null
          payment_type?: string | null
          sale_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "sale_payments_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      v_sale_payment_summary: {
        Row: {
          last_payment_at: string | null
          net_amount: number | null
          payment_count: number | null
          refund_count: number | null
          sale_id: string | null
          total_payments: number | null
          total_refunds: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sale_payments_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      v_shift_payment_summary: {
        Row: {
          first_transaction_at: string | null
          last_transaction_at: string | null
          net_amount: number | null
          payment_type: string | null
          shift_id: string | null
          total_payments: number | null
          total_refunds: number | null
          transaction_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sale_payments_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "operational_shifts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      calculate_context_cost: {
        Args: {
          p_context_id: string
          p_item_count: number
          p_order_total: number
        }
        Returns: {
          additional_cost: number
          staff_cost: number
          total_cost: number
        }[]
      }
      calculate_customer_rfm_profiles: {
        Args: { analysis_period_days?: number }
        Returns: number
      }
      calculate_employee_hours: {
        Args: { employee_uuid: string; end_date: string; start_date: string }
        Returns: Record<string, unknown>
      }
      calculate_product_availability: {
        Args: { p_product_id: string }
        Returns: number
      }
      calculate_recipe_cost: { Args: { recipe_id: string }; Returns: number }
      calculate_recipe_cost_with_yield: {
        Args: { recipe_id: string }
        Returns: Json
      }
      change_user_role: {
        Args: {
          p_new_role: Database["public"]["Enums"]["user_role"]
          p_reason?: string
          p_target_user_id: string
        }
        Returns: boolean
      }
      check_rental_availability: {
        Args: {
          p_end_datetime: string
          p_item_id: string
          p_start_datetime: string
        }
        Returns: Json
      }
      check_user_access: { Args: { required_role?: string }; Returns: boolean }
      check_user_access_enhanced: {
        Args: {
          required_role?: string
          resource_id?: string
          resource_table?: string
        }
        Returns: boolean
      }
      check_user_is_super_admin: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      cleanup_expired_carts: { Args: never; Returns: number }
      custom_access_token_hook: { Args: { event: Json }; Returns: Json }
      debug_jwt_role: {
        Args: never
        Returns: {
          app_metadata_role: string
          jwt_role: string
          raw_metadata: Json
          user_metadata_role: string
        }[]
      }
      execute_recipe: {
        Args: { batches?: number; recipe_id: string }
        Returns: Json
      }
      expire_old_alerts: { Args: never; Returns: number }
      generate_po_number: { Args: never; Returns: string }
      generate_transfer_number: { Args: never; Returns: string }
      get_account_balance: {
        Args: { p_account_id: string; p_as_of_date?: string }
        Returns: number
      }
      get_active_business_profile: {
        Args: never
        Returns: {
          active_capabilities: Json
          auto_resolved_capabilities: Json | null
          business_name: string
          business_structure: string | null
          business_type: string | null
          completed_milestones: Json
          computed_configuration: Json | null
          country: string | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          email: string | null
          id: string
          is_first_time_dashboard: boolean | null
          onboarding_step: number | null
          organization_id: string | null
          phone: string | null
          selected_activities: Json
          selected_infrastructure: Json
          setup_completed: boolean | null
          setup_completed_at: string | null
          updated_at: string | null
          updated_by: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "business_profiles"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_active_capabilities: { Args: never; Returns: Json }
      get_active_service_contexts: {
        Args: { p_organization_id: string }
        Returns: {
          description: string
          id: string
          is_default: boolean
          key: string
          name: string
          requires_feature: string
          sort_order: number
        }[]
      }
      get_alerts_summary: { Args: { module_context: string }; Returns: Json }
      get_all_alerts_summary: {
        Args: never
        Returns: {
          active_count: number
          critical_count: number
          last_updated: string
          predictive_count: number
          simple_count: number
          smart_count: number
          total_count: number
        }[]
      }
      get_category_stats: {
        Args: never
        Returns: {
          avg_stock: number
          category_name: string
          item_count: number
          total_value: number
        }[]
      }
      get_customer_analytics_dashboard: { Args: never; Returns: Json }
      get_customer_profile_with_rfm: {
        Args: { customer_id: string }
        Returns: Json
      }
      get_customer_rfm_data: {
        Args: never
        Returns: {
          avg_order_value: number
          calculated_at: string
          churn_risk: string
          customer_id: string
          frequency_count: number
          is_vip: boolean
          lifetime_value: number
          loyalty_tier: string
          recency_days: number
          rfm_segment: string
        }[]
      }
      get_dashboard_stats: {
        Args: never
        Returns: {
          low_stock_items: number
          stock_entries_this_month: number
          total_items: number
          total_stock_value: number
        }[]
      }
      get_day: { Args: { ts: string }; Returns: string }
      get_default_location: { Args: never; Returns: string }
      get_equipment_cost_breakdown: {
        Args: { p_equipment_id: string }
        Returns: {
          consumables_per_hour: number
          depreciation_per_hour: number
          energy_per_hour: number
          equipment_name: string
          insurance_per_hour: number
          maintenance_per_hour: number
          overhead_per_hour: number
          total_per_hour: number
        }[]
      }
      get_equipment_hourly_rate: {
        Args: { p_equipment_id: string }
        Returns: number
      }
      get_equipment_metrics: { Args: never; Returns: Json }
      get_inventory_dashboard_stats: { Args: never; Returns: Json }
      get_item_history: {
        Args: { p_item_id: string }
        Returns: {
          event_date: string
          event_type: string
          note: string
          quantity: number
          reference_id: string
          unit_cost: number
        }[]
      }
      get_items_by_category: {
        Args: { category_filter?: string }
        Returns: {
          category_name: string
          item_id: string
          item_name: string
          item_type: string
          stock: number
          unit_cost: number
        }[]
      }
      get_low_stock_alert: {
        Args: { p_threshold?: number }
        Returns: {
          current_stock: number
          days_since_last_entry: number
          estimated_cost: number
          item_id: string
          item_name: string
          item_type: string
          last_stock_entry_date: string
          suggested_order_quantity: number
          threshold_used: number
          unit: string
          unit_cost: number
          urgency_level: string
        }[]
      }
      get_low_stock_alerts: {
        Args: { p_threshold?: number }
        Returns: {
          created_at: string
          current_stock: number
          item_id: string
          item_name: string
          item_type: string
          item_unit: string
          min_stock: number
          suggested_order: number
          urgency: string
        }[]
      }
      get_membership_metrics: { Args: never; Returns: Json }
      get_menu_engineering_matrix: {
        Args: never
        Returns: {
          menu_category: string
          popularity_index: number
          profit: number
          profitability_index: number
          recipe_id: string
          recipe_name: string
          recommendation: string
          revenue: number
          units_sold: number
        }[]
      }
      get_monthly_stats: {
        Args: { p_month: number; p_year: number }
        Returns: {
          month_year: string
          new_items_count: number
          stock_entries_count: number
          stock_entries_value: number
          top_selling_product: string
          total_revenue: number
          total_sales: number
        }[]
      }
      get_new_members_this_month: { Args: never; Returns: number }
      get_next_invoice_number: {
        Args: {
          p_location_id: string
          p_punto_venta: number
          p_tipo_comprobante: string
        }
        Returns: number
      }
      get_product_cost: { Args: { p_product_id: string }; Returns: number }
      get_products_with_availability: {
        Args: never
        Returns: {
          availability: number
          category: string
          components_count: number
          cost: number
          created_at: string
          description: string
          id: string
          is_active: boolean
          name: string
          price: number
          updated_at: string
        }[]
      }
      get_recipe_viability: { Args: { recipe_id: string }; Returns: Json }
      get_recipes_with_costs: {
        Args: never
        Returns: {
          cost_per_unit: number
          id: string
          ingredient_count: number
          instructions: string
          is_viable: boolean
          missing_ingredients: Json
          name: string
          output_item: Json
          output_item_id: string
          output_quantity: number
          preparation_time: number
          total_cost: number
        }[]
      }
      get_rental_metrics: { Args: never; Returns: Json }
      get_role_management_dashboard: {
        Args: never
        Returns: {
          active_users: number
          high_risk_roles: number
          inactive_users: number
          recent_role_changes: number
          roles_needing_review: number
          total_users: number
        }[]
      }
      get_roles_needing_review: {
        Args: never
        Returns: {
          assigned_date: string
          days_overdue: number
          risk_level: string
          role: string
          user_email: string
          user_id: string
        }[]
      }
      get_sales_summary: {
        Args: { p_date_from?: string; p_date_to?: string }
        Returns: {
          avg_sale_amount: number
          top_customer_id: string
          top_customer_name: string
          top_customer_sales: number
          total_revenue: number
          total_sales: number
        }[]
      }
      get_stock_valuation: {
        Args: never
        Returns: {
          current_stock: number
          item_id: string
          item_name: string
          item_type: string
          percentage_of_total: number
          total_value: number
          unit_cost: number
        }[]
      }
      get_supplier_performance: {
        Args: { p_days?: number; p_supplier_id: string }
        Returns: {
          avg_rating: number
          last_order_date: string
          performance_score: number
          supplier_id: string
          supplier_name: string
          total_orders: number
          total_value: number
        }[]
      }
      get_user_achievement_overview: {
        Args: { target_user_id: string }
        Returns: {
          domain: string
          progress_percentage: number
          total_achievements: number
          total_points: number
          unlocked_achievements: number
        }[]
      }
      get_user_role: { Args: never; Returns: string }
      get_user_role_enhanced: { Args: never; Returns: string }
      has_capability: { Args: { capability_id: string }; Returns: boolean }
      increment_equipment_hours: {
        Args: { p_equipment_id: string; p_hours: number }
        Returns: undefined
      }
      is_admin_user: { Args: never; Returns: boolean }
      is_time_slot_available: {
        Args: {
          p_date: string
          p_end_time: string
          p_exclude_appointment_id?: string
          p_provider_id: string
          p_start_time: string
        }
        Returns: boolean
      }
      log_security_event: {
        Args: {
          p_access_level?: string
          p_action_type: string
          p_additional_context?: Json
          p_error_message?: string
          p_policy_name?: string
          p_resource_id?: string
          p_resource_table?: string
          p_success?: boolean
        }
        Returns: undefined
      }
      migrate_session_cart_to_customer: {
        Args: { p_customer_id: string; p_session_id: string }
        Returns: string
      }
      pos_calculate_wait_time_estimate: {
        Args: { party_size: number; time_slot?: string }
        Returns: Json
      }
      pos_create_qr_order: {
        Args: {
          customer_info?: Json
          expiration_hours?: number
          table_id: string
        }
        Returns: Json
      }
      pos_estimate_next_table_available: { Args: never; Returns: Json }
      pos_get_comprehensive_sales_analytics: {
        Args: { date_from?: string; date_to?: string }
        Returns: Json
      }
      pos_get_kitchen_orders: {
        Args: {
          limit_orders?: number
          priority_filter?: string
          station_filter?: string
        }
        Returns: {
          allergy_warnings: string[]
          completion_percentage: number
          customer_waiting_time: number
          estimated_ready_time: string
          estimated_time_remaining: number
          items_completed: number
          items_total: number
          order_id: string
          order_number: string
          order_time: string
          priority: string
          special_instructions: string[]
          station_status: Json
          table_number: string
          urgency_level: string
        }[]
      }
      pos_get_table_performance_analytics: {
        Args: { date_from?: string; date_to?: string }
        Returns: {
          average_turn_time: unknown
          customer_satisfaction: number
          efficiency_score: number
          peak_hours: string[]
          revenue_per_hour: number
          table_id: string
          table_number: string
          total_parties: number
          total_revenue: number
          utilization_rate: number
        }[]
      }
      pos_process_async_operations: {
        Args: { batch_size?: number; max_processing_time_seconds?: number }
        Returns: Json
      }
      pos_process_multiple_payments: {
        Args: { payments_array: Json; sale_id: string }
        Returns: Json
      }
      pos_process_sale_with_order: {
        Args: {
          customer_id?: string
          estimated_prep_time?: number
          items_array?: Json
          note?: string
          order_type?: string
          special_instructions?: string[]
          table_id?: string
          total?: number
        }
        Returns: Json
      }
      pos_update_daily_analytics: { Args: never; Returns: Json }
      pos_update_table_color_codes: { Args: never; Returns: Json }
      process_inventory_transfer: {
        Args: { p_completed_by: string; p_transfer_id: string }
        Returns: Json
      }
      process_rfm_update_queue: { Args: never; Returns: number }
      process_sale: {
        Args: {
          p_customer_id: string
          p_items_array: Json
          p_sale_note?: string
          p_total: number
        }
        Returns: {
          message: string
          sale_id: string
          success: boolean
        }[]
      }
      recalculate_payment_caches: {
        Args: never
        Returns: {
          cash_sessions_updated: number
          shifts_updated: number
        }[]
      }
      refresh_customer_analytics_views: { Args: never; Returns: number }
      refresh_materials_trends: { Args: never; Returns: undefined }
      schedule_role_review: {
        Args: { p_review_frequency_days?: number; p_user_id: string }
        Returns: undefined
      }
      soft_delete_item: { Args: { p_item_id: string }; Returns: boolean }
      test_custom_access_token_hook: {
        Args: { test_user_id: string }
        Returns: Json
      }
      test_function: { Args: never; Returns: string }
      unlock_achievement: {
        Args: {
          progress_data?: Json
          target_achievement_id: string
          target_user_id: string
        }
        Returns: boolean
      }
      update_achievement_progress: {
        Args: {
          metadata?: Json
          new_value: number
          target_achievement_id: string
          target_user_id: string
          target_value: number
        }
        Returns: boolean
      }
      update_driver_stats: {
        Args: { driver_uuid: string; new_rating?: number }
        Returns: undefined
      }
      update_item_stock:
        | {
            Args: { item_id: string; quantity_to_add: number }
            Returns: undefined
          }
        | {
            Args: { p_item_id: string; p_quantity_to_add: number }
            Returns: boolean
          }
      validate_payment_cache_consistency: {
        Args: never
        Returns: {
          actual_value: number
          cache_value: number
          difference: number
          entity_id: string
          entity_type: string
          field_name: string
        }[]
      }
      validate_sale_stock: {
        Args: { p_items_array: Json }
        Returns: {
          error_message: string
          insufficient_items: Json
          is_valid: boolean
        }[]
      }
      validate_stock_operation: {
        Args: { p_item_id: string; p_quantity: number }
        Returns: boolean
      }
    }
    Enums: {
      entry_type_enum: "clock_in" | "clock_out" | "break_start" | "break_end"
      payment_status:
        | "INITIATED"
        | "AUTHORIZED"
        | "SUBMITTED_FOR_SETTLEMENT"
        | "SETTLING"
        | "SETTLED"
        | "VOIDED"
        | "REFUND_PENDING"
        | "REFUNDED"
        | "CHARGEBACK_PENDING"
        | "CHARGEDBACK"
        | "FAILED"
      payment_transaction_type: "PAYMENT" | "REFUND" | "CHARGEBACK"
      pos_async_status:
        | "pending"
        | "processing"
        | "completed"
        | "failed"
        | "cancelled"
        | "retry"
      pos_entity_type:
        | "order"
        | "sale"
        | "table"
        | "party"
        | "analytics"
        | "payment"
        | "kitchen"
      pos_operation_type:
        | "calculate_totals"
        | "update_analytics"
        | "sync_inventory"
        | "generate_receipt"
        | "update_metrics"
        | "process_payment"
        | "update_kitchen_status"
        | "send_notification"
      pos_order_status:
        | "pending"
        | "confirmed"
        | "preparing"
        | "ready"
        | "served"
        | "completed"
        | "cancelled"
      pos_payment_status:
        | "pending"
        | "processing"
        | "authorized"
        | "completed"
        | "failed"
        | "refunded"
        | "partially_paid"
      shift_preference_enum: "morning" | "afternoon" | "night" | "flexible"
      shift_status_enum:
        | "scheduled"
        | "confirmed"
        | "completed"
        | "missed"
        | "cancelled"
      sync_status_enum: "pending" | "syncing" | "synced" | "failed"
      training_type_enum:
        | "certification"
        | "course"
        | "workshop"
        | "safety"
        | "compliance"
      user_role:
        | "CLIENTE"
        | "OPERADOR"
        | "SUPERVISOR"
        | "ADMINISTRADOR"
        | "SUPER_ADMIN"
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
      entry_type_enum: ["clock_in", "clock_out", "break_start", "break_end"],
      payment_status: [
        "INITIATED",
        "AUTHORIZED",
        "SUBMITTED_FOR_SETTLEMENT",
        "SETTLING",
        "SETTLED",
        "VOIDED",
        "REFUND_PENDING",
        "REFUNDED",
        "CHARGEBACK_PENDING",
        "CHARGEDBACK",
        "FAILED",
      ],
      payment_transaction_type: ["PAYMENT", "REFUND", "CHARGEBACK"],
      pos_async_status: [
        "pending",
        "processing",
        "completed",
        "failed",
        "cancelled",
        "retry",
      ],
      pos_entity_type: [
        "order",
        "sale",
        "table",
        "party",
        "analytics",
        "payment",
        "kitchen",
      ],
      pos_operation_type: [
        "calculate_totals",
        "update_analytics",
        "sync_inventory",
        "generate_receipt",
        "update_metrics",
        "process_payment",
        "update_kitchen_status",
        "send_notification",
      ],
      pos_order_status: [
        "pending",
        "confirmed",
        "preparing",
        "ready",
        "served",
        "completed",
        "cancelled",
      ],
      pos_payment_status: [
        "pending",
        "processing",
        "authorized",
        "completed",
        "failed",
        "refunded",
        "partially_paid",
      ],
      shift_preference_enum: ["morning", "afternoon", "night", "flexible"],
      shift_status_enum: [
        "scheduled",
        "confirmed",
        "completed",
        "missed",
        "cancelled",
      ],
      sync_status_enum: ["pending", "syncing", "synced", "failed"],
      training_type_enum: [
        "certification",
        "course",
        "workshop",
        "safety",
        "compliance",
      ],
      user_role: [
        "CLIENTE",
        "OPERADOR",
        "SUPERVISOR",
        "ADMINISTRADOR",
        "SUPER_ADMIN",
      ],
    },
  },
} as const
