export const IMAGE_PROXY = (url: string) => {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("https")) return url;
  return `http:
};

export const FILE_ICON = (extension: string) =>
  `https:


export const DEFAULT_AVATAR = "";
export const RANDOM_AVATAR = "";


export const REACTIONS_UI: {
  [key: string]: {
    icon: string;
    gif: string;
  };
} = {
  Like: {
    icon: "/reactions/icon/like.svg",
    gif: "/reactions/gif/like.gif",
  },
  Love: {
    icon: "/reactions/icon/love.svg",
    gif: "/reactions/gif/love.gif",
  },
  Care: {
    icon: "/reactions/icon/care.svg",
    gif: "/reactions/gif/care.gif",
  },
  Haha: {
    icon: "/reactions/icon/haha.svg",
    gif: "/reactions/gif/haha.gif",
  },
  Wow: {
    icon: "/reactions/icon/wow.svg",
    gif: "/reactions/gif/wow.gif",
  },
  Sad: {
    icon: "/reactions/icon/sad.svg",
    gif: "/reactions/gif/sad.gif",
  },
  Angry: {
    icon: "/reactions/icon/angry.svg",
    gif: "/reactions/gif/angry.gif",
  },
};
