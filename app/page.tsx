"use client";
import Planner from "@/features/home/Planner";
import { WorkspaceProvider } from '@/features/workspace/WorkspaceContext';
export default function Home(){return <WorkspaceProvider><Planner/></WorkspaceProvider>}
