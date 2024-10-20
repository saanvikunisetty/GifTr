import { createBrowserRouter } from "react-router-dom";

import Layout from "./Layout";
import Market from "./Market";
import Wallet from "./Wallet";
import Login from "./Login";
import Error from "./Error";

export const router = createBrowserRouter([
  {
  	path: "/",
  	element: <Layout />,
  	children: [
        {
            path: "login",
            element: <Login />
        },
  		{
            path: "market",
            element: <Market />
        },
        {
            path: "wallet",
            element: <Wallet />
        },
        {
            path: "",
            element: <Login />
        },
        {
            path: "*",
            element: <Error />
        }
  	],
  },
]);