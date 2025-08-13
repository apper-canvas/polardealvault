import "@/index.css";
import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import ActivityFeed from "@/components/pages/ActivityFeed";
import Layout from "@/components/organisms/Layout";
import TimeTracking from "@/components/pages/TimeTracking";
import TeamChat from "@/components/pages/TeamChat";
import TeamMembers from "@/components/pages/TeamMembers";
import TeamMemberDetail from "@/components/pages/TeamMemberDetail";
import Reports from "@/components/pages/Reports";
import Tasks from "@/components/pages/Tasks";
import Clients from "@/components/pages/Clients";
import ClientDetail from "@/components/pages/ClientDetail";
import Projects from "@/components/pages/Projects";
import ProjectDetail from "@/components/pages/ProjectDetail";
import MilestoneDetail from "@/components/pages/MilestoneDetail";
import Dashboard from "@/components/pages/Dashboard";
import Issues from "@/components/pages/Issues";
import IssueDetail from "@/components/pages/IssueDetail";
import TaskDetail from "@/components/pages/TaskDetail";
function App() {
  return (
<BrowserRouter>
      <Layout>
<Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/clients/:id" element={<ClientDetail />} />
<Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/projects/:projectId/milestones/:id" element={<MilestoneDetail />} />
<Route path="/tasks" element={<Tasks />} />
          <Route path="/tasks/:id" element={<TaskDetail />} />
          <Route path="/issues" element={<Issues />} />
          <Route path="/issues/:id" element={<IssueDetail />} />
          <Route path="/team" element={<TeamMembers />} />
          <Route path="/team/:id" element={<TeamMemberDetail />} />
<Route path="/chat" element={<TeamChat />} />
<Route path="/chat/:channelId" element={<TeamChat />} />
          <Route path="/time-tracking" element={<TimeTracking />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/activity-feed" element={<ActivityFeed />} />
        </Routes>
      </Layout>
      
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        className="z-50"
      />
    </BrowserRouter>
  );
}

export default App;