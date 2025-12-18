import styled from "styled-components";
import { getInitials } from "../../library";
import { color } from "../../library/color";

type AvatarProps = {
    src?: string | null;
    name?: string;
    size?: string;
    className?: string;
    onClick?: () => void;
    style?: React.CSSProperties;
};


const getAvatarColor = (name: string) => {
    const colors = [
        "#F44336", "#E91E63", "#9C27B0", "#673AB7", "#3F51B5",
        "#2196F3", "#03A9F4", "#00BCD4", "#009688", "#4CAF50",
        "#8BC34A", "#CDDC39", "#FFC107", "#FF9800", "#FF5722",
        "#795548", "#607D8B"
    ];
    if (!name) return colors[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

const Container = styled.div<{ $size: string; $bgColor: string }>`
  width: ${({ $size }) => $size};
  height: ${({ $size }) => $size};
  min-width: ${({ $size }) => $size};
  min-height: ${({ $size }) => $size};
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $bgColor }) => `linear-gradient(135deg, ${$bgColor} 0%, ${adjustColor($bgColor, -20)} 100%)`};
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  color: ${color.white};
  font-weight: 600;
  font-size: ${({ $size }) => `calc(${$size} / 2.5)`};
  user-select: none;
  border: 1px solid rgba(255,255,255,0.1);
  cursor: pointer;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;


const adjustColor = (color: string, amount: number) => {
    return '#' + color.replace(/^#/, '').replace(/../g, color => ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
}

export const Avatar = ({ src, name = "?", size = "40px", className, onClick, style }: AvatarProps) => {
    const initials = getInitials(name);
    const bgColor = getAvatarColor(name);

    return (
        <Container className={className} $size={size} $bgColor={bgColor} onClick={onClick} style={style}>
            {src ? (
                <img src={src} alt={name} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            ) : (
                <span>{initials}</span>
            )}
        </Container>
    );
};
