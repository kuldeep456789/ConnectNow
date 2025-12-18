import styled, { keyframes } from "styled-components";

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
`;

export const CallContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.9);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  animation: ${fadeIn} 0.3s ease-out;
`;

export const VideoGrid = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  padding: 40px;
  position: relative;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
  }
`;

export const VideoWrapper = styled.div`
  position: relative;
  background: #1a1a1a;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
`;

export const Video = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scaleX(-1); 
`;

export const Label = styled.div`
  position: absolute;
  top: 15px;
  left: 15px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
`;

export const GestureOverlay = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(100, 108, 255, 0.8);
  color: white;
  padding: 10px 20px;
  border-radius: 30px;
  font-weight: bold;
  font-size: 1.2rem;
  box-shadow: 0 4px 15px rgba(100, 108, 255, 0.4);
  backdrop-filter: blur(10px);
`;

export const Controls = styled.div`
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  background: rgba(0, 0, 0, 0.5);
`;

export const ControlButton = styled.button<{ color?: string }>`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: none;
  background: ${props => props.color || "rgba(255, 255, 255, 0.1)"};
  color: white;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: scale(1.1);
    background: ${props => (props.color ? "rgba(255, 77, 77, 0.8)" : "rgba(255, 255, 255, 0.2)")};
  }
`;

export const RobotGuide = styled.div`
  position: absolute;
  top: 80px;
  right: 40px;
  width: 280px;
  background: rgba(18, 18, 18, 0.95);
  border: 1px solid rgba(100, 108, 255, 0.3);
  border-radius: 12px;
  padding: 15px;
  color: white;
  z-index: 100;
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  animation: ${fadeIn} 0.2s ease-out;

  h4 {
    margin: 0 0 12px 0;
    color: #646cff;
    font-size: 1rem;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .guide-item {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 10px;
    font-size: 0.85rem;
    
    span {
      font-size: 1.2rem;
      width: 25px;
    }

    b {
      color: #646cff;
    }
  }

  .hint {
    margin-top: 15px;
    font-size: 0.75rem;
    color: #888;
    font-style: italic;
    border-top: 1px solid rgba(255,255,255,0.1);
    padding-top: 10px;
  }
`;
