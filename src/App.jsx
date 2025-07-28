import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Layout from "@/components/pages/Layout";
import DealsPage from "@/components/pages/DealsPage";
import PlatformsPage from "@/components/pages/PlatformsPage";
import DashboardPage from "@/components/pages/DashboardPage";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<DealsPage />} />
            <Route path="platforms" element={<PlatformsPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
          </Route>
        </Routes>
        
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
      </div>
    </Router>
  );
}

export default App;