export interface ICardItem {
  id: string | number;
  title: string;
  description: string;
  cover: string;
  user: {
    avatar: string;
  };
} 