import React from "react";
import { createBrowserRouter } from "react-router-dom";
import Login from '../pages/Login';
import Layout from "../layout/Layout";
import Home from "../pages/Home";
import Profile from "../pages/Profile";
import NoteDetail from "../pages/NoteDetails";

export const router = createBrowserRouter([
    {
        path: '/',
        element: <Login/>
    },
    {
        path: '/home/:userId',
        element: <Layout/>,
        children: [
            {
                index: true,
                element: <Home/>
            }
        ]
    },
    {
        path: '/notes/:noteId',
        element: <Layout/>,
        children: [
            {
                index: true,
                element: <NoteDetail/>
            }
        ]
    },
    {
        path: '/profile/:userId',
        element: <Layout/>,
        children: [
            {
                index: true,
                element: <Profile/>
            }
        ]
    }
])