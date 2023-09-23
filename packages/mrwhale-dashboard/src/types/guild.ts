export interface Guild {
  id: string;
  name: string;
  icon: string;
  owner: boolean;
  channels: Channel[];
  isInvited: boolean;
}

interface Channel {
  id: string;
  name: string;
}
