import { Metadata } from "next";
import { FC, ReactNode } from "react";

interface PlayLayoutProps {
  children: ReactNode;
}

export const metadata: Metadata = {
  title: "Play Area",
  description: "Interactive play area for 3D scenes",
};

const PlayLayout: FC<PlayLayoutProps> = ({ children }) => {
  return <>{children}</>;
}

export default PlayLayout;