import { supabase } from "@/integrations/supabase/client";

/**
 * Check if a feature flag is enabled
 * @param flagName The name of the feature flag
 * @returns Promise<boolean> whether the flag is enabled
 */
export async function isFeatureFlagEnabled(flagName: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('feature_flags')
      .select('enabled')
      .eq('flag_name', flagName)
      .single();

    if (error) {
      console.error(`Error checking feature flag ${flagName}:`, error);
      return false;
    }

    return data?.enabled || false;
  } catch (error) {
    console.error(`Error checking feature flag ${flagName}:`, error);
    return false;
  }
}

/**
 * Feature flag constants
 */
export const FEATURE_FLAGS = {
  ORDER_CONFIRMATION_ENABLED: 'ORDER_CONFIRMATION_ENABLED'
} as const;