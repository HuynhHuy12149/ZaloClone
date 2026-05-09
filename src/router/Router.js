import { CreatePostScreen } from '../screens/main/post';
import { MessageDetailScreen } from '../screens/main/message/detail';
import PostDetailScreen from '../screens/main/home/post-detail/PostDetailScreen';


const Routers = [
  {
    name: "CreatePost",
    component: CreatePostScreen,
    isModal: true, // Đánh dấu là modal screen
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