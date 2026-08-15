import {
  Activity,
  AlertTriangle,
  Camera,
  ScanLine,
} from "lucide-react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";


const navigationItems = [
  {
    label: "Overview",
    path: "/overview",
    icon: Activity,
  },

  {
    label: "Tigers",
    path: "/tigers",
    icon: TigerIcon,
  },

  {
    label: "Cameras",
    path: "/cameras",
    icon: Camera,
  },

  {
    label: "Review",
    path: "/review",
    icon: ScanLine,
  },

  {
    label: "Alerts",
    path: "/alerts",
    icon: AlertTriangle,
  },
];


export default function BottomNavigation() {

  const navigate =
    useNavigate();

  const location =
    useLocation();


  return (
    <nav className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2">

      <div className="flex items-center gap-1 rounded-[23px] border border-white/70 bg-white/70 p-2 shadow-[0_18px_50px_rgba(0,0,0,0.12)] backdrop-blur-2xl">

        {navigationItems.map(
          (item) => {

            const Icon =
              item.icon;


            /*
             * Tiger Profile should still highlight
             * "Tigers" in the bottom navigation.
             *
             * Example:
             *
             * /tigers/TGR-024
             *
             * should keep Tigers active.
             */

            const isActive =
              item.path ===
              "/tigers"
                ? location.pathname.startsWith(
                    "/tigers"
                  )
                : location.pathname ===
                  item.path;


            return (
              <button
                key={item.label}
                type="button"
                onClick={() =>
                  navigate(
                    item.path
                  )
                }
                className={`
                  group
                  relative
                  flex
                  min-w-[58px]
                  flex-col
                  items-center
                  justify-center
                  gap-1
                  rounded-[17px]
                  px-3
                  py-2.5
                  transition-all
                  duration-200
                  sm:min-w-[76px]

                  ${
                    isActive
                      ? "bg-[#171717] text-white shadow-[0_6px_18px_rgba(0,0,0,0.16)]"
                      : "text-[#888] hover:bg-white/80 hover:text-[#222]"
                  }
                `}
              >

                <Icon
                  size={17}
                  className={
                    isActive
                      ? "text-[#ef7d16]"
                      : "transition-colors group-hover:text-[#e97813]"
                  }
                />

                <span className="text-[8px] font-medium sm:text-[9px]">
                  {item.label}
                </span>

              </button>
            );
          }
        )}

      </div>

    </nav>
  );
}


function TigerIcon() {
  return (
    <span className="text-[16px] leading-none">
      🐅
    </span>
  );
}