import { useRoutes } from 'react-router-dom'

import Home from '../pages/home/Home'

// Admin
import ProfileModeration from '../pages/admin/profile-moderation/ProfileModeration'

// Businesses
import MyBusinesses from '../pages/businesses/my-businesses/MyBusinesses'
import InfoBusinesses from '../pages/businesses/info-businesses/InfoBusinesses'
import ManagerEmployee from '../pages/businesses/manage-employee/ManageEmployee'
import ManageBooking from '../pages/businesses/manage-booking/ManageBooking'
import ManageMenu from '../pages/businesses/manage-menu/ManageMenu'
import ManageOrder from '../pages/businesses/manage-order/ManageOrder'


// User
import BusinessesProfile from '../pages/user/businesses-profile/BusinessesProfile'
import ShipperProfile from '../pages/user/shipper-profile/ShipperProfile'
import MyOrder from '../pages/user/my-order/MyOrder'
import Introduce from '../pages/user/businesses-detail/introduce/Introduce'
import Menu from '../pages/user/businesses-detail/menu/Menu'
import Evaluate from '../pages/user/businesses-detail/evaluate/Evaluate'
import Delivery from '../pages/shipper/delivery/Delivery'
import Search from '../pages/user/search/Search'
import Food from '../pages/user/food/Food'
import Favorite from '../pages/user/favorite/Favorite'


// Layout
import Layout from '../components/layout/layout/Layout'
import ManagerLayout from '../components/layout/manage-layout/ManageLayout'
import BusinessesDetailLayout from '../components/layout/businesses-detail-layout/BusinessesDetaillayout'

function AppRouter() {
  const routes = useRoutes([
    {
      element: <Layout />,
      children: [
          // --- PUBLIC ROUTES ---
          {path: '/', element: <Home />},
          { path: '/thuc-don', element: <Menu/>},
          { path: '/food&drink', element: <Food/>},
          { path: '/don-hang-cua-toi', element: <MyOrder/>},
          { path: '/giao-hang', element:<Delivery/>},
          { path: '/dang-ky-ho-so-quan', element: <BusinessesProfile/>},
          { path: '/dang-ky-ho-so-giao-hang', element: <ShipperProfile/>},
          { path: '/tim-kiem', element: <Search/>},
          { path: '/yeu-thich', element: <Favorite/>},
          { path: '/quan-cua-toi', element: <MyBusinesses/>},
          { path: '/thong-tin-chi-tiet-quan/:businessId',
            element: <BusinessesDetailLayout/>,
            children: [
              {
                index:true,
                element: <Introduce/>,
              },
              { path: 'thuc-don', element: <Menu/>},
              { path: 'danh-gia', element: <Evaluate/>},
            ]
          },

          { path: '/thong-tin-quan/:id',
            element: <ManagerLayout/>,
            children: [
              {
                index: true,
                element: <ManageMenu/>
              },
              { path: 'thong-tin-quan', element: <InfoBusinesses/>},
              { path: 'quan-ly-thuc-don', element: <ManageMenu/>},
              { path: 'quan-ly-dat-cho', element: <ManageBooking/>},
              { path: 'quan-ly-don-hang', element: <ManageOrder/>},
              { path: 'quan-ly-nhan-vien', element: <ManagerEmployee/>},
              { path: 'danh-gia-va-phan-hoi', element: <Evaluate/>}
            ]
          },

          { path: '/quan-tri-he-thong',
            children: [
              {
                index: true,
                element: <ProfileModeration/>
              },
            ]
          },
      ]
    }
  ]);

  return routes;
}

export default AppRouter;