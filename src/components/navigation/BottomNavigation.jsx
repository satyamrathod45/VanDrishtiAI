import {
  Activity,
  AlertTriangle,
  Camera,
  Map,
} from "lucide-react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";


// ============================================================
// VanDrishti Primary Navigation
// ============================================================
//
// Primary destinations:
//
// Overview
// Spatial Intelligence
// Tigers
// Cameras
// Alerts
//
// Human review pages are intentionally NOT included here.
//
// Review workflows are entered from Processing / task cards.
// ============================================================

const navigationItems = [

  {
    label: "Overview",
    path: "/overview",
    icon: Activity,
  },

  {
    label: "Spatial",
    path: "/spatial",
    icon: Map,
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

    <nav
      className="
        fixed
        bottom-5
        left-1/2
        z-[9999]
        -translate-x-1/2
      "
    >

      <div
        className="
          flex
          items-center
          gap-1
          rounded-[23px]
          border
          border-white/70
          bg-white/70
          p-2
          shadow-[0_18px_50px_rgba(0,0,0,0.12)]
          backdrop-blur-2xl
        "
      >

        {navigationItems.map(
          (item) => {

            const Icon =
              item.icon;


            // ==================================================
            // ACTIVE NAVIGATION
            // ==================================================
            //
            // /tigers/TGR-024
            // should keep Tigers highlighted.
            //
            // /spatial
            // and any future /spatial/* route should keep
            // Spatial highlighted.
            // ==================================================

            const isActive =
              item.path === "/tigers"
                ? location.pathname.startsWith(
                    "/tigers"
                  )
                : item.path === "/spatial"
                  ? location.pathname.startsWith(
                      "/spatial"
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
                      ? `
                        bg-[#171717]
                        text-white
                        shadow-[0_6px_18px_rgba(0,0,0,0.16)]
                      `
                      : `
                        text-[#888]
                        hover:bg-white/80
                        hover:text-[#222]
                      `
                  }
                `}
              >

                <Icon
                  size={17}
                  className={`
                    ${
                      isActive
                        ? "text-[#ef7d16]"
                        : "transition-colors group-hover:text-[#e97813]"
                    }
                  `}
                />


                <span
                  className="
                    text-[8px]
                    font-medium
                    sm:text-[9px]
                  "
                >
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


// ============================================================
// TIGER ICON
// ============================================================
//
// lucide-react does not provide a Tiger icon.
// Keep this local instead of importing a non-existent icon.
// ============================================================

function TigerIcon() {

  return (

    <span
      className="
        text-[16px]
        leading-none
        transition-transform
        duration-200
        group-hover:scale-110
      "
    >
      🐅
    </span>

  );

}