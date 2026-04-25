import { supabase } from '../../libs/supabase';

// Lấy danh sách bài viết từ Supabase
export async function getAllPostsFromSupabase() {
  const { data, error } = await supabase
    .from('posts')
    .select('*, profiles(username, avatar_url)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching posts:', error);
    return null;
  }
  return data;
}

// Tạo bài viết mới để kích hoạt Webhook của n8n
export async function createPostInSupabase(authorId, content) {
  const { data, error } = await supabase
    .from('posts')
    .insert([
      { author_id: authorId, content: content }
    ])
    .select();

  if (error) {
    console.error('Error creating post:', error);
    return null;
  }
  return data;
}

// Cập nhật kết quả AI (Chỉ dùng khi test, thường n8n sẽ tự làm việc này)
export async function updatePostWithAIResult(postId, aiResult) {
  const { data, error } = await supabase
    .from('posts')
    .update({ ai_status: aiResult }) // Giả sử bạn thêm cột ai_status vào bảng posts
    .eq('id', postId)
    .select();

  if (error) {
    console.error('Error updating post:', error);
    return null;
  }
  return data;
}
