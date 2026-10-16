import { useRoutes } from 'react-router-dom'

import Home from '../pages/home/Home'

// Businesses
import MyBusinesses from '../pages/businesses/my-businesses/MyBusinesses'
import MyBranch from '../pages/businesses/my-branch/MyBranch'


// User
import BusinessesProfile from '../pages/user/businesses-profile/BusinessesProfile'
import ShipperProfile from '../pages/user/shipper-profile/ShipperProfile'
import MyOrder from '../pages/user/my-order/MyOrder'

import Introduce from '../pages/user/businesses-detail/introduce/Introduce'


// Layout
import Layout from '../components/layout/layout/Layout'
import BranchLayout from '../components/layout/branch-layout/BranchLayout'
import BusinessesDetailLayout from '../components/layout/businesses-detail-layout/BusinessesDetaillayout'
function AppRouter() {
  const routes = useRoutes([
    {
      element: <Layout />,
      children: [
          // --- PUBLIC ROUTES ---
          {path: '/', element: <Home />},

          { path: '/quan-cua-toi', element: <MyBusinesses/>},
          { path: '/chi-nhanh-cua-toi', element: <MyBranch/>},
          { path: '/chi-tiet-quan',
            element: <BusinessesDetailLayout/>,
            children: [
              {
                index:true,
                element: <Introduce/>,
              },
            ]
           },
          { path: '/don-hang-cua-toi', element: <MyOrder/>},
          { path: '/dang-ky-ho-so-quan', element: <BusinessesProfile/>},
          { path: '/dang-ky-ho-so-giao-hang', element: <ShipperProfile/>},
      ]
    }
  ]);

  return routes;
}

export default AppRouter;