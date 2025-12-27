import { Outlet } from "react-router-dom";
import { Sidebar } from "../Sidebar/Sidebar";
import styled from "styled-components";

const LayoutWrapper = styled.div`
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
`;

const ContentArea = styled.main`
  flex: 1;
  height: 100%;
  overflow: hidden;
  position: relative;
`;

export const MainLayout = () => {
    return (
        <LayoutWrapper>
            <Sidebar />
            <ContentArea>
                <Outlet />
            </ContentArea>
        </LayoutWrapper>
    );
};
