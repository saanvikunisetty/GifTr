import { Outlet } from "react-router-dom";

function Layout() {
    return (
        <>
            <p>This is a Header.</p>
            <Outlet />
            <p>This is a Footer.</p>
        </>
    );
}

export default Layout;