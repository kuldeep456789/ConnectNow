import styled from "styled-components";
import { StyledProps, color } from "../../../library";
import { Link } from "react-router-dom";

export const Header = styled.div<StyledProps>`
  height: 84px;
  display: flex;
  padding: 0 20px;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid
    ${({ theme }) =>
    theme === "light" ? color.lightMode.border : color.darkMode.border};
  background-color: ${({ theme }) =>
    theme === "light" ? color.lightMode.background : color.darkMode.background};
`;
export const Name = styled.p<StyledProps>`
  font-weight: 500;
  margin-left: 15px;
  color: ${({ theme }) =>
    theme === "light" ? color.lightMode.title : color.darkMode.title};
`;

export const Wrapper = styled.div`
  display: flex;
  align-items: center;
`;

export const HomeLink = styled(Link) <StyledProps>`
  display: flex;
  font-size: 1.4rem;
  margin-right: 20px;
  color: ${({ theme }) =>
    theme === "light" ? color.lightMode.text : color.darkMode.text};
`;

export const Relative = styled.div`
  margin: 0 15px;
  position: relative;
  padding-right: 10px;
`;

export const SettingButton = styled.button<StyledProps>`
  border: none;
  display: flex;
  font-size: 1.5rem;
  margin-left: 30px;
  color: ${({ theme }) =>
    theme === "light" ? color.lightMode.text : color.darkMode.text};
  background-color: transparent;
`;

export const GroupButton = styled.button<StyledProps>`
  border: none;
  display: flex;
  font-size: 2rem;
  margin-left: 30px;
  color: ${({ theme }) =>
    theme === "light" ? color.lightMode.text : color.darkMode.text};
  background-color: transparent;
`;

export const VideoButton = styled.button<StyledProps>`
  border: none;
  display: flex;
  font-size: 1.8rem;
  margin-left: 30px;
  color: ${({ theme }) =>
    theme === "light" ? color.lightMode.text : color.darkMode.text};
  background-color: transparent;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.7;
  }
`;

export const Email = styled.p<StyledProps>`
  font-size: 0.8rem;
  margin-left: 15px;
  margin-top: 2px;
  color: ${({ theme }) =>
    theme === "light" ? color.lightMode.text : color.darkMode.text};
  opacity: 0.7;
`;
