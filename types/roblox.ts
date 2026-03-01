export interface RobloxItem {
  id: string;
  name: string;
  price: string;
  description: string;
  icon: string;
  url: string;
}

export interface GroupInfo {
  name: string;
  icon: string;
}

export const GROUP_INFO: GroupInfo = {
  name: '7B Store',
  icon: '/group-icon.png',
};
