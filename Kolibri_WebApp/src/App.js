import Login from './components/auth/login';
import Register from './components/auth/register';

import Header from './components/header';
import Home from './components/home';

import { AuthProvider } from './contexts/authContext';
import { useRoutes } from 'react-router-dom';

function App() {
  const routesArray = [
    {
      path: '*',
      element: <div>not logged in</div>,
    },
    {
      path: '/login',
      element: <Login />,
    },
    {
      path: '/register',
      element: <Register />,
    },
    {
      path: '/home',
      element: <Home />,
    },
  ];
  let routesElement = useRoutes(routesArray);
  return (
    <AuthProvider>
      <Header />
      <div className='routes_container'>{routesElement}</div>
    </AuthProvider>
  );
}

export default App;
