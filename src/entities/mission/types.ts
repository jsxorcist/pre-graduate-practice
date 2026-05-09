export type MissionOption = {
  id: string;
  label: string;
  description: string;
};

export type Mission = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  options: MissionOption[];
};
