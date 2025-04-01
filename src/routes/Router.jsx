import React from "react";
import { createBrowserRouter } from "react-router-dom";
import Login from '../pages/Login';
import Layout from "../layout/Layout";
import Home from "../pages/Home";

export const router = createBrowserRouter([
    {
        path: '/',
        element: <Login/>
    },
    {
        path: '/home',
        element: <Layout/>,
        children: [
            {
                path: ':userId',
                element: <Home/>
            }
        ]
    }
])