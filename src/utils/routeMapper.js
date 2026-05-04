import { ADMIN_ROUTES } from '../routes';

const allRoutes = [
  ...ADMIN_ROUTES
];

// Admin designation ID - shows all routes
const ADMIN_DESIGNATION_ID = '69aa5fb7f19750bbdf3de0d8';

export const getUserRoutes = (user) => {
  if (user?.designation?._id === ADMIN_DESIGNATION_ID) {
    return allRoutes
      .filter(route => !route.isHideMenu && route.path)
      .map((route, index) => ({
        ...route,
        order: index + 1
      }));
  }

  if (!user?.designation?.routes || !Array.isArray(user.designation.routes)) {
    return [];
  }

  const sortedRoutes = [...user.designation.routes].sort((a, b) => (a.order || 0) - (b.order || 0));

  return sortedRoutes.map((userRoute) => {
    if (!userRoute.path) return null;

    const matchedRoute = allRoutes.find(route => route.path === userRoute.path);
    
    if (matchedRoute && !matchedRoute.isHideMenu) {
      return {
        ...matchedRoute,
        title: userRoute.title || matchedRoute.nameKey,
        path: userRoute.path,
        order: userRoute.order
      };
    }

    return {
      id: userRoute._id || `route-${userRoute.order}`,
      nameKey: userRoute.title,
      path: userRoute.path,
      title: userRoute.title,
      order: userRoute.order,
      activeIcon: null,
      inActiveIcon: null,
      component: null,
      isHideMenu: false
    };
  }).filter(Boolean);
};
