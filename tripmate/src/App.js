import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/common/Header';
import Footer from './components/main/Footer';
import MainPage from './pages/MainPage';
import LoginPage from './pages/LoginPage';
import SignUp from './pages/SignUp';
//import Travel from './pages/Travel';
import Mypage from './pages/Mypage'; // Mypage 컴포넌트 import

import ScheduleDetail from './pages/ScheduleDetail'; // ScheduleDetail 컴포넌트 import
import { AuthProvider } from './context/AuthContext';
import StartPlanner from './pages/StartPlannerPage';
import StartPlannerPage from './pages/StartPlannerPage';
import PlannerPage from './pages/SearchPage';
import SchedulePage from './pages/SchedulePage';
import MySchedulePage from './pages/MySchedulePage';
import SharedTripsPage from './pages/SharedTripsPage';


function App() {
  return (
    <Router>
      <AuthProvider>
        <Header />
        <main>
          <Routes>
            <Route path="/startPlanner" element={<StartPlannerPage />} />
            <Route path="/planner" element={<PlannerPage />} />
            <Route path='/schedule' element={<SchedulePage />} />
            <Route path='/my-schedule' element={<MySchedulePage />} />
            <Route path="/myschedule/:scheduleId" element={<MySchedulePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/" element={<MainPage />} />
            <Route path="/user/:userId" element={<Mypage />} />
            <Route path="/schedule/:id" element={<ScheduleDetail />} /> 
            <Route path='/travel' element={<SharedTripsPage/>}/>
            
          </Routes>
        </main>
        <Footer />
      </AuthProvider>
    </Router>
  );
}

export default App;

