import styled from "styled-components";
import { StyledProps, color } from "../../../library";

export const Container = styled.div`
  padding: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  @media screen and (max-width: 565px) {
    flex-direction: column;
    text-align: center;
  }
`;

export const Wrapper = styled.div`
  padding: 15px;
`;

export const Image = styled.img`
  border-radius: 50%;
  width: 80px;
`;

export const AvatarPlaceholder = styled.div<{ theme: string }>`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: ${({ theme }) =>
    theme === "light" ? color.lightMode.border : color.darkMode.border};
  color: ${({ theme }) =>
    theme === "light" ? color.lightMode.title : color.darkMode.title};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
`;

export const Thick = styled.span`
  font-weight: 600;
  padding-right: 5px;
`;

export const Text = styled.p<StyledProps>`
  line-height: 2;
  color: ${({ theme }) =>
    theme === "light" ? color.lightMode.text : color.darkMode.title};
  @media screen and (max-width: 565px) {
    font-size: 0.9rem;
  }
`;

export const Info = styled.p`
  margin: 0 auto;
  padding: 0 20px 20px;
  text-align: center;
  color: #666;
  font-size: 0.9rem;
  width: 100%;
  @media screen and (max-width: 565px) {
    font-size: 0.9rem;
  }
`;

export const EditButton = styled.button<StyledProps>`
  background-color: ${color.primary};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  margin: 10px auto;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  display: block;
  transition: all 0.2s;
  &:hover {
    opacity: 0.9;
  }
`;

export const Input = styled.input<StyledProps>`
  width: 100%;
  padding: 10px;
  margin: 8px 0;
  border: 1px solid ${({ theme }) =>
    theme === "light" ? color.lightMode.border : color.darkMode.border};
  border-radius: 8px;
  background-color: ${({ theme }) =>
    theme === "light" ? color.lightMode.background : color.darkMode.background};
  color: ${({ theme }) =>
    theme === "light" ? color.lightMode.text : color.darkMode.text};
  font-size: 0.9rem;
  &:focus {
    outline: none;
    border-color: ${color.primary};
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 15px;
`;

export const SaveButton = styled.button`
  background-color: ${color.primary};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 20px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.2s;
  &:hover {
    opacity: 0.9;
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const CancelButton = styled.button<StyledProps>`
  background-color: transparent;
  color: ${({ theme }) =>
    theme === "light" ? color.lightMode.text : color.darkMode.text};
  border: 1px solid ${({ theme }) =>
    theme === "light" ? color.lightMode.border : color.darkMode.border};
  border-radius: 8px;
  padding: 8px 20px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.2s;
  &:hover {
    background-color: ${({ theme }) =>
    theme === "light" ? color.lightMode.border : color.darkMode.border};
  }
`;

export const AvatarContainer = styled.div`
  position: relative;
  display: inline-block;
`;

export const UploadButton = styled.label`
  background-color: ${color.primary};
  color: white;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: absolute;
  bottom: 0;
  right: 0;
  font-size: 1.2rem;
  transition: all 0.2s;
  &:hover {
    opacity: 0.9;
  }
`;


export const RemoveButton = styled.button`
  background-color: #ff4d4d;
  color: white;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: absolute;
  bottom: 0;
  left: 0;
  font-size: 1rem;
  border: none;
  transition: all 0.2s;
  &:hover {
    background-color: #ff0000;
  }
`;
