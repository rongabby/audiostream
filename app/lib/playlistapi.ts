import { supabase } from './supabase';

// Get all active (public) playlists
export const getPublicPlaylists = async () => {
    const { data, error } = await supabase
        .from('playlists')
        .select('*')
        .eq('is_active', true);

    if (error) console.error('Error fetching playlists:', error);
    return data;
};

// Get all playlists (for admin/user)
// Download (fetch) a playlist by ID
export const downloadPlaylist = async (playlistId: string) => {
    const { data, error } = await supabase
        .from('playlists')
        .select('*')
        .eq('id', playlistId)
        .single();

    if (error) console.error('Error downloading playlist:', error);
    return data;
};

// Get all playlists (for admin/user)
export const getUserPlaylists = async () => {
    const { data, error } = await supabase
        .from('playlists')
        .select('*');

    if (error) console.error('Error fetching user playlists:', error);
    return data;
};

// Search public playlists by keyword in name or description
export const searchPublicPlaylists = async (keyword: string) => {
    const { data, error } = await supabase
        .from('playlists')
        .select('*')
        .eq('is_active', true)
        .or(`name.ilike.%${keyword}%,description.ilike.%${keyword}%`);

    if (error) console.error('Error searching playlists:', error);
    return data;
};

// Create a new playlist
export const createPlaylist = async (name: string, description: string) => {
    // Get the current user's ID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        console.error('No user is signed in');
        return null;
    }

    const { data, error } = await supabase
        .from('playlists')
        .insert([
            { name, description, is_active: false, user_id: user.id }
        ])
        .select();

    if (error) console.error('Error creating playlist:', error);
    return data;
};