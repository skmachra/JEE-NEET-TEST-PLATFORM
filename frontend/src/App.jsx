import React from 'react';
import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from 'react-router-dom';
import Layout from './Layout';
import Home from "./pages/Home";
import Test from './pages/Test';
import Login from './pages/Login';
import Register from './pages/Register';
import Bookmark from './pages/Bookmark';
import Forgot from './pages/Forgot';
import TestDetailsPage from './pages/TestTakingPage';
import TestHistory from './pages/TestHistory';
import Admin from './admin/Admin';
import CreateTest from './admin/CreateTest';
import UploadQuestion from './admin/UploadQuestion';
import Tests from './admin/Tests';
import UpdateTest from './admin/UpdateTest';
import Question from './admin/Question';
import UpdateQuestion from './admin/UpdateQuestion';
import AdminRoute from './admin/AdminRoute';
import LoginRoute from './pages/LoggedIn';
import Dashboard from './pages/Dashboard';


function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route element={<LoginRoute />} >
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/bookmark' element={<Bookmark />} />
          <Route path='/test/:id' element={<TestDetailsPage />} />
          <Route path='/test/history/:id' element={<TestHistory />} />
        </Route>
        <Route path='/test' element={<Test />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/forgot-password' element={<Forgot />} />
        <Route element={<AdminRoute />}>
          <Route path='/admin' element={<Admin />} />
          <Route path='/admin/tests' element={<Tests />} />
          <Route path='/admin/create-test' element={<CreateTest />} />
          <Route path='/admin/update-test/:id' element={<UpdateTest />} />
          <Route path='/admin/questions' element={<Question />} />
          <Route path='/admin/upload-question' element={<UploadQuestion />} />
          <Route path='/admin/update-question/:id' element={<UpdateQuestion />} />
        </Route>
      </Route>
    )
  );

  return (
    <RouterProvider router={router} />
  );
}

export default App;
