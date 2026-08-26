import { CreatePostScreen } from '@/screens/post';
import { MessageDetailScreen } from '@/screens/message/detail';
import PostDetailScreen from '@/screens/home/post-detail/PostDetailScreen';

const Routers = [
  {
    name: "CreatePost",
    component: CreatePostScreen,
    isModal: true,
  },
  {
    name: "MessageDetail",
    component: MessageDetailScreen,
  },
  {
    name: "PostDetail",
    component: PostDetailScreen,
  }
];

export { Routers };