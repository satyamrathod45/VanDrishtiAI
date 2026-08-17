import {
  Activity,
  AlertTriangle,
  Camera,
} from "lucide-react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";


// ============================================================
// VanDrishti Bottom Navigation
// ============================================================
//
// IMPORTANT:
// Review pages are NOT primary navigation destinations.
//
// The two human-review workflows are:
//
// /processing/review/image
// /processing/review/tiger-id
//
// They are accessed through the Processing workflow.
//
// This keeps the bottom navigation focused on the
// Forest Officer's primary destinations.
// ============================================================

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
        z-50
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
            // ACTIVE STATE
            // ==================================================
            //
            // Tiger Profile:
            //
            // /tigers/TGR-024
            //
            // should still keep "Tigers" active.
            //
            // Processing and Review pages intentionally
            // do NOT activate any bottom-nav item.
            // ==================================================

            const isActive =
              item.path === "/tigers"
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
                  min-w-[62px]
                  flex-col
                  items-center
                  justify-center
                  gap-1
                  rounded-[17px]
                  px-3
                  py-2.5
                  transition-all
                  duration-200

                  sm:min-w-[78px]

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
// lucide-react doesn't provide a Tiger icon,
// so we use the emoji instead of importing a non-existent
// "Tiger" icon from lucide-react.
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