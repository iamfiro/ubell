import { createBrowserRouter } from "react-router-dom";

import { BISOnboardPage, BISServicePage } from "@/pages";

export const router = createBrowserRouter([
  {
    path: "/bis",
    element: <BISOnboardPage />,
    children: [
      {
        path: "/bis/:cityCode/:stationId",
        element: <BISServicePage />,
      },
    ],
  },
  {
    path: "/sis",
    element: <div>Sis</div>,
  },
]);
