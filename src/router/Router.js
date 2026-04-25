import { CreatePostScreen } from '../screens/main/post';
import { MessageDetailScreen } from '../screens/main/message/detail';


const Routers = [
  {
    name: "CreatePost",
    component: CreatePostScreen,
    isModal: true, // Đánh dấu là modal screen
  },
  {
    name: "MessageDetail",
    component: MessageDetailScreen,
  }
];

export { Routers };