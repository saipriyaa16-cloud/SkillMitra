import { supabase } from "./supabase";

export const signUpUser = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  return { data, error };
};

export const signInUser = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { data, error };
};

export const ensureUserProfile = async (user, role) => {
  if (!user) {
    return { error: new Error("No authenticated user found.") };
  }

  const { data: existingProfile, error: profileCheckError } =
    await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

  if (profileCheckError) {
    return { error: profileCheckError };
  }

  if (!existingProfile) {
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        full_name: user.email?.split("@")[0] || "Skill Mitra User",
        email: user.email,
        role,
      });

    if (profileError) {
      return { error: profileError };
    }
  }

  if (role === "student") {
    const { data: existingStudent, error: studentCheckError } =
      await supabase
        .from("student_profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

    if (studentCheckError) {
      return { error: studentCheckError };
    }

    if (!existingStudent) {
      const { error: studentError } = await supabase
        .from("student_profiles")
        .insert({
          id: user.id,
        });

      if (studentError) {
        return { error: studentError };
      }
    }
  }

  return { error: null };
};

export const signOutUser = async () => {
  const { error } = await supabase.auth.signOut();

  return { error };
};